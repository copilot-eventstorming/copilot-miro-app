import { useState, useEffect, useCallback } from 'react';
import { BehaviorSubject } from 'rxjs';
import { NucleusAPI } from '../../../api/Backend';
import { miroScannerService } from '../../../adapter/MiroAdapter';
import type { SubdomainBlueprint } from '../../../domain/subdomain/types';

const blueprint$ = new BehaviorSubject<SubdomainBlueprint | null>(null);
const loading$ = new BehaviorSubject<boolean>(false);
const error$ = new BehaviorSubject<string | null>(null);
const threshold$ = new BehaviorSubject<number>(0.3);

export function useSubdomain() {
  const [blueprint, setBlueprint] = useState<SubdomainBlueprint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threshold, setThresholdState] = useState(0.3);

  useEffect(() => {
    const subs = [
      blueprint$.subscribe(setBlueprint),
      loading$.subscribe(setLoading),
      error$.subscribe(setError),
      threshold$.subscribe(setThresholdState),
    ];
    return () => subs.forEach(s => s.unsubscribe());
  }, []);

  const setThreshold = useCallback((value: number) => {
    threshold$.next(value);
  }, []);

  const discoverSubdomains = useCallback(async () => {
    loading$.next(true);
    error$.next(null);
    blueprint$.next(null);

    try {
      const widgets = await miroScannerService.scan();
      const result = await NucleusAPI.discoverSubdomains(widgets, threshold$.value);
      blueprint$.next(result);
    } catch (err: any) {
      error$.next(err.message || 'Subdomain discovery failed');
    } finally {
      loading$.next(false);
    }
  }, []);

  const clear = useCallback(() => {
    blueprint$.next(null);
    error$.next(null);
  }, []);

  return { blueprint, loading, error, threshold, setThreshold, discoverSubdomains, clear };
}
