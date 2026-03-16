import { useEffect, useRef, useState } from 'react'
import './App.css'

type StoryPage = {
  title: string
  text: string
}

type Palm = {
  id: number
  top: string
  left: string
  scale: number
  delay: string
  duration: string
  rotate: number
}

const storyPages: StoryPage[] = [
  {
    title: 'Opening',
    text:
      'The wind crosses the oasis before the first word is spoken. Press deeper into the story and let the desert open its memory.',
  },
  {
    title: 'The Grove',
    text:
      'Palm shadows sway around the hidden shape. Every tree leans as if it knows the promise written in the center of the land.',
  },
  {
    title: 'The Book',
    text:
      'This book can now live behind the map marker. Replace this sample text with your real pages, narration, and chapter structure.',
  },
]

const palms: Palm[] = [
  { id: 1, top: '4%', left: '9%', scale: 0.9, delay: '0s', duration: '8s', rotate: -28 },
  { id: 2, top: '7%', left: '18%', scale: 1, delay: '-2s', duration: '9s', rotate: -18 },
  { id: 3, top: '5%', left: '31%', scale: 0.92, delay: '-4s', duration: '7.4s', rotate: -12 },
  { id: 4, top: '9%', left: '44%', scale: 1.08, delay: '-1s', duration: '9.2s', rotate: 4 },
  { id: 5, top: '6%', left: '57%', scale: 0.94, delay: '-3s', duration: '8.8s', rotate: 10 },
  { id: 6, top: '8%', left: '71%', scale: 0.98, delay: '-5s', duration: '7.8s', rotate: 18 },
  { id: 7, top: '10%', left: '84%', scale: 1, delay: '-2.5s', duration: '8.6s', rotate: 28 },
  { id: 8, top: '24%', left: '7%', scale: 1.02, delay: '-1.2s', duration: '8s', rotate: -42 },
  { id: 9, top: '20%', left: '19%', scale: 0.95, delay: '-4.2s', duration: '9.4s', rotate: -24 },
  { id: 10, top: '23%', left: '31%', scale: 0.88, delay: '-2.2s', duration: '7.9s', rotate: -13 },
  { id: 11, top: '18%', left: '72%', scale: 0.9, delay: '-5.4s', duration: '9.1s', rotate: 21 },
  { id: 12, top: '24%', left: '83%', scale: 1.05, delay: '-3.8s', duration: '8.7s', rotate: 38 },
  { id: 13, top: '40%', left: '9%', scale: 1, delay: '-1.8s', duration: '8.5s', rotate: -68 },
  { id: 14, top: '36%', left: '22%', scale: 0.96, delay: '-5.6s', duration: '8.9s', rotate: -46 },
  { id: 15, top: '43%', left: '80%', scale: 1.04, delay: '-3.4s', duration: '8.2s', rotate: 62 },
  { id: 16, top: '56%', left: '10%', scale: 0.9, delay: '-2.7s', duration: '7.7s', rotate: -72 },
  { id: 17, top: '60%', left: '23%', scale: 1.03, delay: '-4.9s', duration: '9.3s', rotate: -50 },
  { id: 18, top: '61%', left: '76%', scale: 0.92, delay: '-1.4s', duration: '8.1s', rotate: 47 },
  { id: 19, top: '74%', left: '12%', scale: 0.98, delay: '-3.1s', duration: '9s', rotate: -38 },
  { id: 20, top: '78%', left: '32%', scale: 0.9, delay: '-5.1s', duration: '7.6s', rotate: -16 },
  { id: 21, top: '82%', left: '49%', scale: 1.05, delay: '-1.9s', duration: '9.5s', rotate: 0 },
  { id: 22, top: '77%', left: '67%', scale: 0.9, delay: '-4.4s', duration: '8.4s', rotate: 16 },
  { id: 23, top: '81%', left: '83%', scale: 1.03, delay: '-2.1s', duration: '8.8s', rotate: 34 },
]

function PalmTree({ palm }: { palm: Palm }) {
  return (
    <div
      className="palm"
      style={
        {
          top: palm.top,
          left: palm.left,
          '--scale': palm.scale,
          '--delay': palm.delay,
          '--duration': palm.duration,
          '--rotate': `${palm.rotate}deg`,
        } as React.CSSProperties
      }
    >
      <span className="palm__trunk" />
      <span className="palm__crown">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
    </div>
  )
}

