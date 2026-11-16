import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import type { ValidationResult } from '../types/machine';

interface ValidationPanelProps {
  result: ValidationResult | null;
  onValidate: () => void;
  loading?: boolean;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({ result, onValidate, loading }) => {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Machine Validation</h3>
        <button
          onClick={onValidate}
          disabled={loading}
          className="btn-primary text-xs py-1.5"
        >
          {loading ? 'Validating…' : 'Validate'}
        </button>
      </div>

      {!result && (
        <p className="text-xs text-gray-400">Click "Validate" to check the machine for errors.</p>
      )}

      {result && (
        <div className="space-y-2">
          {/* Overall status */}
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            result.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {result.valid ? (
              <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
            ) : (
              <XCircle size={16} className="text-red-600 flex-shrink-0" />
            )}
            <span className={`text-sm font-medium ${result.valid ? 'text-green-700' : 'text-red-700'}`}>
              {result.valid ? 'Machine is valid and ready for conversion.' : 'Machine has validation errors.'}
            </span>
          </div>

          {/* Issues list */}
          {result.issues.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {result.issues.map((issue, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 px-3 py-2 rounded text-xs ${
                    issue.severity === 'error'
                      ? 'bg-red-50 text-red-700'
                      : issue.severity === 'warning'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  {issue.severity === 'error' ? (
                    <XCircle size={12} className="flex-shrink-0 mt-0.5" />
                  ) : issue.severity === 'warning' ? (
                    <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                  ) : (
                    <Info size={12} className="flex-shrink-0 mt-0.5" />
                  )}
                  {issue.message}
                </div>
              ))}
            </div>
          )}

          {result.valid && result.issues.length === 0 && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle size={12} />
              No issues found. Ready to convert.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

