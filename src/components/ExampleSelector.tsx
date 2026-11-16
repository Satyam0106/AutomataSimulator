import React from 'react';
import { EXAMPLE_MACHINES } from '../data/exampleMachines';
import type { MealyMachine, MooreMachine, ConversionMode } from '../types/machine';
import { BookOpen } from 'lucide-react';

interface ExampleSelectorProps {
  mode: ConversionMode;
  onLoad: (machine: MealyMachine | MooreMachine) => void;
}

export const ExampleSelector: React.FC<ExampleSelectorProps> = ({ mode, onLoad }) => {
  const [selected, setSelected] = React.useState('');

  const machineType = mode === 'mealy-to-moore' ? 'mealy' : 'moore';
  const examples = EXAMPLE_MACHINES.filter((e) => e.type === machineType);

  const handleLoad = () => {
    const example = examples.find((e) => e.id === selected);
    if (example) {
      onLoad(example.machine as MealyMachine | MooreMachine);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <BookOpen size={15} className="text-indigo-500 flex-shrink-0" />
      <select
        className="select-field flex-1 min-w-48 text-xs py-1.5"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">— Load an example machine —</option>
        {examples.map((e) => (
          <option key={e.id} value={e.id}>{e.name}</option>
        ))}
      </select>
      <button
        onClick={handleLoad}
        disabled={!selected}
        className="btn-secondary text-xs py-1.5"
      >
        Load
      </button>
    </div>
  );
};

