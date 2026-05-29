import { useState } from 'react'
import { HomePage } from './components/HomePage'
import { LoginPage } from './components/LoginPage'
import { Navbar } from './components/Navbar'
import type { Page } from './types/page'
import './App.css'

function App() {
  const [page, setPage] = useState<Page>('home')

  return (
    <>
      <Navbar onNavigate={setPage} />
      {page === 'home' ? (
        <HomePage onNavigate={setPage} />
      ) : (
        <LoginPage onNavigate={setPage} />
      )}
    </>
  )
}

export default App
