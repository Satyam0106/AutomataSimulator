import React from 'react';
import { ArrowRight, RefreshCw, GitCompare, Layers, Play, CheckCircle } from 'lucide-react';
import type { AppPage } from '../types/machine';

interface HeroProps {
  onNavigate: (page: AppPage) => void;
}

const features = [
  {
    icon: ArrowRight,
    title: 'Mealy → Moore',
    description: 'Convert Mealy machines into equivalent Moore machines with automatic state splitting.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: ArrowRight,
    title: 'Moore → Mealy',
    description: 'Convert Moore machines into equivalent Mealy machines with output propagation.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    flip: true,
  },
  {
    icon: Layers,
    title: 'Interactive Visualization',
    description: 'Build and explore state diagrams using interactive graph visualization.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: GitCompare,
    title: 'Step-by-Step Conversion',
    description: 'Understand how each conversion step is performed with detailed explanations.',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
  },
  {
    icon: Play,
    title: 'Input Simulation',
    description: 'Run input strings through the automata and trace every state transition.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: CheckCircle,
    title: 'Equivalence Verification',
    description: 'Compare original and converted machine outputs across a generated test suite.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
];

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full inline-block animate-pulse" />
          Theory of Computation Simulator
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-4 tracking-tight">
          Automata<span className="text-indigo-400">Lab</span>
        </h1>

        <p className="text-xl sm:text-2xl font-semibold text-indigo-200 mb-6">
          Mealy &amp; Moore Machine Conversion Simulator
        </p>

        <p className="max-w-2xl mx-auto text-base text-slate-300 mb-10 leading-relaxed">
          An interactive Theory of Computation simulator for designing, converting, visualizing,
          and testing Mealy and Moore finite-state machines.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => onNavigate('simulator')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-900/40"
          >
            <Play size={18} />
            Start Simulator
          </button>
          <button
            onClick={() => onNavigate('theory')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/20 transition-colors"
          >
            Learn the Theory
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap justify-center gap-8 mt-16 text-center">
          {[
            { label: 'Machine Types', value: '2' },
            { label: 'Conversion Modes', value: '2' },
            { label: 'Example Machines', value: '6' },
            { label: 'Auto Test Cases', value: '30+' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-3xl font-bold text-white">{value}</div>
              <div className="text-sm text-slate-400 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion flow illustration */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {['Mealy Machine', '→', 'Conversion', '→', 'Moore Machine'].map((item, i) => (
            <div key={i} className={`${
              item === '→'
                ? 'text-indigo-400 text-2xl font-bold'
                : 'px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-medium'
            }`}>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Feature Cards */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900">What AutomataLab Does</h2>
            <p className="text-gray-500 mt-2">Everything you need to understand and convert finite-state machines.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description, color, bg, flip }) => (
              <div key={title} className="card p-6 hover:shadow-md transition-shadow">
                <div className={`${bg} w-10 h-10 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon size={20} className={`${color} ${flip ? 'rotate-180' : ''}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

