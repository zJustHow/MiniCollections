export type PageRequest = { page?: number; size?: number };

export type AdminSubmissionsPageRequest = PageRequest & {
  status?: string;
};

export function getMySubmissionsPage(options?: PageRequest): Promise<unknown>;

export function submitFeedback(body: Record<string, unknown>): Promise<unknown>;

export function deleteMySubmission(id: string | number): Promise<unknown>;

export type AdminSubmissionCounts = {
  pending?: number;
  approved?: number;
  rejected?: number;
  total?: number;
};

export function getAdminSubmissionCounts(): Promise<AdminSubmissionCounts>;

export function getAdminSubmissionsPage(
  options?: AdminSubmissionsPageRequest,
): Promise<unknown>;

export function approveSubmission(
  id: string | number,
  body: Record<string, unknown>,
): Promise<unknown>;

export function rejectSubmission(
  id: string | number,
  reason: string | null,
): Promise<unknown>;
