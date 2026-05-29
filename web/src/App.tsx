import { useEffect, useState } from 'react'
import { HomePage } from './page/HomePage'
import { LoginPage } from './page/LoginPage'
import { RegisterPage } from './page/RegisterPage'
import { AnnoncePage } from './page/AnnoncePage'
import { CategoryPage } from './page/CategoryPage'
import { MyAccountPage } from './page/MyAccountPage'
import { MyAnnoncesPage } from './page/MyAnnoncesPage'
import { CreateAnnoncePage } from './page/CreateAnnoncePage'
import { ChatPage } from './page/ChatPage'
import { PaymentPage } from './page/PaymentPage'
import { Navbar } from './components/Navbar'
import { ApiError, api } from './services/api'
import type { User } from './services/api'
import { clearCachedCurrentUser, readCachedCurrentUser, writeCachedCurrentUser } from './services/api/currentUserCache'
import type { Page } from './types/page'
import './App.css'

function App() {
  const [page, setPage] = useState<Page>('home')
  const [category, setCategory] = useState<string>('')
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const token = localStorage.getItem('api_token')

    return token === null ? null : readCachedCurrentUser(token)
  })
  const [chatConversationId, setChatConversationId] = useState<number | null>(null)
  const [editingAnnonceId, setEditingAnnonceId] = useState<number | null>(null)
  const [paymentAnnonceId, setPaymentAnnonceId] = useState<number | null>(null)
import { useState } from "react";
import { HomePage } from "./page/HomePage";
import { LoginPage } from "./page/LoginPage";
import { RegisterPage } from "./page/RegisterPage";
import { AnnoncePage } from "./page/AnnoncePage";
import { CategoryPage } from "./page/CategoryPage";
import { MyAccountPage } from "./page/MyAccountPage";
import { CreateAnnoncePage } from "./page/CreateAnnoncePage";
import { ChatPage } from "./page/ChatPage";
import { Navbar } from "./components/Navbar";
import { api } from "./services/api";
import type { User } from "./services/api";
import type { Page } from "./types/page";
import "./App.css";
import { SearchResultPage } from "./page/SearchResultPage.tsx";

