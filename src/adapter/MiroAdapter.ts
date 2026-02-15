import { Subject, BehaviorSubject } from 'rxjs';
import { MiroWidgetPayload } from '../domain/blueprint/types';

/**
 * Scans the Miro board, normalizes widgets into MiroWidgetPayload format
 * that matches the backend's MiroWidget case class, and exposes results as RxJS streams.
 */
export class MiroScannerService {
  /** Emits raw widget arrays after each scan */
  public scanResults$ = new Subject<MiroWidgetPayload[]>();

  /** Tracks whether a scan is currently in progress */
  public scanning$ = new BehaviorSubject<boolean>(false);

  /** Last error encountered during scanning */
  public error$ = new BehaviorSubject<string | null>(null);

  async scan(): Promise<MiroWidgetPayload[]> {
    this.scanning$.next(true);
    this.error$.next(null);

    try {
      // @ts-ignore - Miro SDK global
      const items = await miro.board.get({ type: ['sticky_note', 'shape', 'frame', 'app_card'] });
      const rawWidgets = items.map(this.normalize);
      console.log(`[MiroScanner] Scanned ${rawWidgets.length} widgets`);
      this.scanResults$.next(rawWidgets);
      return rawWidgets;
    } catch (err: any) {
      const message = err?.message || 'Unknown scan error';
      console.error('[MiroScanner] Scan failed:', message);
      this.error$.next(message);
      return [];
    } finally {
      this.scanning$.next(false);
    }
  }

  private normalize(item: any): MiroWidgetPayload {
    // Map Miro SDK item to MiroWidget schema expected by Nucleus backend
    const typeMap: Record<string, string> = {
      sticky_note: 'STICKER',
      shape: 'SHAPE',
      frame: 'FRAME',
      app_card: 'APP_CARD',
    };

    return {
      id: item.id,
      type: typeMap[item.type] || item.type?.toUpperCase() || 'UNKNOWN',
      content: item.content || item.title || item.plainTitle || '',
      x: item.x ?? 0,
      y: item.y ?? 0,
      width: item.width ?? 0,
      height: item.height ?? 0,
      style: {
        backgroundColor: item.style?.fillColor || item.style?.color || '',
      },
      links: [], // Connector extraction requires separate SDK calls
    };
  }
}

export const miroScannerService = new MiroScannerService();
