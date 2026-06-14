import { colors } from "@minicollections/theme";

export type TranslateFn = (key: string) => string;

export type FeedbackSubmissionType =
  | "MISSING_MODEL"
  | "BUG_REPORT"
  | "DATA_CORRECTION";

export function feedbackTypeLabel(type: string | undefined, t: TranslateFn) {
  if (type === "MISSING_MODEL") return t("feedbackTypeMissingModel");
  if (type === "BUG_REPORT") return t("feedbackTypeBugReport");
  if (type === "DATA_CORRECTION") return t("feedbackTypeDataCorrection");
  return type ?? "";
}

export function feedbackStatusLabel(status: string | undefined, t: TranslateFn) {
  if (status === "PENDING") return t("statusPending");
  if (status === "APPROVED") return t("statusApproved");
  if (status === "REJECTED") return t("statusRejected");
  if (status === "RESOLVED") return t("statusResolved");
  if (status === "CLOSED") return t("statusClosed");
  return status ?? "";
}

export function feedbackStatusColor(status: string | undefined) {
  if (status === "PENDING") return "#d48806";
  if (status === "APPROVED") return "#389e0d";
  if (status === "REJECTED") return "#cf1322";
  if (status === "RESOLVED") return "#08979c";
  return colors.textSecondary;
}
