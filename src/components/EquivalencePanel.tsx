import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  GitCompare,
  Play,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Machine, EquivalenceResult } from '../types/machine';
import { compareMachines } from '../algorithms/equivalence';
import { simulateMachine } from '../simulation/simulateMachine';

interface EquivalencePanelProps {
  originalMachine: Machine;
  convertedMachine: Machine;
}

export const EquivalencePanel: React.FC<EquivalencePanelProps> = ({
  originalMachine,
  convertedMachine,
}) => {
  const [customInput, setCustomInput] = useState(
    originalMachine.alphabet.length >= 2
      ? `${originalMachine.alphabet[0]}${originalMachine.alphabet[1]}${originalMachine.alphabet[0]}${originalMachine.alphabet[0]}${originalMachine.alphabet[1]}${originalMachine.alphabet[1]}`
      : originalMachine.alphabet[0]?.repeat(4) ?? ''
  );

  const [singleComparison, setSingleComparison] = useState<{
    input: string;
    origRawOutput: string;
    convRawOutput: string;
    origNormalized: string;
    convNormalized: string;
    match: boolean;
    error?: string;
  } | null>(null);

  const [suiteResult, setSuiteResult] = useState<EquivalenceResult | null>(null);
  const [showAllTests, setShowAllTests] = useState(false);

  const handleCompareSingle = () => {
    const trimmed = customInput.trim();
    const res1 = simulateMachine(originalMachine, trimmed);
    const res2 = simulateMachine(convertedMachine, trimmed);

    if (!res1.success || !res2.success) {
      setSingleComparison({
        input: trimmed,
        origRawOutput: '',
        convRawOutput: '',
        origNormalized: '',
        convNormalized: '',
        match: false,
        error: res1.error || res2.error || 'Simulation failed.',
      });
      return;
    }

    const origNormalized =
      originalMachine.type === 'moore'
        ? res1.outputSequence.slice(1).join('')
        : res1.finalOutput;

    const convNormalized =
      convertedMachine.type === 'moore'
        ? res2.outputSequence.slice(1).join('')
        : res2.finalOutput;

    setSingleComparison({
      input: trimmed,
      origRawOutput: res1.finalOutput,
      convRawOutput: res2.finalOutput,
      origNormalized,
      convNormalized,
      match: origNormalized === convNormalized,
    });
  };

  const handleRunTestSuite = () => {
    const res = compareMachines(
      originalMachine,
      convertedMachine,
      customInput.trim() ? [customInput.trim()] : []
    );
    setSuiteResult(res);
  };

  return (
    <div className="card overflow-hidden">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <GitCompare size={16} className="text-indigo-600" />
          <h3 className="text-sm font-semibold text-gray-800">
            Compare Machines &amp; Equivalence Verification
          </h3>
        </div>
        <button onClick={handleRunTestSuite} className="btn-primary text-xs py-1.5">
          <Play size={13} /> Run Test Suite
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* Output Convention Box */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-blue-800 leading-relaxed">
          <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Output Convention:</strong> Moore machines produce an initial state output{' '}
            <code className="bg-blue-100 px-1 rounded">λ(q₀)</code> before reading any input,
            whereas Mealy machines produce output only on transitions. For length{' '}
            <code className="bg-blue-100 px-1 rounded">n</code> input, Moore outputs{' '}
            <code className="bg-blue-100 px-1 rounded">n + 1</code> symbols and Mealy outputs{' '}
            <code className="bg-blue-100 px-1 rounded">n</code> symbols. Equivalence comparison
            compares the <strong className="underline">transition-triggered outputs</strong>{' '}
            (excluding the Moore machine&apos;s initial state output prior to the first input).
          </div>
        </div>

        {/* Single String Comparison */}
        <div className="space-y-3">
          <label
            htmlFor="equiv-input"
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider"
          >
            Compare on Specific Input String
          </label>
          <div className="flex gap-2">
            <input
              id="equiv-input"
              type="text"
              className="input-field font-mono max-w-md"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter test string (e.g. 010011)"
              onKeyDown={(e) => e.key === 'Enter' && handleCompareSingle()}
            />
            <button onClick={handleCompareSingle} className="btn-secondary">
              Compare String
            </button>
          </div>

          {singleComparison && (
            <div className="mt-3">
              {singleComparison.error ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {singleComparison.error}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                      <div className="text-xs font-bold text-gray-500 uppercase">
                        Original Machine ({originalMachine.type.toUpperCase()})
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        Input:{' '}
                        <span className="font-mono font-semibold text-gray-900">
                          {singleComparison.input || '(empty)'}
                        </span>
                      </div>
                      {originalMachine.type === 'moore' && (
                        <div className="mt-1 text-xs text-gray-500">
                          Full Output (with init):{' '}
                          <span className="font-mono">{singleComparison.origRawOutput}</span>
                        </div>
                      )}
                      <div className="mt-1 text-sm font-semibold text-gray-800">
                        Comparable Output:{' '}
                        <span className="font-mono text-indigo-700">
                          {singleComparison.origNormalized || '(empty)'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                      <div className="text-xs font-bold text-indigo-600 uppercase">
                        Converted Machine ({convertedMachine.type.toUpperCase()})
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        Input:{' '}
                        <span className="font-mono font-semibold text-gray-900">
                          {singleComparison.input || '(empty)'}
                        </span>
                      </div>
                      {convertedMachine.type === 'moore' && (
                        <div className="mt-1 text-xs text-gray-500">
                          Full Output (with init):{' '}
                          <span className="font-mono">{singleComparison.convRawOutput}</span>
                        </div>
                      )}
                      <div className="mt-1 text-sm font-semibold text-gray-800">
                        Comparable Output:{' '}
                        <span className="font-mono text-indigo-700">
                          {singleComparison.convNormalized || '(empty)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-lg border flex items-center gap-2 font-semibold text-sm ${
                      singleComparison.match
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}
                  >
                    {singleComparison.match ? (
                      <>
                        <CheckCircle size={16} className="text-green-600" />
                        ✓ OUTPUTS MATCH
                      </>
                    ) : (
                      <>
                        <XCircle size={16} className="text-red-600" />
                        ✗ OUTPUTS DO NOT MATCH
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Automated Test Suite Results */}
        {suiteResult && (
          <div className="border-t border-gray-200 pt-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-xs text-green-600 font-medium">Tests Passed</div>
                  <div className="text-xl font-bold text-green-700">{suiteResult.passed}</div>
                </div>
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-xs text-red-600 font-medium">Tests Failed</div>
                  <div className="text-xl font-bold text-red-700">{suiteResult.failed}</div>
                </div>
              </div>

              <div
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium text-sm ${
                  suiteResult.equivalent
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {suiteResult.equivalent ? (
                  <>
                    <CheckCircle size={16} className="text-green-600" />
                    ✓ Behavior consistent for all {suiteResult.totalTests} generated test cases.
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-red-600" />
                    ✗ Discrepancy detected on {suiteResult.failed} test case(s).
                  </>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500 italic">{suiteResult.note}</p>

            {/* Toggle table */}
            <div>
              <button
                onClick={() => setShowAllTests((s) => !s)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                {showAllTests ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showAllTests
                  ? 'Hide Test Case Details'
                  : `View All ${suiteResult.details.length} Test Cases`}
              </button>

              {showAllTests && (
                <div className="mt-2 overflow-x-auto border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr className="table-header">
                        <th className="px-3 py-2 text-left">#</th>
                        <th className="px-3 py-2 text-left">Input String</th>
                        <th className="px-3 py-2 text-left">Original Output</th>
                        <th className="px-3 py-2 text-left">Converted Output</th>
                        <th className="px-3 py-2 text-left">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {suiteResult.details.map((tc, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-3 py-1.5 text-gray-400 font-mono">{i + 1}</td>
                          <td className="px-3 py-1.5 font-mono font-medium text-gray-800">
                            {tc.input}
                          </td>
                          <td className="px-3 py-1.5 font-mono text-gray-700">
                            {tc.originalOutput || 'ε'}
                          </td>
                          <td className="px-3 py-1.5 font-mono text-indigo-700">
                            {tc.convertedOutput || 'ε'}
                          </td>
                          <td className="px-3 py-1.5">
                            {tc.match ? (
                              <span className="badge-green">Match</span>
                            ) : (
                              <span className="badge-red">Mismatch</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

