import type { MealyMachine, MooreMachine } from '../types/machine';

function gid() {
  return Math.random().toString(36).slice(2, 9);
}

export const EXAMPLE_MACHINES: Array<{
  id: string;
  name: string;
  description: string;
  type: 'mealy' | 'moore';
  machine: MealyMachine | MooreMachine;
}> = [
  // ── 1. Simple Mealy Machine ────────────────────────────────────────────
  {
    id: 'simple-mealy',
    name: 'Simple Mealy Machine',
    description: 'A 2-state Mealy machine that outputs 1 for every 0 input and 0 for every 1 input.',
    type: 'mealy',
    machine: {
      type: 'mealy',
      states: ['q0', 'q1'],
      alphabet: ['0', '1'],
      initialState: 'q0',
      transitions: [
        { id: gid(), currentState: 'q0', input: '0', nextState: 'q1', output: '1' },
        { id: gid(), currentState: 'q0', input: '1', nextState: 'q0', output: '0' },
        { id: gid(), currentState: 'q1', input: '0', nextState: 'q1', output: '0' },
        { id: gid(), currentState: 'q1', input: '1', nextState: 'q0', output: '1' },
      ],
    },
  },

  // ── 2. Mealy State-Splitting Example ────────────────────────────────────
  {
    id: 'mealy-split',
    name: 'Mealy State-Splitting Example',
    description: 'A Mealy machine where q1 is reached with different outputs — requires state splitting during Mealy→Moore conversion.',
    type: 'mealy',
    machine: {
      type: 'mealy',
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b'],
      initialState: 'q0',
      transitions: [
        { id: gid(), currentState: 'q0', input: 'a', nextState: 'q1', output: '0' },
        { id: gid(), currentState: 'q0', input: 'b', nextState: 'q2', output: '1' },
        { id: gid(), currentState: 'q1', input: 'a', nextState: 'q1', output: '1' },
        { id: gid(), currentState: 'q1', input: 'b', nextState: 'q0', output: '0' },
        { id: gid(), currentState: 'q2', input: 'a', nextState: 'q1', output: '1' },
        { id: gid(), currentState: 'q2', input: 'b', nextState: 'q0', output: '0' },
      ],
    },
  },

  // ── 3. Simple Moore Machine ──────────────────────────────────────────────
  {
    id: 'simple-moore',
    name: 'Simple Moore Machine',
    description: 'A 2-state Moore machine with binary outputs on each state.',
    type: 'moore',
    machine: {
      type: 'moore',
      states: ['q0', 'q1'],
      alphabet: ['0', '1'],
      initialState: 'q0',
      stateOutputs: { q0: '0', q1: '1' },
      transitions: [
        { id: gid(), currentState: 'q0', input: '0', nextState: 'q1' },
        { id: gid(), currentState: 'q0', input: '1', nextState: 'q0' },
        { id: gid(), currentState: 'q1', input: '0', nextState: 'q1' },
        { id: gid(), currentState: 'q1', input: '1', nextState: 'q0' },
      ],
    },
  },

  // ── 4. Moore Conversion Example ─────────────────────────────────────────
  {
    id: 'moore-convert',
    name: 'Moore Conversion Example',
    description: 'A 3-state Moore machine ideal for demonstrating Moore→Mealy conversion.',
    type: 'moore',
    machine: {
      type: 'moore',
      states: ['q0', 'q1', 'q2'],
      alphabet: ['0', '1'],
      initialState: 'q0',
      stateOutputs: { q0: '0', q1: '1', q2: '0' },
      transitions: [
        { id: gid(), currentState: 'q0', input: '0', nextState: 'q1' },
        { id: gid(), currentState: 'q0', input: '1', nextState: 'q0' },
        { id: gid(), currentState: 'q1', input: '0', nextState: 'q2' },
        { id: gid(), currentState: 'q1', input: '1', nextState: 'q0' },
        { id: gid(), currentState: 'q2', input: '0', nextState: 'q1' },
        { id: gid(), currentState: 'q2', input: '1', nextState: 'q2' },
      ],
    },
  },

  // ── 5. Complex Mealy Machine ─────────────────────────────────────────────
  {
    id: 'complex-mealy',
    name: 'Complex Mealy Machine',
    description: 'A 4-state Mealy machine with alphabet {0,1} featuring multiple state splits.',
    type: 'mealy',
    machine: {
      type: 'mealy',
      states: ['A', 'B', 'C', 'D'],
      alphabet: ['0', '1'],
      initialState: 'A',
      transitions: [
        { id: gid(), currentState: 'A', input: '0', nextState: 'B', output: '0' },
        { id: gid(), currentState: 'A', input: '1', nextState: 'C', output: '1' },
        { id: gid(), currentState: 'B', input: '0', nextState: 'D', output: '1' },
        { id: gid(), currentState: 'B', input: '1', nextState: 'A', output: '0' },
        { id: gid(), currentState: 'C', input: '0', nextState: 'B', output: '1' },
        { id: gid(), currentState: 'C', input: '1', nextState: 'D', output: '0' },
        { id: gid(), currentState: 'D', input: '0', nextState: 'A', output: '1' },
        { id: gid(), currentState: 'D', input: '1', nextState: 'B', output: '0' },
      ],
    },
  },

  // ── 6. Complex Moore Machine ─────────────────────────────────────────────
  {
    id: 'complex-moore',
    name: 'Complex Moore Machine',
    description: 'A 4-state Moore machine with alphabet {a,b,c} demonstrating a richer state structure.',
    type: 'moore',
    machine: {
      type: 'moore',
      states: ['s0', 's1', 's2', 's3'],
      alphabet: ['a', 'b'],
      initialState: 's0',
      stateOutputs: { s0: '0', s1: '1', s2: '0', s3: '1' },
      transitions: [
        { id: gid(), currentState: 's0', input: 'a', nextState: 's1' },
        { id: gid(), currentState: 's0', input: 'b', nextState: 's2' },
        { id: gid(), currentState: 's1', input: 'a', nextState: 's0' },
        { id: gid(), currentState: 's1', input: 'b', nextState: 's3' },
        { id: gid(), currentState: 's2', input: 'a', nextState: 's3' },
        { id: gid(), currentState: 's2', input: 'b', nextState: 's0' },
        { id: gid(), currentState: 's3', input: 'a', nextState: 's2' },
        { id: gid(), currentState: 's3', input: 'b', nextState: 's1' },
      ],
    },
  },
];

