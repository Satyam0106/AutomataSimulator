import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { MooreMachine, MooreTransition } from '../types/machine';

function gid() {
  return Math.random().toString(36).slice(2, 9);
}

interface StateTableProps {
  machine: MooreMachine;
  onChange: (machine: MooreMachine) => void;
}

export const StateTable: React.FC<StateTableProps> = ({ machine, onChange }) => {
  const handleAddTransition = () => {
    const t: MooreTransition = {
      id: gid(),
      currentState: machine.states[0] ?? '',
      input: machine.alphabet[0] ?? '',
      nextState: machine.states[0] ?? '',
    };
    onChange({ ...machine, transitions: [...machine.transitions, t] });
  };

  const handleUpdateTransition = (id: string, field: keyof Omit<MooreTransition, 'id'>, value: string) => {
    onChange({
      ...machine,
      transitions: machine.transitions.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      ),
    });
  };

  const handleRemoveTransition = (id: string) => {
    onChange({ ...machine, transitions: machine.transitions.filter((t) => t.id !== id) });
  };

  return (
    <div className="space-y-4">
      {/* State Outputs Table */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h3 className="text-sm font-semibold text-gray-700">State Outputs</h3>
          <span className="badge-blue">λ(state) = output</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-2.5 text-left">State</th>
                <th className="px-4 py-2.5 text-left">Output λ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {machine.states.map((state) => (
                <tr key={state} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <span className="font-mono font-medium text-gray-800">{state}</span>
                    {state === machine.initialState && (
                      <span className="ml-2 badge-blue">initial</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-emerald-700 font-medium">
                      {machine.stateOutputs[state] ?? '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transitions Table */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h3 className="text-sm font-semibold text-gray-700">Moore Transitions</h3>
          <button onClick={handleAddTransition} className="btn-primary text-xs py-1.5">
            <Plus size={13} /> Add Transition
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-2.5 text-left">Current State</th>
                <th className="px-4 py-2.5 text-left">Input</th>
                <th className="px-4 py-2.5 text-left">Next State</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {machine.transitions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-xs">
                    No transitions. Click "Add Transition" to create one.
                  </td>
                </tr>
              )}
              {machine.transitions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <select
                      className="select-field py-1 text-xs"
                      value={t.currentState}
                      onChange={(e) => handleUpdateTransition(t.id, 'currentState', e.target.value)}
                    >
                      {machine.states.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <select
                      className="select-field py-1 text-xs w-20"
                      value={t.input}
                      onChange={(e) => handleUpdateTransition(t.id, 'input', e.target.value)}
                    >
                      {machine.alphabet.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <select
                      className="select-field py-1 text-xs"
                      value={t.nextState}
                      onChange={(e) => handleUpdateTransition(t.id, 'nextState', e.target.value)}
                    >
                      {machine.states.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => handleRemoveTransition(t.id)} className="text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {machine.transitions.length > 0 && (
          <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 border-t border-gray-100">
            {machine.transitions.length} transition{machine.transitions.length !== 1 ? 's' : ''} defined
          </div>
        )}
      </div>
    </div>
  );
};

