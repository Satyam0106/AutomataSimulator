import React from 'react';
import type { SimulationResult } from '../types/machine';

interface ExecutionTableProps {
  result: SimulationResult;
  activeStepIndex: number | null;
  machineType: 'mealy' | 'moore';
  onSelectStep?: (stepIdx: number) => void;
}

export const ExecutionTable: React.FC<ExecutionTableProps> = ({
  result,
  activeStepIndex,
  machineType,
  onSelectStep,
}) => {
  return (
    <div className="space-y-4">
      {/* Execution Steps Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="px-3 py-2 text-left">Step</th>
              <th className="px-3 py-2 text-left">Input</th>
              <th className="px-3 py-2 text-left">Current State</th>
              <th className="px-3 py-2 text-left">Next State</th>
              <th className="px-3 py-2 text-left">
                {machineType === 'mealy' ? 'Transition Output' : 'Next State Output'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {machineType === 'moore' && (
              <tr className="bg-indigo-50/40 text-xs">
                <td className="px-3 py-2 font-mono text-gray-500">0 (init)</td>
                <td className="px-3 py-2 font-mono text-gray-400">ε</td>
                <td className="px-3 py-2 font-mono font-semibold text-indigo-700">
                  {result.stateSequence[0]}
                </td>
                <td className="px-3 py-2 font-mono text-gray-400">—</td>
                <td className="px-3 py-2 font-mono font-bold text-emerald-700">
                  {result.outputSequence[0] ?? '—'}
                </td>
              </tr>
            )}
            {result.executionSteps.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-xs text-gray-400">
                  Empty input string — no transitions executed.
                </td>
              </tr>
            )}
            {result.executionSteps.map((step, idx) => {
              const isHighlighted = activeStepIndex === idx;
              return (
                <tr
                  key={step.stepIndex}
                  onClick={() => onSelectStep?.(idx)}
                  className={`cursor-pointer transition-colors ${
                    isHighlighted
                      ? 'bg-amber-50 font-medium'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-3 py-2 font-mono text-xs text-gray-600">
                    {step.stepIndex}
                  </td>
                  <td className="px-3 py-2 font-mono font-semibold text-blue-700">
                    {step.input}
                  </td>
                  <td className="px-3 py-2 font-mono text-gray-800">
                    {step.currentState}
                  </td>
                  <td className="px-3 py-2 font-mono text-indigo-700 font-semibold">
                    {step.nextState}
                  </td>
                  <td className="px-3 py-2 font-mono font-bold text-emerald-700">
                    {step.output}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="text-xs font-semibold text-gray-500 uppercase">
            State Sequence
          </div>
          <div className="font-mono text-sm text-gray-800 mt-1 break-all">
            {result.stateSequence.join(' → ')}
          </div>
        </div>
        <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase">
              Generated Output
            </span>
            {machineType === 'moore' && result.outputSequence.length > 1 && (
              <span className="text-xs text-emerald-600 font-mono">
                After 1st input: {result.outputSequence.slice(1).join('')}
              </span>
            )}
          </div>
          <div className="font-mono text-base font-bold text-emerald-800 mt-1 break-all">
            {result.finalOutput || '(empty)'}
          </div>
        </div>
      </div>
    </div>
  );
};

