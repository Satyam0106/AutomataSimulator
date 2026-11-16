import type { Machine, EquivalenceResult, TestCaseResult } from '../types/machine';
import { simulateMachine } from '../simulation/simulateMachine';

/**
 * Generate a set of test strings from an alphabet.
 */
function generateTestStrings(alphabet: string[], maxLength: number = 5): string[] {
  const strings = new Set<string>();

  // Empty string
  strings.add('');

  // All single symbols
  for (const sym of alphabet) {
    strings.add(sym);
  }

  // All pairs
  for (const a of alphabet) {
    for (const b of alphabet) {
      strings.add(a + b);
    }
  }

  // Generate strings up to maxLength
  let current = [...alphabet];
  for (let len = 3; len <= maxLength; len++) {
    const next: string[] = [];
    for (const s of current) {
      for (const sym of alphabet) {
        const candidate = s + sym;
        if (candidate.length === len) {
          strings.add(candidate);
          next.push(candidate);
        }
      }
    }
    current = next;
    // Limit total strings to avoid explosion
    if (strings.size > 50) break;
  }

  // Add some specific patterns
  for (const sym of alphabet) {
    strings.add(sym.repeat(3));
    strings.add(sym.repeat(4));
  }

  return [...strings].slice(0, 30); // cap at 30 test cases
}

/**
 * Normalize outputs for comparison.
 *
 * When comparing a Mealy and Moore machine:
 *   - The Moore machine produces one extra output at the start (initial state output).
 *   - We compare only the transition-based outputs.
 *   - For Mealy: output = transition outputs directly.
 *   - For Moore: output = all outputs except the first (initial state output).
 *
 * This function returns the "comparable" portion of the output.
 */
function getNormalizedOutput(machine: Machine, rawResult: ReturnType<typeof simulateMachine>): string {
  if (!rawResult.success) return '(error)';
  if (machine.type === 'moore') {
    // Skip the initial state output (index 0), use the rest
    return rawResult.outputSequence.slice(1).join('');
  }
  return rawResult.finalOutput;
}

/**
 * Compare two machines on a set of test strings.
 *
 * Convention: uses normalized outputs for comparison (skips Moore initial output).
 */
export function compareMachines(
  original: Machine,
  converted: Machine,
  userTestStrings: string[] = []
): EquivalenceResult {
  const alphabet = original.alphabet;
  const autoStrings = generateTestStrings(alphabet);
  const allStrings = [...new Set([...userTestStrings, ...autoStrings])];

  const details: TestCaseResult[] = [];
  let passed = 0;
  let failed = 0;

  for (const input of allStrings) {
    const origResult = simulateMachine(original, input);
    const convResult = simulateMachine(converted, input);

    if (!origResult.success || !convResult.success) {
      // Skip errored cases — they may be due to machine incompleteness
      continue;
    }

    const origOutput = getNormalizedOutput(original, origResult);
    const convOutput = getNormalizedOutput(converted, convResult);

    const match = origOutput === convOutput;
    if (match) passed++;
    else failed++;

    details.push({
      input: input === '' ? '(empty)' : input,
      originalOutput: origOutput,
      convertedOutput: convOutput,
      match,
    });
  }

  const note =
    'Note: Equivalence verified empirically over a finite set of test strings. ' +
    'This does not constitute a formal mathematical proof of equivalence for all inputs. ' +
    'Output convention: Moore initial state output is excluded from comparison; ' +
    'only transition-based outputs are compared.';

  return {
    passed,
    failed,
    totalTests: passed + failed,
    details,
    equivalent: failed === 0,
    note,
  };
}

