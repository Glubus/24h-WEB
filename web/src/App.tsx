import { useState } from 'react'
import { HomePage } from './page/HomePage'
import { LoginPage } from './page/LoginPage'
import { AnnoncePage } from './page/AnnoncePage'
import { CategoryPage } from './page/CategoryPage'
import { Navbar } from './components/Navbar'
import type { Page } from './types/page'
import './App.css'

function App() {
  const [page, setPage] = useState<Page>('home')
  const [category, setCategory] = useState<string>('')

  function navigateToCategory(name: string) {
    setCategory(name)
    setPage('category')
  }

  return (
    <>
      <Navbar onNavigate={setPage} onNavigateCategory={navigateToCategory} />
      <div className="px-6 md:px-12 lg:px-24">
        {page === 'home' ? (
          <HomePage onNavigate={setPage} />
        ) : page === 'annonce' ? (
          <AnnoncePage onNavigate={setPage} />
        ) : page === 'category' ? (
          <CategoryPage onNavigate={setPage} category={category} />
        ) : (
          <LoginPage onNavigate={setPage} />
        )}
      </div>
    </>
  )
}

export default App
