import React from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import type { MealyMachine, MooreMachine } from '../types/machine';
import { addState, removeState } from '../utils/machineUtils';

interface MachineBuilderProps {
  machine: MealyMachine | MooreMachine;
  onChange: (machine: MealyMachine | MooreMachine) => void;
}

export const MachineBuilder: React.FC<MachineBuilderProps> = ({ machine, onChange }) => {
  const [newState, setNewState] = React.useState('');
  const [newSymbol, setNewSymbol] = React.useState('');
  const [stateError, setStateError] = React.useState('');
  const [symbolError, setSymbolError] = React.useState('');

  const handleAddState = () => {
    const name = newState.trim();
    if (!name) return;
    if (machine.states.includes(name)) {
      setStateError(`State "${name}" already exists.`);
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      setStateError('State names must be alphanumeric (letters, digits, underscore).');
      return;
    }
    setStateError('');
    onChange(addState(machine, name) as MealyMachine | MooreMachine);
    setNewState('');
  };

  const handleRemoveState = (state: string) => {
    onChange(removeState(machine, state) as MealyMachine | MooreMachine);
  };

  const handleAddSymbol = () => {
    const sym = newSymbol.trim();
    if (!sym) return;
    if (machine.alphabet.includes(sym)) {
      setSymbolError(`Symbol "${sym}" already in alphabet.`);
      return;
    }
    if (sym.length > 3) {
      setSymbolError('Symbols must be at most 3 characters.');
      return;
    }
    setSymbolError('');
    onChange({ ...machine, alphabet: [...machine.alphabet, sym] } as MealyMachine | MooreMachine);
    setNewSymbol('');
  };

  const handleRemoveSymbol = (sym: string) => {
    onChange({ ...machine, alphabet: machine.alphabet.filter((s) => s !== sym) } as MealyMachine | MooreMachine);
  };

  const handleInitialState = (state: string) => {
    onChange({ ...machine, initialState: state } as MealyMachine | MooreMachine);
  };

  const handleMooreOutput = (state: string, output: string) => {
    if (machine.type !== 'moore') return;
    onChange({ ...machine, stateOutputs: { ...machine.stateOutputs, [state]: output } } as MooreMachine);
  };

  return (
    <div className="space-y-5">
      {/* States */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">States</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {machine.states.map((state) => (
            <div
              key={state}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-sm font-mono ${
                state === machine.initialState
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              {state === machine.initialState && (
                <span className="text-xs text-indigo-500">→</span>
              )}
              {state}
              {machine.states.length > 1 && (
                <button
                  onClick={() => handleRemoveState(state)}
                  className="text-gray-400 hover:text-red-500 ml-0.5"
                  title="Remove state"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="State name (e.g. q2)"
            value={newState}
            onChange={(e) => { setNewState(e.target.value); setStateError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleAddState()}
            maxLength={20}
          />
          <button onClick={handleAddState} className="btn-secondary">
            <Plus size={14} /> Add
          </button>
        </div>
        {stateError && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle size={11} /> {stateError}
          </p>
        )}
      </div>

      {/* Alphabet */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Input Alphabet</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {machine.alphabet.map((sym) => (
            <div key={sym} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm font-mono">
              {sym}
              {machine.alphabet.length > 1 && (
                <button
                  onClick={() => handleRemoveSymbol(sym)}
                  className="text-blue-400 hover:text-red-500 ml-0.5"
                  title="Remove symbol"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="Symbol (e.g. 0, 1, a)"
            value={newSymbol}
            onChange={(e) => { setNewSymbol(e.target.value); setSymbolError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSymbol()}
            maxLength={3}
          />
          <button onClick={handleAddSymbol} className="btn-secondary">
            <Plus size={14} /> Add
          </button>
        </div>
        {symbolError && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle size={11} /> {symbolError}
          </p>
        )}
      </div>

      {/* Initial State */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Initial State</h3>
        <select
          className="select-field max-w-xs"
          value={machine.initialState}
          onChange={(e) => handleInitialState(e.target.value)}
        >
          {machine.states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Moore State Outputs */}
      {machine.type === 'moore' && (
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">State Outputs</h3>
          <p className="text-xs text-gray-500 mb-3">Each state must have exactly one output value.</p>
          <div className="space-y-2">
            {machine.states.map((state) => (
              <div key={state} className="flex items-center gap-3">
                <span className="font-mono text-sm text-gray-700 w-16">{state}</span>
                <span className="text-gray-400 text-xs">λ =</span>
                <input
                  type="text"
                  className="input-field w-24"
                  value={machine.stateOutputs[state] ?? ''}
                  onChange={(e) => handleMooreOutput(state, e.target.value)}
                  placeholder="output"
                  maxLength={5}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

