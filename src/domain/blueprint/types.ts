/**
 * TypeScript types matching the Nucleus backend domain model.
 * These mirror the Scala case classes from:
 *   - ProblemSpaceBlueprint (Metadata.scala)
 *   - SolutionSpaceBlueprint (SolutionMetadata.scala)
 */
import { SubdomainBlueprint } from '../subdomain/types';

// --- Backend Wire Format (MiroWidget) ---
export interface MiroWidgetPayload {
  id: string;
  type: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style: Record<string, string>;
  links: string[];
}

// --- Problem Space ---
export interface Actor {
  name: string;
  description: string;
}

export interface BusinessObject {
  name: string;
}

export interface UserIntent {
  name: string;
  actor: string;
  targetObject: string;
}

export interface BusinessFact {
  name: string;
  sourceObject: string;
}

export interface BusinessPolicy {
  name: string;
  trigger: string;
  action: string;
}

export interface BusinessProcess {
  name: string;
  steps: string[];
}

export interface BusinessRule {
  name: string;
}

export interface ProblemSpaceBlueprint {
  actors: Actor[];
  objects: BusinessObject[];
  intents: UserIntent[];
  facts: BusinessFact[];
  policies: BusinessPolicy[];
  processes: BusinessProcess[];
  rules: BusinessRule[];
}

// --- Solution Space ---
export interface NamedDescribed {
  name: string;
  description: string;
}

export interface FactoryMetadata {
  name: string;
  aggregateName: string;
  createCommand: string;
}

export interface SpecificationMetadata {
  name: string;
  description: string;
  subject: string;
}

export interface NotificationHandlerMetadata {
  name: string;
  triggerEvent: string;
  targetSystem: string;
}

export interface UnresolvedCommandMetadata {
  commandName: string;
  reason: string;
}

export interface BoundedContextMetadata {
  name: string;
  aggregates: string[];
  services: string[];
}

export interface SolutionSpaceBlueprint {
  applicationServices: NamedDescribed[];
  domainServices: NamedDescribed[];
  sagas: NamedDescribed[];
  projections: NamedDescribed[];
  invariants: NamedDescribed[];
  gateways: NamedDescribed[];
  factories: FactoryMetadata[];
  specifications: SpecificationMetadata[];
  readSideServices: NamedDescribed[];
  notificationHandlers: NotificationHandlerMetadata[];
  unresolvedCommands: UnresolvedCommandMetadata[];
  boundedContexts: BoundedContextMetadata[];
}

// --- Combined Response ---
export interface BlueprintAnalysisResult {
  id?: string;
  problemSpace: ProblemSpaceBlueprint;
  solutionSpace: SolutionSpaceBlueprint;
  subdomains?: SubdomainBlueprint;
}
