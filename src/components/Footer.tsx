import React from 'react';
import { Cpu } from 'lucide-react';

export const Footer: React.FC = () => (
  <footer className="bg-white border-t border-gray-200 py-6 mt-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 rounded p-1">
          <Cpu size={12} className="text-white" />
        </div>
        <span className="font-medium text-gray-700">AutomataLab</span>
        <span>— Mealy &amp; Moore Machine Conversion Simulator</span>
      </div>
      <div>Theory of Computation · University Project</div>
    </div>
  </footer>
);

