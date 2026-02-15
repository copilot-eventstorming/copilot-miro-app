import { useState, useEffect, useCallback } from 'react';
import { blueprintStore } from '../../../store/BlueprintStore';
import type { BlueprintAnalysisResult } from '../../../domain/blueprint/types';

interface BlueprintStats {
  actors: number;
  aggregates: number;
  commands: number;
  events: number;
  policies: number;
  processes: number;
  appServices: number;
  domainServices: number;
  sagas: number;
  projections: number;
  factories: number;
  gateways: number;
  invariants: number;
  specifications: number;
  notifications: number;
  boundedContexts: number;
  unresolvedCommands: number;
}

export function useBlueprint() {
  const [analysis, setAnalysis] = useState<BlueprintAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BlueprintStats | null>(null);

  useEffect(() => {
    const subs = [
      blueprintStore.analysis$.subscribe(setAnalysis),
      blueprintStore.loading$.subscribe(setLoading),
      blueprintStore.error$.subscribe(setError),
      blueprintStore.stats$.subscribe(setStats),
    ];
    return () => subs.forEach(s => s.unsubscribe());
  }, []);

  const scanAndAnalyze = useCallback(async () => {
    await blueprintStore.scanAndAnalyze();
  }, []);

  const clear = useCallback(() => {
    blueprintStore.clear();
  }, []);

  return { analysis, loading, error, stats, scanAndAnalyze, clear };
}
