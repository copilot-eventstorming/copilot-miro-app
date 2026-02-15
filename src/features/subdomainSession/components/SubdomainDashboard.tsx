import React, { useState } from 'react';
import { useSubdomain } from '../hooks/useSubdomain';
import { SubdomainCard } from './SubdomainCard';

export const SubdomainDashboard: React.FC = () => {
  const { blueprint, loading, error, threshold, setThreshold, discoverSubdomains, clear } = useSubdomain();
  
  // Local state for slider to avoid excessive re-renders/api-calls while dragging
  const [localThreshold, setLocalThreshold] = useState(threshold);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalThreshold(parseFloat(e.target.value));
  };

  const handleSliderCommit = () => {
    setThreshold(localThreshold);
    // If we already have results, we might want to re-run automatically or let user click button.
    // Let's let user click button to be explicit for now.
  };

  return (
    <div className="bp-dashboard">
      {/* Controls */}
      <div className="bg-gray-50 p-2 rounded mb-2 border border-gray-100">
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs font-bold text-gray-700 font-lato">Cohesion Threshold</label>
          <span className="text-xs font-mono text-orange-600 font-bold">{localThreshold}</span>
        </div>
        <input 
          type="range" 
          min="0.0" 
          max="1.0" 
          step="0.05" 
          value={localThreshold}
          onChange={handleSliderChange}
          onMouseUp={handleSliderCommit}
          onTouchEnd={handleSliderCommit}
          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
        <div className="flex justify-between text-xxs text-gray-400 mt-1 font-lato px-0.5">
          <span>Loose</span>
          <span>Strict</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="btn-container-panel">
        <button 
          className="btn btn-primary btn-primary-panel w-full"
          onClick={discoverSubdomains}
          disabled={loading}
        >
          {loading ? '⏳ Analyzing...' : '🔍 Discover Subdomains'}
        </button>
        {blueprint && (
            <button className="btn btn-secondary btn-secondary-panel" onClick={clear}>
              Clear
            </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bp-error">
          ⚠️ {error}
        </div>
      )}

      {/* Results */}
      {blueprint && (
        <div className="flex flex-col gap-2 mt-1">
          {/* Stats */}
          <div className="text-xs text-center text-gray-500 font-lato mb-1">
            Found <span className="font-bold text-orange-600">{blueprint.candidates.length}</span> subdomains 
            from <span className="font-bold text-gray-700">{blueprint.candidates.reduce((acc, c) => acc + c.aggregates.length, 0)}</span> aggregates
          </div>

          {/* Cards */}
          {blueprint.candidates.map((c, i) => (
            <SubdomainCard key={i} data={c} />
          ))}

          {/* Unclassified */}
          {blueprint.unclassifiedAggregates.length > 0 && (
            <div className="sd-unclassified">
              <div className="text-xs font-bold text-gray-500 mb-1">Unclassified Aggregates</div>
              <div className="flex flex-wrap gap-1">
                {blueprint.unclassifiedAggregates.map((agg, i) => (
                  <span key={i} className="bg-gray-100 text-gray-500 text-xxs px-1.5 py-0.5 rounded border border-gray-200">
                    {agg}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
