import React from 'react';
import type { SubdomainBlueprint } from '../../../domain/subdomain/types';

interface Props {
  data: SubdomainBlueprint;
}

export const ContextMapSection: React.FC<Props> = ({ data }) => {
  return (
    <div className="bp-space-section">
      <div className="bp-space-title">🌍 Context Map (Strategic Design)</div>
      
      {data.candidates.length === 0 ? (
        <div className="bp-empty">No subdomains discovered yet.</div>
      ) : (
        <div className="bp-subdomain-list">
           {data.candidates.map((sd, i) => (
             <div key={i} className="bp-subdomain-card">
               <div className="bp-sd-header">
                 <span className="bp-sd-name">{sd.name}</span>
                 <span className={`bp-sd-type bp-sd-${sd.classification.toLowerCase()}`}>
                    {sd.classification}
                 </span>
               </div>
               
               <div className="bp-sd-content">
                 <div className="bp-sd-aggregates">
                    <strong>Aggregates:</strong> {sd.aggregates.join(", ")}
                 </div>
                 {sd.classificationReason && (
                    <div className="bp-sd-reason">ℹ️ {sd.classificationReason}</div>
                 )}
               </div>
             </div>
           ))}
        </div>
      )}
      
      {data.affinityEdges.length > 0 && (
          <div className="bp-connections">
            <div className="bp-section-header">🔗 Relationships</div>
            <ul className="bp-connection-list">
                {data.affinityEdges.map((edge, i) => (
                    <li key={i} className="bp-connection-item">
                        {edge.fromAggregate} ↔ {edge.toAggregate} 
                        <span className="bp-score"> (Score: {edge.score})</span>
                    </li>
                ))}
            </ul>
          </div>
      )}
    </div>
  );
};
