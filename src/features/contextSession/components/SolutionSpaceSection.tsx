import React from 'react';
import type { SolutionSpaceBlueprint } from '../../../domain/blueprint/types';

interface Props {
  data: SolutionSpaceBlueprint;
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

export const SolutionSpaceSection: React.FC<Props> = ({ data }) => {
  return (
    <div className="bp-space-section">
      <div className="bp-space-title">🏗️ Solution Space</div>

      {/* Services */}
      <SectionHeader title="🔧 Application Services" count={data.applicationServices.length} />
      <ItemList items={data.applicationServices.map(s => ({ name: s.name, detail: s.description }))} />

      <SectionHeader title="⚙️ Domain Services" count={data.domainServices.length} />
      <ItemList items={data.domainServices.map(s => ({ name: s.name, detail: s.description }))} />

      {/* Factories & Gateways */}
      <SectionHeader title="🏭 Factories" count={data.factories.length} />
      <ItemList items={data.factories.map(f => ({
        name: f.name,
        detail: `${f.createCommand} → ${f.aggregateName}`
      }))} />

      <SectionHeader title="🌐 Gateways (ACL)" count={data.gateways.length} />
      <ItemList items={data.gateways.map(g => ({ name: g.name, detail: g.description }))} />

      {/* Rules */}
      <SectionHeader title="🛡️ Invariants" count={data.invariants.length} />
      <ItemList items={data.invariants.map(i => ({ name: i.name, detail: i.description }))} />

      <SectionHeader title="✅ Specifications" count={data.specifications.length} />
      <ItemList items={data.specifications.map(s => ({
        name: s.name,
        detail: `validates ${s.subject}`
      }))} />

      {/* Flow */}
      <SectionHeader title="🔗 Sagas" count={data.sagas.length} />
      <ItemList items={data.sagas.map(s => ({ name: s.name }))} />

      <SectionHeader title="📊 Projections" count={data.projections.length} />
      <ItemList items={data.projections.map(p => ({ name: p.name }))} />

      <SectionHeader title="📖 Read-Side Services" count={data.readSideServices.length} />
      <ItemList items={data.readSideServices.map(r => ({ name: r.name, detail: r.description }))} />

      <SectionHeader title="📨 Notification Handlers" count={data.notificationHandlers.length} />
      <ItemList items={data.notificationHandlers.map(n => ({
        name: n.name,
        detail: `${n.triggerEvent} → ${n.targetSystem}`
      }))} />

      {/* Bounded Contexts */}
      <SectionHeader title="🔲 Bounded Contexts" count={data.boundedContexts.length} />
      <ItemList items={data.boundedContexts.map(bc => ({
        name: bc.name,
        detail: `${bc.aggregates.length} agg, ${bc.services.length} svc`
      }))} />
    </div>
  );
};
