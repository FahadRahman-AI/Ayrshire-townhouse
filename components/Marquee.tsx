export default function Marquee({ items }: { items: string[] }) {
  const track = [...items, ...items] // duplicated for a seamless -50% loop
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee__track">
        {track.map((t, i) => (
          <span className="marquee__item" key={i}>{t}</span>
        ))}
      </div>
    </div>
  )
}
