import type {
  Machine,
  MealyMachine,
  MooreMachine,
  SimulationResult,
  ExecutionStep,
} from '../types/machine';

/**
 * Simulate a Mealy machine on an input string.
 *
 * Output convention:
 *   - The output sequence has the same length as the input string.
 *   - Output[i] is produced by reading input[i] (transition output).
 *   - No initial output.
 */
function simulateMealy(machine: MealyMachine, inputString: string): SimulationResult {
  const stateSequence: string[] = [machine.initialState];
  const outputSequence: string[] = [];
  const executionSteps: ExecutionStep[] = [];

  let currentState = machine.initialState;

  if (inputString.length === 0) {
    return {
      inputString,
      stateSequence,
      outputSequence: [],
      executionSteps: [],
      finalOutput: '',
      success: true,
    };
  }

  for (let i = 0; i < inputString.length; i++) {
    const symbol = inputString[i];

    // Validate symbol
    if (!machine.alphabet.includes(symbol)) {
      return {
        inputString,
        stateSequence,
        outputSequence,
        executionSteps,
        finalOutput: outputSequence.join(''),
        success: false,
        error: `Symbol "${symbol}" at position ${i + 1} is not in the alphabet { ${machine.alphabet.join(', ')} }.`,
      };
    }

    const transition = machine.transitions.find(
      (t) => t.currentState === currentState && t.input === symbol
    );

    if (!transition) {
      return {
        inputString,
        stateSequence,
        outputSequence,
        executionSteps,
        finalOutput: outputSequence.join(''),
        success: false,
        error: `No transition defined for state "${currentState}" with input "${symbol}".`,
      };
    }

    executionSteps.push({
      stepIndex: i + 1,
      input: symbol,
      currentState,
      nextState: transition.nextState,
      output: transition.output,
      transitionId: transition.id,
    });

    outputSequence.push(transition.output);
    currentState = transition.nextState;
    stateSequence.push(currentState);
  }

  return {
    inputString,
    stateSequence,
    outputSequence,
    executionSteps,
    finalOutput: outputSequence.join(''),
    success: true,
  };
}

/**
 * Simulate a Moore machine on an input string.
 *
 * Output convention:
 *   - The output sequence has length = inputString.length + 1
 *   - Output[0] = λ(initialState)   (initial output before any input)
 *   - Output[i+1] = λ(state reached after reading input[i])
 *   - finalOutput = concatenation of all outputs (including initial)
 *
 * This is the standard Moore machine output convention.
 */
function simulateMoore(machine: MooreMachine, inputString: string): SimulationResult {
  const stateSequence: string[] = [machine.initialState];
  const executionSteps: ExecutionStep[] = [];

  // Initial output (before reading any input)
  const initialOutput = machine.stateOutputs[machine.initialState] ?? '';
  const outputSequence: string[] = [initialOutput];

  let currentState = machine.initialState;

  for (let i = 0; i < inputString.length; i++) {
    const symbol = inputString[i];

    if (!machine.alphabet.includes(symbol)) {
      return {
        inputString,
        stateSequence,
        outputSequence,
        executionSteps,
        finalOutput: outputSequence.join(''),
        success: false,
        error: `Symbol "${symbol}" at position ${i + 1} is not in the alphabet { ${machine.alphabet.join(', ')} }.`,
      };
    }

    const transition = machine.transitions.find(
      (t) => t.currentState === currentState && t.input === symbol
    );

    if (!transition) {
      return {
        inputString,
        stateSequence,
        outputSequence,
        executionSteps,
        finalOutput: outputSequence.join(''),
        success: false,
        error: `No transition defined for state "${currentState}" with input "${symbol}".`,
      };
    }

    const nextOutput = machine.stateOutputs[transition.nextState] ?? '';

    executionSteps.push({
      stepIndex: i + 1,
      input: symbol,
      currentState,
      nextState: transition.nextState,
      output: nextOutput,
      transitionId: transition.id,
    });

    currentState = transition.nextState;
    stateSequence.push(currentState);
    outputSequence.push(nextOutput);
  }

  return {
    inputString,
    stateSequence,
    outputSequence,
    executionSteps,
    finalOutput: outputSequence.join(''),
    success: true,
  };
}

/**
 * Unified simulation entry point.
 */
export function simulateMachine(machine: Machine, inputString: string): SimulationResult {
  if (machine.type === 'mealy') {
    return simulateMealy(machine, inputString);
  } else {
    return simulateMoore(machine, inputString);
  }
}

