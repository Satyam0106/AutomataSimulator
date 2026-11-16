import React from 'react';
import { BookOpen, ArrowRight, GitBranch, Info, CheckCircle2 } from 'lucide-react';
import type { AppPage } from '../types/machine';

interface TheoryProps {
  onNavigate: (page: AppPage) => void;
}

export const Theory: React.FC<TheoryProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-2">
            <BookOpen size={15} /> Theory of Computation Reference
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Mealy &amp; Moore Finite-State Transducers
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Mathematical definitions, output timing conventions, and formal equivalence conversion algorithms.
          </p>
        </div>
        <button
          onClick={() => onNavigate('simulator')}
          className="btn-primary self-start sm:self-auto"
        >
          Open Simulator <ArrowRight size={15} />
        </button>
      </div>

      {/* 1. What is an FSM with Output? */}
      <section className="card p-6 space-y-3">
        <h2 className="text-lg font-bold text-gray-900">
          1. What is a Finite-State Machine with Output?
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          Unlike standard Deterministic Finite Automata (DFAs) that only <em>accept</em> or{' '}
          <em>reject</em> strings, <strong>Finite-State Transducers</strong> generate an output
          string while processing an input string. The two fundamental transducer models in
          Theory of Computation and digital logic design are the <strong>Mealy Machine</strong>{' '}
          and the <strong>Moore Machine</strong>.
        </p>
      </section>

      {/* 2. Mealy vs Moore Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mealy Machine */}
        <div className="card p-6 space-y-4 border-t-4 border-t-indigo-600">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Mealy Machine</h2>
            <span className="badge-blue">Transition-Based Output</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            A Mealy machine is a 6-tuple{' '}
            <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
              M = (Q, Σ, Δ, δ, λ, q₀)
            </code>{' '}
            where output depends on both the <strong>current state</strong> and the{' '}
            <strong>current input symbol</strong>.
          </p>
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-lg p-3 font-mono text-xs space-y-1 text-indigo-950">
            <div>δ : Q × Σ → Q &nbsp;&nbsp;(Next-state function)</div>
            <div>λ : Q × Σ → Δ &nbsp;&nbsp;(Output function)</div>
            <div className="pt-1 text-indigo-700 font-bold">
              Output = f(Current State, Input)
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-500 uppercase">
              Graph Notation
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-mono text-xs text-gray-800">
              q0 —— 0 / 1 ——&gt; q1
              <div className="text-gray-500 mt-1">
                (On input 0, transition from q0 to q1 and emit output 1)
              </div>
            </div>
          </div>
        </div>

        {/* Moore Machine */}
        <div className="card p-6 space-y-4 border-t-4 border-t-emerald-600">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Moore Machine</h2>
            <span className="badge-green">State-Based Output</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            A Moore machine is a 6-tuple{' '}
            <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
              M = (Q, Σ, Δ, δ, λ, q₀)
            </code>{' '}
            where output depends <strong>solely on the current state</strong>, independent of how
            that state was reached.
          </p>
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg p-3 font-mono text-xs space-y-1 text-emerald-950">
            <div>δ : Q × Σ → Q &nbsp;&nbsp;(Next-state function)</div>
            <div>λ : Q → Δ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(State output function)</div>
            <div className="pt-1 text-emerald-700 font-bold">
              Output = f(Current State)
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-500 uppercase">
              Graph Notation
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-mono text-xs text-gray-800">
              ( q0 / 0 ) —— 0 ——&gt; ( q1 / 1 )
              <div className="text-gray-500 mt-1">
                (State q0 outputs 0; on input 0 move to state q1 which outputs 1)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Key Differences Table */}
      <section className="card overflow-hidden">
        <div className="card-header">
          <h2 className="text-base font-bold text-gray-900">
            Comparison: Mealy vs. Moore Machines
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-left">Property</th>
                <th className="px-4 py-3 text-left">Mealy Machine</th>
                <th className="px-4 py-3 text-left">Moore Machine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-3 font-medium text-gray-800">Output Function</td>
                <td className="px-4 py-3 font-mono text-xs text-indigo-700">λ(q, a) ∈ Δ</td>
                <td className="px-4 py-3 font-mono text-xs text-emerald-700">λ(q) ∈ Δ</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-800">Output Placement</td>
                <td className="px-4 py-3 text-gray-600">On directed transition edges (input/output)</td>
                <td className="px-4 py-3 text-gray-600">Inside state nodes (state/output)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-800">Output String Length (for input length n)</td>
                <td className="px-4 py-3 font-mono text-xs">n symbols</td>
                <td className="px-4 py-3 font-mono text-xs">n + 1 symbols (includes initial state output λ(q₀))</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-800">Number of States</td>
                <td className="px-4 py-3 text-gray-600">Generally fewer states (compact)</td>
                <td className="px-4 py-3 text-gray-600">May require up to |Q| × |Δ| states due to state splitting</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Conversion Algorithms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
            <GitBranch size={18} />
            Algorithm 1: Moore → Mealy Conversion
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Converting a Moore machine to an equivalent Mealy machine is straightforward and never increases the number of states:
          </p>
          <ul className="space-y-2 text-xs text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-indigo-600 flex-shrink-0 mt-0.5" />
              <span>Keep the exact same set of states <code className="font-mono">Q</code> and initial state <code className="font-mono">q₀</code>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-indigo-600 flex-shrink-0 mt-0.5" />
              <span>Keep the same transition function <code className="font-mono">δ_mealy(q, a) = δ_moore(q, a)</code>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-indigo-600 flex-shrink-0 mt-0.5" />
              <span>
                Define each Mealy transition&apos;s output as the output of the destination Moore state:{' '}
                <code className="font-mono font-bold text-indigo-700">
                  λ_mealy(q, a) = λ_moore(δ_moore(q, a))
                </code>.
              </span>
            </li>
          </ul>
        </div>

        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
            <GitBranch size={18} />
            Algorithm 2: Mealy → Moore Conversion (State Splitting)
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            In a Mealy machine, two different transitions entering the same state <code className="font-mono">q</code> might carry different outputs (e.g., <code className="font-mono">0</code> and <code className="font-mono">1</code>). Because a Moore state can only have a single fixed output, we must split <code className="font-mono">q</code>:
          </p>
          <ul className="space-y-2 text-xs text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-indigo-600 flex-shrink-0 mt-0.5" />
              <span>Inspect all incoming transitions to every state <code className="font-mono">q</code>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-indigo-600 flex-shrink-0 mt-0.5" />
              <span>
                If state <code className="font-mono">q</code> is entered with multiple distinct outputs{' '}
                <code className="font-mono">&#123;z₁, z₂, ...&#125;</code>, split <code className="font-mono">q</code> into separate Moore states <code className="font-mono">q_z₁, q_z₂, ...</code> with outputs <code className="font-mono">z₁, z₂, ...</code>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-indigo-600 flex-shrink-0 mt-0.5" />
              <span>
                Each split state <code className="font-mono">q_zᵢ</code> inherits the outgoing transitions of <code className="font-mono">q</code>, routed to the appropriate destination <code className="font-mono">(nextState, output)</code> state.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* 5. Initial Output Convention Note */}
      <section className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
        <Info size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-sm text-amber-900">
          <h3 className="font-bold">Why Initial Output Timing Matters</h3>
          <p className="text-xs leading-relaxed">
            A Moore machine immediately emits <code className="font-mono">λ(q₀)</code> upon initialization (before any input symbol is read). On an input string <code className="font-mono">w = a₁a₂...aₙ</code>, the Moore machine produces <code className="font-mono">λ(q₀)λ(q₁)...λ(qₙ)</code> of length <code className="font-mono">n + 1</code>, whereas the equivalent Mealy machine produces <code className="font-mono">λ(q₀, a₁)...λ(qₙ₋₁, aₙ)</code> of length <code className="font-mono">n</code>. Therefore, formal equivalence between a Moore machine and a Mealy machine holds when ignoring the first (0-th step) output of the Moore machine.
          </p>
        </div>
      </section>
    </div>
  );
};

