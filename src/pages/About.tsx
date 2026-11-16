import React from 'react';
import { Cpu, Users, Code2, GraduationCap, CheckCircle } from 'lucide-react';

const teamMembers = [
  'Member 1',
  'Member 2',
  'Member 3',
  'Member 4',
  'Member 5',
];

const technologies = [
  { name: 'React 18 + TypeScript', role: 'Component UI & Type-Safe TOC Algorithms' },
  { name: 'Vite', role: 'Fast Frontend Build Tooling' },
  { name: 'Tailwind CSS', role: 'Academic Engineering Design System' },
  { name: 'React Flow (@xyflow/react)', role: 'Interactive Directed State-Machine Graphs' },
  { name: 'Lucide React', role: 'Technical Interface Icons' },
];

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-r from-indigo-900 to-slate-900 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-indigo-500/30 border border-indigo-400/40 p-2 rounded-lg">
            <Cpu size={22} className="text-indigo-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AutomataLab</h1>
            <p className="text-indigo-200 text-sm">
              Mealy &amp; Moore Machine Conversion Simulator
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          An interactive educational simulator built for the University Theory of Computation (TOC) course. AutomataLab allows students and instructors to design finite-state transducers, validate deterministic completeness, visualize step-by-step state-splitting conversions, simulate input strings, and verify behavioral equivalence.
        </p>
      </div>

      {/* Purpose & Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
            <GraduationCap size={18} />
            Educational Purpose
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Students often struggle to visualize why converting a Mealy machine to a Moore machine requires splitting states when incoming transitions carry different outputs. AutomataLab bridges theory and practice by highlighting every mathematical step.
          </p>
          <ul className="space-y-1.5 text-xs text-gray-700 pt-1">
            {[
              'Real-time deterministic machine validation',
              'Authentic Mealy ↔ Moore conversion algorithms',
              'Interactive step-by-step trace & graph visualization',
              'Automated 30-case equivalence verification suite',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle size={13} className="text-emerald-600 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Technologies */}
        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
            <Code2 size={18} />
            Technology Stack
          </div>
          <div className="divide-y divide-gray-100">
            {technologies.map((tech) => (
              <div key={tech.name} className="py-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-800">{tech.name}</span>
                <span className="text-gray-500">{tech.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="card p-6">
        <div className="flex items-center gap-2 text-indigo-700 font-bold text-base mb-4">
          <Users size={18} />
          Project Team Members
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {teamMembers.map((member, index) => (
            <div
              key={member}
              className="p-3.5 rounded-lg border border-gray-200 bg-gray-50 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                {index + 1}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">{member}</div>
                <div className="text-xs text-gray-500">TOC Project Contributor</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

