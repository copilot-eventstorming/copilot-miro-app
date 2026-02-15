import { BehaviorSubject, map, distinctUntilChanged } from 'rxjs';
import { BlueprintAnalysisResult, ProblemSpaceBlueprint, SolutionSpaceBlueprint } from '../domain/blueprint/types';
import { NucleusAPI } from '../api/Backend';
import { miroScannerService } from '../adapter/MiroAdapter';

/**
 * Reactive state store for the Blueprint analysis results.
 * Manages the scan → analyze → display pipeline.
 *
 * Exposes multiple derived streams for specific UI sections:
 * - problemSpace$ / solutionSpace$ for the two main panels
 * - aggregates$, commands$, etc. for filtered views
 * - unresolvedCommands$ for warning panels
 */
export class BlueprintStore {
  // --- Core State ---
  private _analysis$ = new BehaviorSubject<BlueprintAnalysisResult | null>(null);
  private _loading$ = new BehaviorSubject<boolean>(false);
  private _error$ = new BehaviorSubject<string | null>(null);

  // --- Public Observable Streams ---
  /** Full analysis result */
  public analysis$ = this._analysis$.asObservable();

  /** Loading state */
  public loading$ = this._loading$.asObservable();

  /** Error state */
  public error$ = this._error$.asObservable();

  /** Current Blueprint ID */
  public id$ = this._analysis$.pipe(
    map(a => a?.id ?? null),
    distinctUntilChanged()
  );

  /** Problem Space blueprint */
  public problemSpace$ = this._analysis$.pipe(
    map(a => a?.problemSpace ?? null),
    distinctUntilChanged()
  );

  /** Solution Space blueprint */
  public solutionSpace$ = this._analysis$.pipe(
    map(a => a?.solutionSpace ?? null),
    distinctUntilChanged()
  );

  // --- Derived Streams (for specific UI components) ---

  /** All aggregates / business objects */
  public aggregates$ = this._analysis$.pipe(
    map(a => a?.problemSpace?.objects ?? [])
  );

  /** All commands / user intents */
  public commands$ = this._analysis$.pipe(
    map(a => a?.problemSpace?.intents ?? [])
  );

  /** Domain events / facts */
  public facts$ = this._analysis$.pipe(
    map(a => a?.problemSpace?.facts ?? [])
  );

  /** Bounded Contexts */
  public boundedContexts$ = this._analysis$.pipe(
    map(a => a?.solutionSpace?.boundedContexts ?? [])
  );

  /** Unresolved commands (warnings panel) */
  public unresolvedCommands$ = this._analysis$.pipe(
    map(a => a?.solutionSpace?.unresolvedCommands ?? [])
  );

  /** Summary statistics for dashboard */
  public stats$ = this._analysis$.pipe(
    map(a => {
      if (!a) return null;
      const ps = a.problemSpace;
      const ss = a.solutionSpace;
      return {
        actors: ps.actors.length,
        aggregates: ps.objects.length,
        commands: ps.intents.length,
        events: ps.facts.length,
        policies: ps.policies.length,
        processes: ps.processes.length,
        appServices: ss.applicationServices.length,
        domainServices: ss.domainServices.length,
        sagas: ss.sagas.length,
        projections: ss.projections.length,
        factories: ss.factories.length,
        gateways: ss.gateways.length,
        invariants: ss.invariants.length,
        specifications: ss.specifications.length,
        notifications: ss.notificationHandlers.length,
        boundedContexts: ss.boundedContexts.length,
        unresolvedCommands: ss.unresolvedCommands.length,
      };
    })
  );

  // --- Actions ---

  /**
   * Full pipeline: Scan Miro board → Send to Nucleus backend → Update store.
   */
  async scanAndAnalyze(): Promise<void> {
    this._loading$.next(true);
    this._error$.next(null);

    try {
      // Step 1: Scan the Miro board
      const widgets = await miroScannerService.scan();
      if (widgets.length === 0) {
        this._error$.next('No widgets found on the board');
        return;
      }

      // Step 2: Send to Nucleus for analysis
      const result = await NucleusAPI.analyze(widgets);
      this._analysis$.next(result);

      console.log(`[BlueprintStore] Analysis complete:`,
        `${result.problemSpace.objects.length} aggregates,`,
        `${result.problemSpace.intents.length} commands,`,
        `${result.solutionSpace.unresolvedCommands.length} unresolved`
      );
    } catch (err: any) {
      const message = err?.message || 'Analysis failed';
      console.error('[BlueprintStore] Error:', message);
      this._error$.next(message);
    } finally {
      this._loading$.next(false);
    }
  }

  /**
   * Load an existing Blueprint by ID from the backend.
   */
  async loadBlueprint(id: string): Promise<void> {
    this._loading$.next(true);
    this._error$.next(null);

    try {
      const result = await NucleusAPI.getBlueprint(id);
      this._analysis$.next(result);
    } catch (err: any) {
      const message = err?.message || 'Blueprint retrieval failed';
      console.error('[BlueprintStore] Error:', message);
      this._error$.next(message);
    } finally {
      this._loading$.next(false);
    }
  }

  /**
   * Manually load a pre-computed analysis result (e.g., from cache).
   */
  loadResult(result: BlueprintAnalysisResult): void {
    this._analysis$.next(result);
  }

  /**
   * Clear the current analysis state.
   */
  clear(): void {
    this._analysis$.next(null);
    this._error$.next(null);
  }
}

export const blueprintStore = new BlueprintStore();
