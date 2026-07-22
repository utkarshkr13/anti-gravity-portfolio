import { useState } from 'react'
import { CustomCursor } from './components/CustomCursor'
import { Preloader } from './components/Preloader'
import { Navbar } from './components/Navbar'
import { WebGLCanvas } from './components/WebGLCanvas'
import { Hero } from './components/Hero'
import { WorkList } from './components/WorkList'
import { Experience } from './components/Experience'

function App() {
  const [loading, setLoading] = useState(true)

  return (
    <>
      <CustomCursor />
      <Preloader onComplete={() => setLoading(false)} />
      <WebGLCanvas />

      <main className={`transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        <Navbar />
        <Hero showText={!loading} />
        <WorkList />
        <Experience />
      </main>
    </>
  )
}

export default App

