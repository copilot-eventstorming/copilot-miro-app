import React from 'react';
import type { BusinessProcess, Hotspot, UserIntent } from '../../../domain/blueprint/types';

interface Props {
  data: BusinessProcess;
  hotspots?: Hotspot[];
}

export const ProcessVisualizer: React.FC<Props> = ({ data, hotspots }) => {
  const getHotspotsForStep = (stepName: string) => {
    return hotspots?.filter(h => h.relatedCommand === stepName) || [];
  };

  return (
    <div className="bp-process-viz">
      <div className="bp-process-title">{data.name}</div>
      <div className="bp-process-flow">
        {/* Trigger (if known) */}
        {data.trigger && data.trigger !== "Unknown" && (
            <div className="bp-process-step bp-step-trigger">
                <span className="bp-icon">⚡</span>
                <span className="bp-label">{data.trigger}</span>
                <div className="bp-arrow">→</div>
            </div>
        )}

        {/* Steps */}
        {data.steps.map((stepName, i) => {
          const stepHotspots = getHotspotsForStep(stepName);
          const hasHotspots = stepHotspots.length > 0;
          
          return (
            <React.Fragment key={i}>
              <div className={`bp-process-step ${hasHotspots ? 'bp-step-hot' : ''}`}>
                <span className="bp-icon">🟦</span>
                <span className="bp-label">{stepName}</span>
                
                {hasHotspots && (
                  <div className="bp-step-hotspots">
                    {stepHotspots.map((h, hi) => (
                      <span key={hi} title={h.name}>🔥</span>
                    ))}
                  </div>
                )}
              </div>
              {i < data.steps.length - 1 && <div className="bp-arrow">→</div>}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
