import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmDeleteButton from "./ConfirmDeleteButton";

vi.mock("../LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

describe("ConfirmDeleteButton", () => {
  test("requires two clicks to confirm delete", async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDeleteButton onConfirm={onConfirm} />);

    await userEvent.click(screen.getByRole("button", { name: "delete" }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "confirmDelete" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "confirmDelete" }));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled();
    });
  });

  test("uses custom labels for header variant", async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDeleteButton
        variant="header"
        deleteLabel="rejectSubmission"
        confirmLabel="confirmReject"
        onConfirm={onConfirm}
      />,
    );

    await userEvent.click(screen.getByLabelText("rejectSubmission"));
    expect(screen.getByLabelText("confirmReject")).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText("confirmReject"));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled();
    });
  });

  test("does not arm confirm when disabled", async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDeleteButton disabled onConfirm={onConfirm} />);

    await userEvent.click(screen.getByRole("button", { name: "delete" }));

    expect(screen.queryByLabelText("confirmDelete")).not.toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
