import React from 'react';
import { Cpu } from 'lucide-react';
import type { AppPage } from '../types/machine';

interface NavbarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

const navItems: Array<{ page: AppPage; label: string }> = [
  { page: 'home', label: 'Home' },
  { page: 'simulator', label: 'Simulator' },
  { page: 'theory', label: 'Theory' },
  { page: 'about', label: 'About' },
];

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-indigo-700 hover:text-indigo-800 transition-colors"
          >
            <div className="bg-indigo-600 rounded-lg p-1.5">
              <Cpu size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">AutomataLab</span>
          </button>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map(({ page, label }) => (
              <button
                key={page}
                onClick={() => onNavigate(page)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

