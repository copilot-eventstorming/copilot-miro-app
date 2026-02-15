/**
 * TypeScript types matching the Nucleus subdomain analysis backend.
 * Mirror of SubdomainMetadata.scala case classes.
 */

export interface SubdomainCandidate {
  name: string;
  classification: 'Core' | 'Supporting' | 'Generic';
  aggregates: string[];
  commands: string[];
  events: string[];
  affinityScore: number;
  classificationReason: string;
}

export interface AffinityEdge {
  fromAggregate: string;
  toAggregate: string;
  score: number;
  reasons: string[];
}

export interface SubdomainBlueprint {
  candidates: SubdomainCandidate[];
  unclassifiedAggregates: string[];
  affinityEdges: AffinityEdge[];
}
