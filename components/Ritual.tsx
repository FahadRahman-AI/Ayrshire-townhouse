import Reveal from './Reveal'

export default function Ritual() {
  return (
    <section className="section section--panel ritual" id="ritual">
      <div className="ritual__inner">
        <Reveal>
          <h2 className="ritual__title">Heat, then <em>cold</em>.<br />Then quiet.</h2>
        </Reveal>
        <Reveal>
          <div className="ritual__body">
            <p>
              At the foot of the garden: a cedar barrel sauna and a cold plunge, set
              beneath a warm strip of light. The ritual is old and simple — sit in the
              heat until you forget the day, then step into cold water and remember your
              own edges.
            </p>
            <p>
              It is the reason people book, and the reason they come back. Most stays end
              here at dusk, steam rising, the city quiet behind the fence.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