function App() {
  const [page, setPage] = useState<Page>("home");
  const [category, setCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chatConversationId, setChatConversationId] = useState<number | null>(
    null,
  );

  const [annonceId, setAnnonceId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('api_token')

    if (token === null) {
      return
    }

    let isCurrent = true
    api.setToken(token)
    api
      .whoami()
      .then((user) => {
        if (isCurrent) {
          setCurrentUser(user)
          writeCachedCurrentUser(token, user)
        }
      })
      .catch((restoreError) => {
        if (isCurrent) {
          if (isAuthenticationRejected(restoreError)) {
            api.setToken(null)
            localStorage.removeItem('api_token')
            clearCachedCurrentUser()
            setCurrentUser(null)
          }
        }
      })

    return () => {
      isCurrent = false
    }
  }, [])

  function navigateToCategory(name: string) {
    setCategory(name);
    setSearchQuery("");
    setPage("category");
  }

  function navigateToSearch(query: string) {
    setSearchQuery(query);
    setPage("search");
  }

  function handleLogout() {
    api.setToken(null)
    localStorage.removeItem('api_token')
    clearCachedCurrentUser()
    setCurrentUser(null)
    setPage('home')
    api.setToken(null);
    localStorage.removeItem("api_token");
    setCurrentUser(null);
    setPage("home");
  }

  function handleCurrentUserChange(user: User | null) {
    setCurrentUser(user)

    const token = api.getToken() ?? localStorage.getItem('api_token')

    if (user === null || token === null) {
      clearCachedCurrentUser()
      return
    }

    writeCachedCurrentUser(token, user)
  }

  function navigateToAnnonce(id: number) {
    setAnnonceId(id);
    setPage("annonce");
  }

  async function discoverRandomAnnonce() {
    const response = await api.listAnnonces({ masked: false, sold: false })
    const annonces = response.member

    if (annonces.length === 0) {
      setPage('home')
      return
    }

    const randomAnnonce = annonces[Math.floor(Math.random() * annonces.length)]
    navigateToAnnonce(randomAnnonce.id)
  }

  function navigateToEditAnnonce(id: number) {
    setEditingAnnonceId(id)
    setPage('createAnnonce')
  }

  function navigateToPayment(id: number) {
    setPaymentAnnonceId(id)
    setPage('payment')
  }

  function navigateToChat(conversationId: number) {
    setChatConversationId(conversationId);
    setPage("chat");
  }

  return (
    <>
      <Navbar
        currentUser={currentUser}
        onDiscover={() => {
          void discoverRandomAnnonce()
        }}
        onLogout={handleLogout}
        onNavigate={setPage}
        onNavigateCategory={navigateToCategory}
        onSearch={navigateToSearch}
      />
      <div className="px-6 md:px-12 lg:px-24">
        {page === 'home' ? (
          <HomePage currentUser={currentUser} onNavigate={setPage} onNavigateAnnonce={navigateToAnnonce} />
        ) : page === 'annonce' ? (
          <AnnoncePage
            currentUser={currentUser}
            onNavigate={setPage}
            onEditAnnonce={navigateToEditAnnonce}
            onNavigateCategory={navigateToCategory}
            onNavigateChat={navigateToChat}
            onPayAnnonce={navigateToPayment}
            annonceId={annonceId}
          />
        ) : page === 'category' ? (
          <CategoryPage currentUser={currentUser} onNavigate={setPage} category={category} onNavigateAnnonce={navigateToAnnonce} />
        ) : page === 'register' ? (
          <RegisterPage onNavigate={setPage} />
        ) : page === 'settingsUser' ? (
          <MyAccountPage currentUser={currentUser} onNavigate={setPage} onUserChange={handleCurrentUserChange} />
        ) : page === 'myAnnonces' ? (
          <MyAnnoncesPage currentUser={currentUser} onNavigate={setPage} onNavigateAnnonce={navigateToAnnonce} />
        ) : page === 'createAnnonce' ? (
          <CreateAnnoncePage
            currentUser={currentUser}
            editingAnnonceId={editingAnnonceId}
            onNavigate={setPage}
            onSavedAnnonce={navigateToAnnonce}
          />
        ) : page === 'chat' ? (
        {page === "home" ? (
          <HomePage
            currentUser={currentUser}
            onNavigate={setPage}
            onNavigateAnnonce={navigateToAnnonce}
          />
        ) : page === "annonce" ? (
          <AnnoncePage
            currentUser={currentUser}
            onNavigate={setPage}
            onNavigateChat={navigateToChat}
            annonceId={annonceId}
          />
        ) : page === "category" ? (
          <CategoryPage
            currentUser={currentUser}
            onNavigate={setPage}
            category={category}
            onNavigateAnnonce={navigateToAnnonce}
          />
        ) : page === "register" ? (
          <RegisterPage onNavigate={setPage} />
        ) : page === "settingsUser" ? (
          <MyAccountPage
            currentUser={currentUser}
            onNavigate={setPage}
            onUserChange={setCurrentUser}
          />
        ) : page === "createAnnonce" ? (
          <CreateAnnoncePage currentUser={currentUser} onNavigate={setPage} />
        ) : page === "chat" ? (
          <ChatPage
            currentUser={currentUser}
            initialConversationId={chatConversationId}
            onNavigate={setPage}
            onNavigateAnnonce={navigateToAnnonce}
          />
        ) : page === 'payment' ? (
          <PaymentPage
            annonceId={paymentAnnonceId}
            currentUser={currentUser}
            onNavigate={setPage}
            onPaid={navigateToAnnonce}
          />
        ) : page === "search" ? (
          <SearchResultPage
            currentUser={currentUser}
            onNavigate={setPage}
            query={searchQuery}
            onNavigateAnnonce={navigateToAnnonce}
          />
        ) : (
          <LoginPage onLogin={handleCurrentUserChange} onNavigate={setPage} />
        )}
      </div>
    </>
  );
}

function isAuthenticationRejected(error: unknown) {
  return error instanceof ApiError && (error.status === 401 || error.status === 403)
}

export default App
export default App;
