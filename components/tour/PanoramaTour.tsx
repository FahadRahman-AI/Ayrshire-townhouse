'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { ROOMS } from '@/lib/tour'

const PITCH_LIMIT = 1 // radians, per spec
const DRAG_SENSITIVITY = 0.0028
const GLIDE = 14 // release momentum multiplier — how far the look coasts
const DAMP = 0.085 // lerp factor toward target rotation

interface RoomScene {
  scene: THREE.Scene
  geometry: THREE.SphereGeometry
  material: THREE.MeshBasicMaterial
  texture: THREE.Texture
}

function createRoomScene(loader: THREE.TextureLoader, src: string): RoomScene {
  const scene = new THREE.Scene()
  const geometry = new THREE.SphereGeometry(500, 60, 40)
  geometry.scale(-1, 1, 1) // render the panorama on the inside of the sphere
  const texture = loader.load(src)
  texture.colorSpace = THREE.SRGBColorSpace
  const material = new THREE.MeshBasicMaterial({ map: texture })
  scene.add(new THREE.Mesh(geometry, material))
  return { scene, geometry, material, texture }
}

function disposeRoomScene(room: RoomScene) {
  room.geometry.dispose()
  room.material.dispose()
  room.texture.dispose()
}

export default function PanoramaTour() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = mountRef.current!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.setSize(window.innerWidth, window.innerHeight)
    host.appendChild(renderer.domElement)

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1100)
    camera.rotation.order = 'YXZ' // yaw then pitch — no roll creep while dragging

    const loader = new THREE.TextureLoader()
    const room = createRoomScene(loader, ROOMS[0].panorama)

    // ── Drag-to-look with inertia ────────────────────────────────
    let yaw = ROOMS[0].startYaw
    let pitch = 0
    let targetYaw = yaw
    let targetPitch = 0
    let dragging = false
    let lastX = 0
    let lastY = 0
    let velYaw = 0
    let velPitch = 0

    const clampPitch = (v: number) => Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, v))

    const onDown = (e: PointerEvent) => {
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
      velYaw = 0
      velPitch = 0
      host.classList.add('is-dragging')
      renderer.domElement.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      // grab-the-world: drag right turns the view left
      velYaw = dx * DRAG_SENSITIVITY
      velPitch = dy * DRAG_SENSITIVITY
      targetYaw += velYaw
      targetPitch = clampPitch(targetPitch + velPitch)
    }
    const onUp = () => {
      if (!dragging) return
      dragging = false
      host.classList.remove('is-dragging')
      // fling: momentum carries the look, the damp lerp decelerates it
      targetYaw += velYaw * GLIDE
      targetPitch = clampPitch(targetPitch + velPitch * GLIDE)
    }

    const el = renderer.domElement
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    let raf = 0
    const tick = () => {
      const k = reduced ? 1 : DAMP
      yaw += (targetYaw - yaw) * k
      pitch += (targetPitch - pitch) * k
      camera.rotation.y = yaw
      camera.rotation.x = clampPitch(pitch)
      renderer.render(room.scene, camera)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      disposeRoomScene(room)
      renderer.dispose()
      host.removeChild(el)
    }
  }, [])

  return <div ref={mountRef} className="tour__stage" aria-label="360° room view — drag to look around" />
}
