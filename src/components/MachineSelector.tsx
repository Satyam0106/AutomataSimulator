import React from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import type { ConversionMode } from '../types/machine';

interface MachineSelectorProps {
  mode: ConversionMode;
  onSelect: (mode: ConversionMode) => void;
}

export const MachineSelector: React.FC<MachineSelectorProps> = ({ mode, onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        onClick={() => onSelect('mealy-to-moore')}
        className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all ${
          mode === 'mealy-to-moore'
            ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <div
          className={`p-3 rounded-lg flex-shrink-0 ${
            mode === 'mealy-to-moore' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <ArrowRight size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-base">Mealy → Moore</h3>
            {mode === 'mealy-to-moore' && (
              <span className="badge-blue">Active</span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            Convert a transition-output Mealy machine into an equivalent state-output Moore machine (with automatic state splitting when needed).
          </p>
          <div className="mt-2 font-mono text-xs text-indigo-700 bg-white/80 inline-block px-2 py-0.5 rounded border border-indigo-100">
            λ(q, a) → λ(q&apos;)
          </div>
        </div>
      </button>

      <button
        onClick={() => onSelect('moore-to-mealy')}
        className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all ${
          mode === 'moore-to-mealy'
            ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <div
          className={`p-3 rounded-lg flex-shrink-0 ${
            mode === 'moore-to-mealy' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <RefreshCw size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-base">Moore → Mealy</h3>
            {mode === 'moore-to-mealy' && (
              <span className="badge-blue">Active</span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            Convert a state-output Moore machine into an equivalent transition-output Mealy machine by propagating destination outputs onto transitions.
          </p>
          <div className="mt-2 font-mono text-xs text-indigo-700 bg-white/80 inline-block px-2 py-0.5 rounded border border-indigo-100">
            λ(q&apos;) → λ(q, a)
          </div>
        </div>
      </button>
    </div>
  );
};

