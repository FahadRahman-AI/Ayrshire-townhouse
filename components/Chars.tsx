/** Per-character masked spans for staggered reveals (.char targets). */
export default function Chars({ text }: { text: string }) {
  return (
    <>
      {text.split('').map((c, i) => (
        <span className="mask mask--char" key={i} aria-hidden>
          <span className="mask__inner char">{c === ' ' ? ' ' : c}</span>
        </span>
      ))}
    </>
  )
}
