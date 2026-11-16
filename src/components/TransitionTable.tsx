import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { MealyMachine, MealyTransition } from '../types/machine';

function gid() {
  return Math.random().toString(36).slice(2, 9);
}

interface TransitionTableProps {
  machine: MealyMachine;
  onChange: (machine: MealyMachine) => void;
}

export const TransitionTable: React.FC<TransitionTableProps> = ({ machine, onChange }) => {
  const handleAdd = () => {
    const t: MealyTransition = {
      id: gid(),
      currentState: machine.states[0] ?? '',
      input: machine.alphabet[0] ?? '',
      nextState: machine.states[0] ?? '',
      output: '0',
    };
    onChange({ ...machine, transitions: [...machine.transitions, t] });
  };

  const handleUpdate = (id: string, field: keyof Omit<MealyTransition, 'id'>, value: string) => {
    onChange({
      ...machine,
      transitions: machine.transitions.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      ),
    });
  };

  const handleRemove = (id: string) => {
    onChange({ ...machine, transitions: machine.transitions.filter((t) => t.id !== id) });
  };

  return (
    <div className="card overflow-hidden">
      <div className="card-header">
        <h3 className="text-sm font-semibold text-gray-700">Mealy Transitions</h3>
        <button onClick={handleAdd} className="btn-primary text-xs py-1.5">
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
              <th className="px-4 py-2.5 text-left">Output</th>
              <th className="px-4 py-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {machine.transitions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400 text-xs">
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
                    onChange={(e) => handleUpdate(t.id, 'currentState', e.target.value)}
                  >
                    {machine.states.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <select
                    className="select-field py-1 text-xs w-20"
                    value={t.input}
                    onChange={(e) => handleUpdate(t.id, 'input', e.target.value)}
                  >
                    {machine.alphabet.map((a) => <option key={a}>{a}</option>)}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <select
                    className="select-field py-1 text-xs"
                    value={t.nextState}
                    onChange={(e) => handleUpdate(t.id, 'nextState', e.target.value)}
                  >
                    {machine.states.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    className="input-field py-1 text-xs w-20"
                    value={t.output}
                    onChange={(e) => handleUpdate(t.id, 'output', e.target.value)}
                    maxLength={5}
                    placeholder="output"
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => handleRemove(t.id)} className="text-gray-400 hover:text-red-500">
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
  );
};