function App() {
  const [currentPage, setCurrentPage] = useState(0)
  const [bookOpen, setBookOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [windReady, setWindReady] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => {
      cleanupRef.current?.()
      void audioContextRef.current?.close()
    }
  }, [])

  const startWind = async () => {
    if (soundOn) {
      return
    }

    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

    if (!AudioContextCtor) {
      return
    }

    const context = audioContextRef.current ?? new AudioContextCtor()
    audioContextRef.current = context

    if (context.state === 'suspended') {
      await context.resume()
    }

    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
    const channelData = buffer.getChannelData(0)

    for (let i = 0; i < channelData.length; i += 1) {
      channelData[i] = Math.random() * 2 - 1
    }

    const source = context.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const lowpass = context.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 520
    lowpass.Q.value = 0.8

    const gain = context.createGain()
    gain.gain.value = 0.018

    const lfo = context.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.08

    const lfoDepth = context.createGain()
    lfoDepth.gain.value = 180

    const tremolo = context.createOscillator()
    tremolo.type = 'sine'
    tremolo.frequency.value = 0.14

    const tremoloDepth = context.createGain()
    tremoloDepth.gain.value = 0.008

    lfo.connect(lfoDepth)
    lfoDepth.connect(lowpass.frequency)
    tremolo.connect(tremoloDepth)
    tremoloDepth.connect(gain.gain)

    source.connect(lowpass)
    lowpass.connect(gain)
    gain.connect(context.destination)

    source.start()
    lfo.start()
    tremolo.start()

    cleanupRef.current = () => {
      source.stop()
      lfo.stop()
      tremolo.stop()
      source.disconnect()
      lowpass.disconnect()
      gain.disconnect()
      lfo.disconnect()
      lfoDepth.disconnect()
      tremolo.disconnect()
      tremoloDepth.disconnect()
      cleanupRef.current = null
    }

    setSoundOn(true)
    setWindReady(true)
  }

  const stopWind = () => {
    cleanupRef.current?.()
    setSoundOn(false)
  }

  const toggleSound = async () => {
    if (soundOn) {
      stopWind()
      return
    }

    await startWind()
  }

  const openBook = async () => {
    setBookOpen(true)
    await startWind()
  }

  const closeBook = () => {
    setBookOpen(false)
  }

  const nextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, storyPages.length - 1))
  }

  const prevPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 0))
  }

  const page = storyPages[currentPage]

  return (
    <main className="scene">
      <div className="scene__sky" />
      <div className="scene__sand" />
      <div className="scene__dust scene__dust--a" />
      <div className="scene__dust scene__dust--b" />

      {palms.map((palm) => (
        <PalmTree key={palm.id} palm={palm} />
      ))}

      <section className="centerpiece" aria-label="Hidden story marker">
        <div className="centerpiece__halo" />
        <button className="centerpiece__hotspot" type="button" onClick={openBook}>
          <span className="centerpiece__marker" />
          <span className="centerpiece__label">Open the book</span>
        </button>
      </section>

      <aside className="hud">
        <p className="hud__eyebrow">Desert memory</p>
        <h1>Walk through the palms and enter the story.</h1>
        <p className="hud__copy">
          The artwork is now reinterpreted as a living landscape: moving palms, drifting sand,
          a central sign, and ambient wind.
        </p>
        <button className="sound-toggle" type="button" onClick={() => void toggleSound()}>
          {soundOn ? 'Mute desert wind' : 'Play desert wind'}
        </button>
        <p className="hud__hint">{windReady ? 'Ambient wind is active.' : 'Sound starts after a click.'}</p>
      </aside>

      {bookOpen ? (
        <div className="book-overlay" role="dialog" aria-modal="true" aria-label="Story book">
          <div className="book">
            <button className="book__close" type="button" onClick={closeBook} aria-label="Close book">
              Close
            </button>
            <div className="book__pages">
              <article className="book__page book__page--left">
                <p className="book__chapter">Chapter {currentPage + 1}</p>
                <h2>{page.title}</h2>
                <p>{page.text}</p>
              </article>
              <article className="book__page book__page--right">
                <div className="book__sigil" />
                <p>
                  Replace this panel with your real illustrations, Arabic text, narration triggers,
                  or page-specific interactions from the book.
                </p>
              </article>
            </div>
            <div className="book__nav">
              <button type="button" onClick={prevPage} disabled={currentPage === 0}>
                Previous
              </button>
              <span>
                Page {currentPage + 1} of {storyPages.length}
              </span>
              <button type="button" onClick={nextPage} disabled={currentPage === storyPages.length - 1}>
                Next
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default App
