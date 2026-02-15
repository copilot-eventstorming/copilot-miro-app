import { BlueprintAnalysisResult, MiroWidgetPayload } from '../domain/blueprint/types';
import { SubdomainBlueprint } from '../domain/subdomain/types';

const NUCLEUS_BASE_URL = 'http://localhost:9000';

/**
 * API client for the Nucleus backend.
 * Sends scanned Miro widgets to the analysis engine and retrieves the Blueprint.
 */
export class NucleusAPI {

  /**
   * Send scanned Miro board widgets to the Nucleus engine for analysis.
   * Returns both ProblemSpace and SolutionSpace blueprints.
   */
  static async analyze(widgets: MiroWidgetPayload[]): Promise<BlueprintAnalysisResult> {
    const response = await fetch(`${NUCLEUS_BASE_URL}/api/blueprint/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(widgets),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Nucleus analysis failed (${response.status}): ${errorBody}`);
    }

    return await response.json();
  }

  /**
   * Retrieve an existing Blueprint by ID.
   */
  static async getBlueprint(id: string): Promise<BlueprintAnalysisResult> {
    const response = await fetch(`${NUCLEUS_BASE_URL}/api/blueprint/${id}`);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Blueprint retrieval failed (${response.status}): ${errorBody}`);
    }

    return await response.json();
  }

  /**
   * Discover subdomain groupings from Miro board widgets.
   * The threshold controls clustering sensitivity (0.0-1.0, lower = more grouping).
   */
  static async discoverSubdomains(widgets: MiroWidgetPayload[], threshold: number = 0.3): Promise<SubdomainBlueprint> {
    const response = await fetch(
      `${NUCLEUS_BASE_URL}/api/blueprint/subdomains?threshold=${threshold}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(widgets),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Subdomain discovery failed (${response.status}): ${errorBody}`);
    }

    return await response.json();
  }

  /**
   * Health check for the Nucleus backend.
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${NUCLEUS_BASE_URL}/api/blueprint/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Legacy stub — kept for backward compatibility.
 */
async function checkBoardManagedOnServer(id: string): Promise<boolean> {
  return NucleusAPI.healthCheck();
}

export { checkBoardManagedOnServer };
