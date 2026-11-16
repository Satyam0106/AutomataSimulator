import { validateMachine } from '../algorithms/validateMachine';
import { mealyToMoore } from '../algorithms/mealyToMoore';
import { mooreToMealy } from '../algorithms/mooreToMealy';
import { simulateMachine } from '../simulation/simulateMachine';
import { compareMachines } from '../algorithms/equivalence';
import { EXAMPLE_MACHINES } from '../data/exampleMachines';
import type { MealyMachine, MooreMachine } from '../types/machine';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runAllTests(): { passed: number; results: string[] } {
  const results: string[] = [];
  let passed = 0;

  function test(name: string, fn: () => void) {
    fn();
    passed++;
    results.push(`PASS: ${name}`);
  }

  // ── 1. Validation Tests ────────────────────────────────────────────────
  test('Validation: valid example machines pass', () => {
    for (const ex of EXAMPLE_MACHINES) {
      const res = validateMachine(ex.machine);
      assert(res.valid, `Expected ${ex.id} to be valid`);
    }
  });

  test('Validation: detects missing state', () => {
    const m: MealyMachine = {
      type: 'mealy',
      states: [],
      alphabet: ['0'],
      initialState: '',
      transitions: [],
    };
    const res = validateMachine(m);
    assert(!res.valid, 'Empty states should be invalid');
  });

  test('Validation: detects missing transition', () => {
    const m: MealyMachine = {
      type: 'mealy',
      states: ['q0', 'q1'],
      alphabet: ['0', '1'],
      initialState: 'q0',
      transitions: [
        { id: '1', currentState: 'q0', input: '0', nextState: 'q1', output: '1' },
      ],
    };
    const res = validateMachine(m);
    assert(!res.valid, 'Incomplete transitions should be invalid');
    assert(
      res.issues.some((i) => i.message.includes('Missing transition')),
      'Should report missing transition'
    );
  });

  test('Validation: detects duplicate transition', () => {
    const m: MealyMachine = {
      type: 'mealy',
      states: ['q0'],
      alphabet: ['0'],
      initialState: 'q0',
      transitions: [
        { id: '1', currentState: 'q0', input: '0', nextState: 'q0', output: '0' },
        { id: '2', currentState: 'q0', input: '0', nextState: 'q0', output: '1' },
      ],
    };
    const res = validateMachine(m);
    assert(!res.valid, 'Duplicate transition should fail validation');
  });

  // ── 2. Mealy → Moore Tests ─────────────────────────────────────────────
  test('Mealy → Moore: simple machine without state splitting', () => {
    const simpleMealy = EXAMPLE_MACHINES.find((e) => e.id === 'simple-mealy')!
      .machine as MealyMachine;
    const conv = mealyToMoore(simpleMealy);
    assert(conv.convertedMachine.type === 'moore', 'Converted must be moore');
    const v = validateMachine(conv.convertedMachine);
    assert(v.valid, 'Converted Moore machine must be valid');
    const eq = compareMachines(simpleMealy, conv.convertedMachine, ['010011']);
    assert(eq.equivalent, 'Simple Mealy and converted Moore must be equivalent');
  });

  test('Mealy → Moore: state splitting when state receives multiple outputs', () => {
    const splitMealy = EXAMPLE_MACHINES.find((e) => e.id === 'mealy-split')!
      .machine as MealyMachine;
    const conv = mealyToMoore(splitMealy);
    const moore = conv.convertedMachine as MooreMachine;
    assert(
      moore.states.includes('q1_0') && moore.states.includes('q1_1'),
      'State q1 must be split into q1_0 and q1_1'
    );
    assert(moore.stateOutputs['q1_0'] === '0', 'q1_0 output must be 0');
    assert(moore.stateOutputs['q1_1'] === '1', 'q1_1 output must be 1');
    const v = validateMachine(moore);
    assert(v.valid, 'Split Moore machine must be deterministic and valid');
    const eq = compareMachines(splitMealy, moore, ['abaab', 'bbaa']);
    assert(eq.equivalent, 'Split Moore machine must match original Mealy outputs');
  });

  test('Mealy → Moore: complex 4-state Mealy machine', () => {
    const complexMealy = EXAMPLE_MACHINES.find((e) => e.id === 'complex-mealy')!
      .machine as MealyMachine;
    const conv = mealyToMoore(complexMealy);
    const v = validateMachine(conv.convertedMachine);
    assert(v.valid, 'Converted complex Moore machine must be valid');
    const eq = compareMachines(complexMealy, conv.convertedMachine, ['010011', '110100']);
    assert(eq.equivalent, 'Complex Mealy and converted Moore must be equivalent');
  });

  // ── 3. Moore → Mealy Tests ─────────────────────────────────────────────
  test('Moore → Mealy: simple & 3-state conversion', () => {
    const mooreEx = EXAMPLE_MACHINES.find((e) => e.id === 'moore-convert')!
      .machine as MooreMachine;
    const conv = mooreToMealy(mooreEx);
    assert(conv.convertedMachine.type === 'mealy', 'Converted must be mealy');
    assert(
      conv.convertedMachine.states.length === mooreEx.states.length,
      'Moore → Mealy preserves state count'
    );
    const v = validateMachine(conv.convertedMachine);
    assert(v.valid, 'Converted Mealy machine must be valid');
    const eq = compareMachines(mooreEx, conv.convertedMachine, ['010011']);
    assert(eq.equivalent, 'Moore and converted Mealy must be equivalent');
  });

  // ── 4. Simulation Tests ────────────────────────────────────────────────
  test('Simulation: empty, single, and multi-symbol strings', () => {
    const simpleMealy = EXAMPLE_MACHINES.find((e) => e.id === 'simple-mealy')!
      .machine as MealyMachine;
    const emptySim = simulateMachine(simpleMealy, '');
    assert(emptySim.success && emptySim.finalOutput === '', 'Empty input works');

    const singleSim = simulateMachine(simpleMealy, '0');
    assert(singleSim.success && singleSim.finalOutput === '1', 'Single input works');

    const multiSim = simulateMachine(simpleMealy, '010011');
    assert(multiSim.success && multiSim.executionSteps.length === 6, '6 steps executed');
  });

  test('Simulation: rejects invalid alphabet symbol', () => {
    const simpleMealy = EXAMPLE_MACHINES.find((e) => e.id === 'simple-mealy')!
      .machine as MealyMachine;
    const badSim = simulateMachine(simpleMealy, '01x0');
    assert(!badSim.success && Boolean(badSim.error), 'Invalid symbol rejected cleanly');
  });

  // ── 5. Equivalence Checker Tests ───────────────────────────────────────
  test('Equivalence: detects non-equivalent machines', () => {
    const m1 = EXAMPLE_MACHINES.find((e) => e.id === 'simple-mealy')!
      .machine as MealyMachine;
    const m2: MealyMachine = {
      ...structuredClone(m1),
      transitions: m1.transitions.map((t) => ({ ...t, output: '0' })),
    };
    const eq = compareMachines(m1, m2, ['010']);
    assert(!eq.equivalent && eq.failed > 0, 'Must detect differing outputs');
  });

  return { passed, results };
}

