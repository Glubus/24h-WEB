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

function App() {
  const [page, setPage] = useState<Page>("home");
  const [category, setCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chatConversationId, setChatConversationId] = useState<number | null>(
    null,
  );

  const [annonceId, setAnnonceId] = useState<number | null>(null);

  function navigateToCategory(name: string) {
    setCategory(name);
    setSearchQuery('');
    setPage('category');
  }

  function navigateToSearch(query: string) {
    setSearchQuery(query)
    setPage('search')
  }

  function handleLogout() {
    api.setToken(null);
    localStorage.removeItem("api_token");
    setCurrentUser(null);
    setPage("home");
  }

  function navigateToAnnonce(id: number) {
    setAnnonceId(id);
    setPage("annonce");
  }

  function navigateToChat(conversationId: number) {
    setChatConversationId(conversationId);
    setPage("chat");
  }

  return (
    <>
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigate={setPage}
        onNavigateCategory={navigateToCategory}
        onSearch={navigateToSearch}
      />
      <div className="px-6 md:px-12 lg:px-24">
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
        ) : page === 'chat' ? (
          <ChatPage currentUser={currentUser} initialConversationId={chatConversationId} onNavigate={setPage} />
        ) : page === 'search' ? (
            <SearchResultPage currentUser={currentUser} onNavigate={setPage} query={searchQuery} onNavigateAnnonce={navigateToAnnonce} />
        ) : (
          <LoginPage onLogin={setCurrentUser} onNavigate={setPage} />
        )}
      </div>
    </>
  );
}

export default App;
