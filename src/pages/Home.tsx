import React from 'react';
import { Hero } from '../components/Hero';
import type { AppPage } from '../types/machine';

interface HomeProps {
  onNavigate: (page: AppPage) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return <Hero onNavigate={onNavigate} />;
};

