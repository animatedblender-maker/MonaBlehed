import { useEffect, useRef, useState } from 'react'
import './App.css'
import centerShape from './assets/center-shape.jpg'
import bookPagesData from './assets/book-pages-data.json'

type Palm = {
  id: number
  top: string
  left: string
  scale: number
  delay: string
  duration: string
  rotate: number
}

const pageModules = import.meta.glob('./assets/book-pages/*.{png,jpg,jpeg,JPG,JPEG}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

type BookPageData = {
  slide: number
  image: string
  text: string
}

const bookPages = (bookPagesData as BookPageData[])
  .map((page) => {
    const imageEntry = Object.entries(pageModules).find(([path]) => path.endsWith(`/${page.image}`))
    return {
      ...page,
      src: imageEntry?.[1] ?? '',
    }
  })
  .filter((page) => page.src)

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
  const [currentSpread, setCurrentSpread] = useState(0)
  const [openProgress, setOpenProgress] = useState(0)
  const [windReady, setWindReady] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [turnDirection, setTurnDirection] = useState<'next' | 'prev' | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const turnTimeoutRef = useRef<number | null>(null)
  const dragStartXRef = useRef<number | null>(null)
  const dragSideRef = useRef<'next' | 'prev' | null>(null)
  const swipeStartYRef = useRef<number | null>(null)
  const swipeProgressStartRef = useRef(0)

  const isBookOpen = openProgress >= 1

  const startWind = async () => {
    if (soundOn) {
      return
    }

    const AudioContextCtor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

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
      if (turnTimeoutRef.current !== null) {
        window.clearTimeout(turnTimeoutRef.current)
      }
      cleanupRef.current?.()
      void audioContextRef.current?.close()
    }
  }, [])

  const handleWheel: React.WheelEventHandler<HTMLElement> = (event) => {
    event.preventDefault()
    void startWind()

    setOpenProgress((progress) => Math.max(0, Math.min(1, progress + event.deltaY / 900)))
  }

  const handleScenePointerDown: React.PointerEventHandler<HTMLElement> = (event) => {
    const target = event.target as HTMLElement

    if (target.closest('.book-stage__spread')) {
      return
    }

    swipeStartYRef.current = event.clientY
    swipeProgressStartRef.current = openProgress
  }

  const handleScenePointerMove: React.PointerEventHandler<HTMLElement> = (event) => {
    if (swipeStartYRef.current === null) {
      return
    }

    const delta = swipeStartYRef.current - event.clientY
    setOpenProgress(Math.max(0, Math.min(1, swipeProgressStartRef.current + delta / 500)))
  }

  const endSceneSwipe = () => {
    swipeStartYRef.current = null
  }

  const animateTurn = (direction: 'next' | 'prev', nextIndex: number) => {
    setTurnDirection(direction)
    setDragOffset(0)
    if (turnTimeoutRef.current !== null) {
      window.clearTimeout(turnTimeoutRef.current)
    }

    turnTimeoutRef.current = window.setTimeout(() => {
      setCurrentSpread(nextIndex)
      setTurnDirection(null)
      turnTimeoutRef.current = null
    }, 180)
  }

  const nextPage = () => {
    if (currentSpread >= bookPages.length - 2) {
      return
    }

    animateTurn('next', Math.min(currentSpread + 2, Math.max(bookPages.length - 1, 0)))
  }

  const prevPage = () => {
    if (currentSpread <= 0) {
      return
    }

    animateTurn('prev', Math.max(currentSpread - 2, 0))
  }

  const handlePagePointerDown: React.PointerEventHandler<HTMLElement> = (event) => {
    if (!isBookOpen) {
      return
    }

    const side = event.currentTarget.dataset.side as 'next' | 'prev'

    if (side === 'next' && currentSpread >= bookPages.length - 2) {
      return
    }

    if (side === 'prev' && currentSpread === 0) {
      return
    }

    dragStartXRef.current = event.clientX
    dragSideRef.current = side
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleSpreadPointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (dragStartXRef.current === null || dragSideRef.current === null) {
      return
    }

    const delta = event.clientX - dragStartXRef.current
    const nextOffset = dragSideRef.current === 'next' ? Math.min(0, delta) : Math.max(0, delta)
    setDragOffset(nextOffset)
  }

  const endDrag = () => {
    if (dragSideRef.current === 'next' && dragOffset < -90) {
      nextPage()
    } else if (dragSideRef.current === 'prev' && dragOffset > 90) {
      prevPage()
    } else {
      setDragOffset(0)
    }

    dragStartXRef.current = null
    dragSideRef.current = null
  }

  const handleSpreadPointerUp: React.PointerEventHandler<HTMLDivElement> = () => {
    if (dragStartXRef.current === null) {
      return
    }
    endDrag()
  }

  const leftPage = bookPages[currentSpread]
  const rightPage = bookPages[Math.min(currentSpread + 1, bookPages.length - 1)]
  const bookStatus = isBookOpen
    ? `Book open. Spread ${Math.floor(currentSpread / 2) + 1} of ${Math.ceil(bookPages.length / 2)}.`
    : `Scroll progress ${Math.round(openProgress * 100)}%. Ambient wind ${windReady ? 'active' : 'loading'}.`

  const spreadStyle = {
    '--drag-offset': `${dragOffset}px`,
  } as React.CSSProperties

  const nextDisabled = currentSpread >= bookPages.length - 2
  const prevDisabled = currentSpread === 0

  useEffect(() => {
    if (!isBookOpen) {
      setDragOffset(0)
      dragStartXRef.current = null
      dragSideRef.current = null
    }
  }, [isBookOpen])

  useEffect(() => {
    if (openProgress === 0) {
      setCurrentSpread(0)
    }
  }, [openProgress])

  return (
    <main
      className={`scene ${isBookOpen ? 'scene--book-open' : ''}`}
      onWheel={handleWheel}
      onPointerDown={handleScenePointerDown}
      onPointerMove={handleScenePointerMove}
      onPointerUp={endSceneSwipe}
      onPointerCancel={endSceneSwipe}
      style={{ '--open-progress': openProgress } as React.CSSProperties}
    >
      <div className="scene__sky" />
      <div className="scene__sand" />
      <div className="scene__dust scene__dust--a" />
      <div className="scene__dust scene__dust--b" />

      {palms.map((palm) => (
        <PalmTree key={palm.id} palm={palm} />
      ))}

      <section className="centerpiece" aria-label="Scroll to open the book">
        <div className="centerpiece__halo" />
        <div className="centerpiece__hotspot">
          <img className="centerpiece__painting" src={centerShape} alt="Painted center marker" />
          <span className="centerpiece__label">Scroll to open the book</span>
        </div>
      </section>

      <aside className="hud">
        <p className="hud__eyebrow">Desert memory</p>
        <h1>Scroll deeper and let the book unfold.</h1>
        <p className="hud__copy">
          The desert opens with the wheel, trackpad, or a vertical swipe on mobile. Once the book
          is fully open, drag a page edge to pull through the illustrated spreads.
        </p>
        <p className="hud__hint">{bookStatus}</p>
      </aside>

      <section className={`book-stage ${isBookOpen ? 'book-stage--open' : ''}`} aria-hidden={!isBookOpen}>
        <div className="book-stage__shell">
          <div
            className={`book-stage__spread ${turnDirection ? `book-stage__spread--${turnDirection}` : ''} ${dragSideRef.current ? `book-stage__spread--drag-${dragSideRef.current}` : ''}`}
            style={spreadStyle}
            onPointerMove={handleSpreadPointerMove}
            onPointerUp={handleSpreadPointerUp}
            onPointerCancel={endDrag}
          >
            <article
              className={`book-stage__page book-stage__page--left ${prevDisabled ? 'book-stage__page--disabled' : 'book-stage__page--grabbable'}`}
              data-side="prev"
              onPointerDown={handlePagePointerDown}
            >
              <img src={leftPage.src} alt={`Book page ${currentSpread + 1}`} />
              {leftPage.text ? <div className="book-stage__text">{leftPage.text}</div> : null}
            </article>
            <article
              className={`book-stage__page book-stage__page--right ${nextDisabled ? 'book-stage__page--disabled' : 'book-stage__page--grabbable'}`}
              data-side="next"
              onPointerDown={handlePagePointerDown}
            >
              <img src={rightPage.src} alt={`Book page ${Math.min(currentSpread + 2, bookPages.length)}`} />
              {rightPage.text ? <div className="book-stage__text">{rightPage.text}</div> : null}
            </article>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
