import React from 'react';
import type { ProblemSpaceBlueprint } from '../../../domain/blueprint/types';
import { ProcessVisualizer } from './ProcessVisualizer';

interface Props {
  data: ProblemSpaceBlueprint;
}

const SectionHeader: React.FC<{ title: string; count: number }> = ({ title, count }) => (
  <div className="bp-section-header">
    <span>{title}</span>
    <span className="bp-count-badge">{count}</span>
  </div>
);

const ItemList: React.FC<{ items: { name: string; detail?: string }[] }> = ({ items }) => {
  if (items.length === 0) return <div className="bp-empty">—</div>;
  return (
    <ul className="bp-item-list">
      {items.map((item, i) => (
        <li key={i} className="bp-item">
          <span className="bp-item-name">{item.name}</span>
          {item.detail && <span className="bp-item-detail">{item.detail}</span>}
        </li>
      ))}
    </ul>
  );
};

export const ProblemSpaceSection: React.FC<Props> = ({ data }) => {
  return (
    <div className="bp-space-section">
      <div className="bp-space-title">🔍 Problem Space</div>

      <SectionHeader title="👤 Actors" count={data.actors.length} />
      <ItemList items={data.actors.map(a => ({ name: a.name, detail: a.description }))} />

      <SectionHeader title="📦 Aggregates" count={data.objects.length} />
      <ItemList items={data.objects.map(o => ({ name: o.name }))} />

      <SectionHeader title="⚡ Commands" count={data.intents.length} />
      <ItemList items={data.intents.map(i => ({
        name: i.name,
        detail: `${i.actor || '?'} → ${i.targetObject || '?'}`
      }))} />

      <SectionHeader title="🎯 Events" count={data.facts.length} />
      <ItemList items={data.facts.map(f => ({
        name: f.name,
        detail: f.sourceObject ? `from ${f.sourceObject}` : undefined
      }))} />

      <SectionHeader title="📋 Policies" count={data.policies.length} />
      <ItemList items={data.policies.map(p => ({
        name: p.name,
        detail: `${p.trigger} → ${p.action}`
      }))} />

      <SectionHeader title="🔄 Processes" count={data.processes.length} />
      <SectionHeader title="🔄 Processes (Cinematic View)" count={data.processes.length} />
      {data.processes.length === 0 ? <div className="bp-empty">—</div> : (
        <div className="bp-process-list">
            {data.processes.map((p, i) => (
                <ProcessVisualizer key={i} data={p} hotspots={data.hotspots} />
            ))}
        </div>
      )}
    </div>
  );
};
