import { pipeline } from '@huggingface/transformers'
import fs from 'node:fs'
import path from 'node:path'

const IMG_DIR = path.resolve('public/images')
const OUT_DIR = path.resolve('public/depth')
fs.mkdirSync(OUT_DIR, { recursive: true })

const files = fs.readdirSync(IMG_DIR).filter(f => /\.(jpe?g|png)$/i.test(f))
console.log(`Found ${files.length} images. Loading depth model…`)
const depth = await pipeline('depth-estimation', 'onnx-community/depth-anything-v2-small')
console.log('Model ready.')

for (const f of files) {
  const inPath = path.join(IMG_DIR, f)
  const outPath = path.join(OUT_DIR, f.replace(/\.(jpe?g|png)$/i, '.png'))
  const t0 = Date.now()
  const out = await depth(inPath)
  await out.depth.save(outPath)
  console.log(`  ✓ ${f} → depth/${path.basename(outPath)} (${Date.now()-t0}ms)`)
}
console.log('DONE')
