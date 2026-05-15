export const STATUS_COLOR = {
  PENDING: "orange",
  APPROVED: "green",
  REJECTED: "red",
};

export const TYPE_COLOR = {
  MISSING_MODEL: "blue",
  BUG_REPORT: "volcano",
  DATA_CORRECTION: "purple",
};

export function useStatusLabel(t) {
  return (status) => {
    if (status === "PENDING") return t("statusPending");
    if (status === "APPROVED") return t("statusApproved");
    if (status === "REJECTED") return t("statusRejected");
    if (status === "RESOLVED") return t("statusResolved");
    if (status === "CLOSED") return t("statusClosed");
    return status;
  };
}

export function useTypeLabel(t) {
  return (type) => {
    if (type === "MISSING_MODEL") return t("feedbackTypeMissingModel");
    if (type === "BUG_REPORT") return t("feedbackTypeBugReport");
    if (type === "DATA_CORRECTION") return t("feedbackTypeDataCorrection");
    return type;
  };
}
