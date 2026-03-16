import { useEffect, useRef, useState } from 'react'
import './App.css'
import oasisMap from './assets/oasis-map.jpg'

type StoryPage = {
  title: string
  text: string
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

function App() {
  const [currentPage, setCurrentPage] = useState(0)
  const [bookOpen, setBookOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [windReady, setWindReady] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const attemptWindStart = () => {
      void startWind()
    }

    void startWind()
    window.addEventListener('pointerdown', attemptWindStart, { once: true })
    window.addEventListener('keydown', attemptWindStart, { once: true })

    return () => {
      window.removeEventListener('pointerdown', attemptWindStart)
      window.removeEventListener('keydown', attemptWindStart)
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
      <div className="scene__backdrop">
        <img className="scene__painting" src={oasisMap} alt="Painted oasis map" />
        <div className="scene__wash" />
        <div className="scene__wind-lines scene__wind-lines--a" />
        <div className="scene__wind-lines scene__wind-lines--b" />
        <div className="scene__dust scene__dust--a" />
        <div className="scene__dust scene__dust--b" />

        <section className="centerpiece" aria-label="Hidden story marker">
          <button className="centerpiece__hotspot" type="button" onClick={openBook}>
            <span className="centerpiece__pulse" />
            <span className="centerpiece__label">Open the book</span>
          </button>
        </section>
      </div>

      <aside className="hud">
        <p className="hud__eyebrow">Desert memory</p>
        <h1>The original painted map is now the scene.</h1>
        <p className="hud__copy">
          I switched from a reconstruction to the actual artwork you provided, then layered wind,
          dust, and a central hotspot on top so the composition stays exact.
        </p>
        <p className="hud__hint">{windReady ? 'Ambient wind is active.' : 'Ambient wind will begin automatically.'}</p>
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
