import React from 'react';
import { SubdomainCandidate } from '../../../domain/subdomain/types';

interface Props {
  data: SubdomainCandidate;
}

const ClassificationBadge: React.FC<{ type: string }> = ({ type }) => {
  let colorClass = 'bg-gray-100 text-gray-800';
  if (type === 'Core') colorClass = 'bg-red-100 text-red-800 border-red-200 border';
  if (type === 'Supporting') colorClass = 'bg-blue-100 text-blue-800 border-blue-200 border';
  if (type === 'Generic') colorClass = 'bg-purple-100 text-purple-800 border-purple-200 border';

  return (
    <span className={`px-2 py-0.5 rounded-full text-xxs font-bold uppercase tracking-wider ${colorClass}`}>
      {type}
    </span>
  );
};

export const SubdomainCard: React.FC<Props> = ({ data }) => {
  return (
    <div className="sd-card">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col">
          <span className="font-bold text-gray-800 text-sm font-lato">{data.name}</span>
          <span className="text-xxs text-gray-400 font-lato">Score: {data.affinityScore}</span>
        </div>
        <ClassificationBadge type={data.classification} />
      </div>

      {/* Reason */}
      <div className="text-xxs text-gray-500 italic mb-2 border-l-2 border-gray-200 pl-1">
        {data.classificationReason}
      </div>

      {/* Aggregates */}
      <div className="mb-1">
        <div className="text-xxs font-bold text-gray-700 uppercase mb-0.5">Aggregates</div>
        <div className="flex flex-wrap gap-1">
          {data.aggregates.map((agg, i) => (
            <span key={i} className="bg-orange-50 text-orange-800 text-xxs px-1.5 py-0.5 rounded border border-orange-100">
              {agg}
            </span>
          ))}
        </div>
      </div>

      {/* Counts */}
      <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
        <div className="text-xxs text-gray-500">
          <span className="font-bold text-gray-700">{data.commands.length}</span> Cmds
        </div>
        <div className="text-xxs text-gray-500">
          <span className="font-bold text-gray-700">{data.events.length}</span> Evts
        </div>
      </div>
    </div>
  );
};
