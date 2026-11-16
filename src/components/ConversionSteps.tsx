import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Layers } from 'lucide-react';
import type { ConversionStep } from '../types/machine';

interface ConversionStepsProps {
  steps: ConversionStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
}

export const ConversionSteps: React.FC<ConversionStepsProps> = ({
  steps,
  currentStepIndex,
  onStepChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      onStepChange(
        currentStepIndex < steps.length - 1 ? currentStepIndex + 1 : 0
      );
      if (currentStepIndex >= steps.length - 1) {
        setIsPlaying(false);
      }
    }, 1800);
    return () => clearInterval(timer);
  }, [isPlaying, currentStepIndex, steps.length, onStepChange]);

  if (steps.length === 0) return null;

  const step = steps[currentStepIndex] ?? steps[0];

  return (
    <div className="card overflow-hidden">
      <div className="card-header bg-indigo-50/60 border-b border-indigo-100">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-indigo-600" />
          <h3 className="text-sm font-semibold text-gray-800">
            Step-by-Step Conversion Process
          </h3>
        </div>
        <span className="badge-blue">
          Step {step.stepNumber} of {steps.length}
        </span>
      </div>

      {/* Step progress bar */}
      <div className="px-5 pt-4">
        <div className="flex items-center gap-1.5">
          {steps.map((s, idx) => (
            <button
              key={s.stepNumber}
              onClick={() => {
                setIsPlaying(false);
                onStepChange(idx);
              }}
              className={`flex-1 h-2 rounded-full transition-all ${
                idx === currentStepIndex
                  ? 'bg-indigo-600'
                  : idx < currentStepIndex
                  ? 'bg-indigo-300'
                  : 'bg-gray-200'
              }`}
              title={`Step ${s.stepNumber}: ${s.title}`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 overflow-x-auto gap-2 pb-1">
          {steps.map((s, idx) => (
            <button
              key={s.stepNumber}
              onClick={() => {
                setIsPlaying(false);
                onStepChange(idx);
              }}
              className={`text-xs px-2 py-1 rounded font-medium whitespace-nowrap transition-colors ${
                idx === currentStepIndex
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {s.stepNumber}. {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Active Step Content */}
      <div className="p-5">
        <div className="mb-3">
          <h4 className="text-base font-bold text-gray-900">
            Step {step.stepNumber}: {step.title}
          </h4>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
            {step.description}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3.5 space-y-1.5 max-h-60 overflow-y-auto">
          {step.details.map((detail, idx) => (
            <div
              key={idx}
              className="font-mono text-xs text-gray-800 flex items-start gap-2"
            >
              <span className="text-indigo-500 select-none">•</span>
              <span>{detail}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsPlaying(false);
              onStepChange(Math.max(0, currentStepIndex - 1));
            }}
            disabled={currentStepIndex === 0}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            <ChevronLeft size={14} /> Previous Step
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              onStepChange(Math.min(steps.length - 1, currentStepIndex + 1));
            }}
            disabled={currentStepIndex === steps.length - 1}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            Next Step <ChevronRight size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (currentStepIndex >= steps.length - 1) {
                onStepChange(0);
              }
              setIsPlaying((p) => !p);
            }}
            className="btn-primary text-xs py-1.5 px-3"
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            {isPlaying ? 'Pause' : 'Play Steps'}
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              onStepChange(0);
            }}
            className="btn-secondary text-xs py-1.5 px-2.5"
            title="Restart steps"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

