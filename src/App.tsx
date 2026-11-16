import React, { useState } from 'react';
import type { AppPage } from './types/machine';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Simulator } from './pages/Simulator';
import { Theory } from './pages/Theory';
import { About } from './pages/About';

export function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('home');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1">
        {currentPage === 'home' && <Home onNavigate={setCurrentPage} />}
        {currentPage === 'simulator' && <Simulator />}
        {currentPage === 'theory' && <Theory onNavigate={setCurrentPage} />}
        {currentPage === 'about' && <About />}
      </main>
      <Footer />
    </div>
  );
}

export default App;

