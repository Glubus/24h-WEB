import { useState } from 'react'
import { HomePage } from './page/HomePage'
import { LoginPage } from './page/LoginPage'
import { AnnoncePage } from './page/AnnoncePage'
import { Navbar } from './components/Navbar'
import type { Page } from './types/page'
import './App.css'

function App() {
  const [page, setPage] = useState<Page>('home')

  return (
    <>
      <Navbar onNavigate={setPage} />
      <div className="px-6 md:px-12 lg:px-24">
        {page === 'home' ? (
          <HomePage onNavigate={setPage} />
        ) : page === 'annonce' ? (
          <AnnoncePage onNavigate={setPage} />
        ) : (
          <LoginPage onNavigate={setPage} />
        )}
      </div>
    </>
  )
}

export default App
