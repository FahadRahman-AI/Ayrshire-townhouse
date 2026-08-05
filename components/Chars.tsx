/**
 * Per-character masked spans for staggered reveals (.char targets).
 * Chars are grouped into nowrap word spans so lines only break between words.
 */
export default function Chars({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((word, w) => (
        <span className="word" key={w} aria-hidden>
          {word.split('').map((c, i) => (
            <span className="mask mask--char" key={i}>
              <span className="mask__inner char">{c}</span>
            </span>
          ))}
        </span>
      ))}
    </>
  )
}
