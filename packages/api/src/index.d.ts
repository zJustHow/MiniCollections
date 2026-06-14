export type PageRequest = { page?: number; size?: number };

export type AdminSubmissionsPageRequest = PageRequest & {
  status?: string;
};

export function getAdminSubmissionsPage(
  options?: AdminSubmissionsPageRequest,
): Promise<unknown>;

export function getMySubmissionsPage(options?: PageRequest): Promise<unknown>;

export function getCategories(): Promise<unknown>;

export function getScales(): Promise<unknown>;

export function getSeriesByBrandId(brandId: string | number): Promise<unknown>;

export function approveSubmission(id: string | number, body: Record<string, unknown>): Promise<unknown>;

export function rejectSubmission(id: string | number, reason: string | null): Promise<unknown>;

export function submitFeedback(body: Record<string, unknown>): Promise<unknown>;

export const FEEDBACK_PAGE_SIZE: number;
