import { useState } from 'react'
import { CustomCursor } from './components/CustomCursor'
import { Preloader } from './components/Preloader'

function App() {
  const [loading, setLoading] = useState(true)

  return (
    <>
      <CustomCursor />
      <Preloader onComplete={() => setLoading(false)} />

      <main className={`transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        <section className="min-h-screen flex flex-col justify-center items-center text-center p-8">
          <h1 className="text-4xl font-bold font-sans">Utkarsh Rajput</h1>
          <p className="text-xl font-serif italic text-muted mt-4">UI Revamp In Progress...</p>
        </section>
      </main>
    </>
  )
}

export default App

