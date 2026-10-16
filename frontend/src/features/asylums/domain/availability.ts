import type { AsylumSummary } from "../types/asylum.types";

/**
 * Public discovery/detail responses omit status and only return ACTIVO centers
 * (SqlAlchemyAsylumReader._projection). Saved/admin records may explicitly carry
 * ACTIVE/INACTIVE. This represents catalog availability, not visiting hours:
 * the API has no opening-hours contract.
 */
export function isAsylumAvailable(asylum: Pick<AsylumSummary, "status">): boolean {
  return asylum.status === undefined || asylum.status === "ACTIVE";
}
