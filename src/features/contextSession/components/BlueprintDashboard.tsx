import React, { useState } from 'react';
import { useBlueprint } from '../hooks/useBlueprint';
import { ProblemSpaceSection } from './ProblemSpaceSection';
import { SolutionSpaceSection } from './SolutionSpaceSection';

export const BlueprintDashboard: React.FC = () => {
  const { analysis, loading, error, stats, id, scanAndAnalyze, clear, loadBlueprint } = useBlueprint();
  const [expandProblem, setExpandProblem] = useState(true);
  const [expandSolution, setExpandSolution] = useState(true);

  return (
    <div className="bp-dashboard">
      {/* Action Bar */}
      <div className="btn-container-panel">
        <button
          className="btn btn-primary btn-primary-panel"
          onClick={scanAndAnalyze}
          disabled={loading}
        >
          {loading ? '⏳ Analyzing...' : '🔍 Scan & Analyze'}
        </button>
        {analysis && (
          <button className="btn btn-secondary btn-secondary-panel" onClick={clear}>
            Clear
          </button>
        )}
      </div>
      
      {/* Load / ID Section */}
      <div className="bp-persistence-bar">
        {id && (
          <div className="bp-id-display">
            <strong>Blueprint ID:</strong> <code>{id}</code>
          </div>
        )}
        <div className="bp-load-action">
          <input 
            type="text" 
            placeholder="Blueprint ID" 
            id="blueprint-id-input"
            className="bp-input"
          />
          <button 
            className="btn btn-secondary"
            onClick={() => {
              const input = document.getElementById('blueprint-id-input') as HTMLInputElement;
              if (input && input.value) {
                loadBlueprint(input.value);
              }
            }}
            disabled={loading}
          >
            Load
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bp-error">
          ⚠️ {error}
        </div>
      )}

      {/* Stats Bar */}
      {stats && (
        <div className="bp-stats-bar">
          <div className="bp-stat">
            <span className="bp-stat-value">{stats.aggregates}</span>
            <span className="bp-stat-label">Aggregates</span>
          </div>
          <div className="bp-stat">
            <span className="bp-stat-value">{stats.commands}</span>
            <span className="bp-stat-label">Commands</span>
          </div>
          <div className="bp-stat">
            <span className="bp-stat-value">{stats.events}</span>
            <span className="bp-stat-label">Events</span>
          </div>
          <div className="bp-stat">
            <span className="bp-stat-value">{stats.appServices + stats.domainServices}</span>
            <span className="bp-stat-label">Services</span>
          </div>
          <div className="bp-stat">
            <span className="bp-stat-value">{stats.boundedContexts}</span>
            <span className="bp-stat-label">BCs</span>
          </div>
        </div>
      )}

      {/* Hotspots Warning (High Priority) */}
      {analysis && analysis.problemSpace?.hotspots && analysis.problemSpace.hotspots.length > 0 && (
        <div className="bp-warning bp-hotspot-warning">
          <div className="bp-warning-title" style={{ color: '#e6402a' }}>
            🔥 {analysis.problemSpace.hotspots.length} Hotspot(s) Detected
          </div>
          <ul className="bp-warning-list">
            {analysis.problemSpace.hotspots.map((h, i) => (
              <li key={i}>
                <strong>{h.name}</strong> 
                {h.relatedAggregate && <span className="bp-tag">Agg: {h.relatedAggregate}</span>}
                {h.relatedCommand && <span className="bp-tag">Cmd: {h.relatedCommand}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Unresolved Commands Warning */}
      {analysis && analysis.solutionSpace.unresolvedCommands.length > 0 && (
        <div className="bp-warning">
          <div className="bp-warning-title">
            ⚠️ {analysis.solutionSpace.unresolvedCommands.length} Unresolved Command(s)
          </div>
          <ul className="bp-warning-list">
            {analysis.solutionSpace.unresolvedCommands.map((u, i) => (
              <li key={i}>
                <strong>{u.commandName}</strong> — {u.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Problem Space */}
      {analysis && (
        <>
          <div className="bp-collapse-header" onClick={() => setExpandProblem(!expandProblem)}>
            <span>{expandProblem ? '▼' : '▶'} Problem Space</span>
          </div>
          {expandProblem && <ProblemSpaceSection data={analysis.problemSpace} />}

          <div className="divider" />

          <div className="bp-collapse-header" onClick={() => setExpandSolution(!expandSolution)}>
            <span>{expandSolution ? '▼' : '▶'} Solution Space</span>
          </div>
          {expandSolution && <SolutionSpaceSection data={analysis.solutionSpace} />}
        </>
      )}

      {/* Empty State */}
      {!analysis && !loading && !error && (
        <div className="bp-empty-state">
          <div className="bp-empty-icon">🧩</div>
          <div className="bp-empty-text">
            Click <strong>Scan & Analyze</strong> to analyze the Miro board
          </div>
          <div className="bp-empty-hint">
            Ensure the Nucleus backend is running on localhost:9000
          </div>
        </div>
      )}
    </div>
  );
};
