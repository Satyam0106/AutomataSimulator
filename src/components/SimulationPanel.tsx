import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  AlertCircle,
  Terminal,
} from 'lucide-react';
import type { Machine, SimulationResult } from '../types/machine';
import { simulateMachine } from '../simulation/simulateMachine';
import { ExecutionTable } from './ExecutionTable';

interface SimulationPanelProps {
  originalMachine: Machine;
  convertedMachine: Machine | null;
  onHighlightOriginalState?: (states: string[]) => void;
  onHighlightConvertedState?: (states: string[]) => void;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({
  originalMachine,
  convertedMachine,
  onHighlightOriginalState,
  onHighlightConvertedState,
}) => {
  const [inputString, setInputString] = useState(
    originalMachine.alphabet.length >= 2
      ? `${originalMachine.alphabet[0]}${originalMachine.alphabet[1]}${originalMachine.alphabet[0]}${originalMachine.alphabet[0]}${originalMachine.alphabet[1]}${originalMachine.alphabet[1]}`
      : originalMachine.alphabet[0]?.repeat(4) ?? ''
  );

  const [origResult, setOrigResult] = useState<SimulationResult | null>(null);
  const [convResult, setConvResult] = useState<SimulationResult | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Reset default input string if alphabet changes and current string has invalid chars
  useEffect(() => {
    const valid = [...inputString].every((ch) =>
      originalMachine.alphabet.includes(ch)
    );
    if (!valid && originalMachine.alphabet.length > 0) {
      const a0 = originalMachine.alphabet[0];
      const a1 = originalMachine.alphabet[1] ?? a0;
      setInputString(`${a0}${a1}${a0}${a0}${a1}${a1}`);
    }
  }, [originalMachine.alphabet, inputString]);

  const handleRunSimulation = () => {
    setIsPlaying(false);
    const res1 = simulateMachine(originalMachine, inputString.trim());
    setOrigResult(res1);

    if (convertedMachine) {
      const res2 = simulateMachine(convertedMachine, inputString.trim());
      setConvResult(res2);
    } else {
      setConvResult(null);
    }

    if (res1.executionSteps.length > 0) {
      setActiveStep(0);
    } else {
      setActiveStep(null);
    }
  };

  // Update highlighted state on graphs when activeStep changes
  useEffect(() => {
    if (activeStep === null || !origResult) {
      onHighlightOriginalState?.([]);
      onHighlightConvertedState?.([]);
      return;
    }
    const step1 = origResult.executionSteps[activeStep];
    if (step1) {
      onHighlightOriginalState?.([step1.currentState, step1.nextState]);
    }
    if (convResult) {
      const step2 = convResult.executionSteps[activeStep];
      if (step2) {
        onHighlightConvertedState?.([step2.currentState, step2.nextState]);
      }
    }
  }, [activeStep, origResult, convResult, onHighlightOriginalState, onHighlightConvertedState]);

  // Animation timer
  useEffect(() => {
    if (!isPlaying || !origResult || origResult.executionSteps.length === 0) {
      return;
    }
    const timer = setInterval(() => {
      setActiveStep((prev) => {
        const next = prev === null ? 0 : prev + 1;
        if (next >= origResult.executionSteps.length) {
          setIsPlaying(false);
          return origResult.executionSteps.length - 1;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, origResult]);

  const currentStepObj =
    activeStep !== null && origResult
      ? origResult.executionSteps[activeStep]
      : null;

  return (
    <div className="card overflow-hidden">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-indigo-600" />
          <h3 className="text-sm font-semibold text-gray-800">
            Test Machine — Input String Simulator
          </h3>
        </div>
        <span className="text-xs text-gray-500 font-mono">
          Σ = &#123; {originalMachine.alphabet.join(', ')} &#125;
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Input bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label
              htmlFor="sim-input-string"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Enter input string (symbols from alphabet &#123;
              {originalMachine.alphabet.join(', ')}&#125;)
            </label>
            <div className="flex gap-2">
              <input
                id="sim-input-string"
                type="text"
                className="input-field font-mono"
                placeholder={`e.g. ${originalMachine.alphabet.join('')}`}
                value={inputString}
                onChange={(e) => setInputString(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunSimulation()}
              />
              <button
                onClick={handleRunSimulation}
                className="btn-primary whitespace-nowrap"
              >
                <Play size={15} /> Run Simulation
              </button>
            </div>
          </div>

          {/* Quick symbol buttons */}
          <div>
            <span className="block text-xs font-medium text-gray-600 mb-1">
              Quick Append
            </span>
            <div className="flex items-center gap-1.5">
              {originalMachine.alphabet.map((sym) => (
                <button
                  key={sym}
                  onClick={() => setInputString((s) => s + sym)}
                  className="btn-secondary font-mono text-xs py-2 px-3"
                >
                  +{sym}
                </button>
              ))}
              <button
                onClick={() => setInputString('')}
                className="btn-secondary text-xs py-2 px-2.5 text-gray-500"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Error display */}
        {origResult && !origResult.success && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{origResult.error}</span>
          </div>
        )}

        {/* Animated Playback Controls */}
        {origResult && origResult.success && origResult.executionSteps.length > 0 && (
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (
                    activeStep === null ||
                    activeStep >= origResult.executionSteps.length - 1
                  ) {
                    setActiveStep(0);
                  }
                  setIsPlaying((p) => !p);
                }}
                className="btn-primary text-xs py-1.5 px-3"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setActiveStep((prev) =>
                    prev !== null && prev > 0 ? prev - 1 : 0
                  );
                }}
                disabled={activeStep === 0 || activeStep === null}
                className="btn-secondary text-xs py-1.5 px-2.5"
                title="Previous step"
              >
                <SkipBack size={14} />
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setActiveStep((prev) =>
                    prev !== null && prev < origResult.executionSteps.length - 1
                      ? prev + 1
                      : origResult.executionSteps.length - 1
                  );
                }}
                disabled={
                  activeStep === null ||
                  activeStep >= origResult.executionSteps.length - 1
                }
                className="btn-secondary text-xs py-1.5 px-2.5"
                title="Next step"
              >
                <SkipForward size={14} />
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setActiveStep(0);
                }}
                className="btn-secondary text-xs py-1.5 px-2.5"
                title="Restart"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {currentStepObj && (
              <div className="flex items-center gap-3 text-xs font-mono bg-white px-3 py-1.5 rounded-lg border border-indigo-100">
                <span className="text-gray-500">
                  Step {currentStepObj.stepIndex}/{origResult.executionSteps.length}:
                </span>
                <span className="font-bold text-gray-800">
                  {currentStepObj.currentState}
                </span>
                <span className="text-indigo-600">
                  —({currentStepObj.input})→
                </span>
                <span className="font-bold text-indigo-700">
                  {currentStepObj.nextState}
                </span>
                <span className="badge-green">
                  out: {currentStepObj.output}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Execution tables side-by-side if converted machine exists */}
        {origResult && origResult.success && (
          <div
            className={`grid grid-cols-1 ${
              convResult && convResult.success ? 'lg:grid-cols-2' : ''
            } gap-6`}
          >
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Original Machine ({originalMachine.type.toUpperCase()}) Execution
              </h4>
              <ExecutionTable
                result={origResult}
                activeStepIndex={activeStep}
                machineType={originalMachine.type}
                onSelectStep={(idx) => {
                  setIsPlaying(false);
                  setActiveStep(idx);
                }}
              />
            </div>

            {convResult && convResult.success && convertedMachine && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
                  Converted Machine ({convertedMachine.type.toUpperCase()}) Execution
                </h4>
                <ExecutionTable
                  result={convResult}
                  activeStepIndex={activeStep}
                  machineType={convertedMachine.type}
                  onSelectStep={(idx) => {
                    setIsPlaying(false);
                    setActiveStep(idx);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

