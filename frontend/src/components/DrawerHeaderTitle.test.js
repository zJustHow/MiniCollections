import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DrawerHeaderTitle from "./DrawerHeaderTitle";

vi.mock("./HeaderActionButton", () => ({
  default: ({ onClick, "aria-label": ariaLabel, loading, disabled }) => (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={loading || disabled}
    >
      {ariaLabel}
    </button>
  ),
}));

vi.mock("./ConfirmDeleteButton", () => ({
  default: ({ onConfirm, deleteLabel }) => (
    <button type="button" aria-label={deleteLabel} onClick={onConfirm}>
      {deleteLabel}
    </button>
  ),
}));

describe("DrawerHeaderTitle", () => {
  test("renders title and close action", async () => {
    const onClose = vi.fn();
    render(<DrawerHeaderTitle title="Edit Group" onClose={onClose} />);

    expect(screen.getByText("Edit Group")).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalled();
  });

  test("renders ok and delete actions", async () => {
    const onOk = vi.fn();
    const onDelete = vi.fn();

    render(
      <DrawerHeaderTitle
        title="Confirm"
        onClose={vi.fn()}
        onOk={onOk}
        okText="Save"
        onDelete={onDelete}
        deleteLabel="Remove"
      />,
    );

    await userEvent.click(screen.getByLabelText("Save"));
    await userEvent.click(screen.getByLabelText("Remove"));

    expect(onOk).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalled();
  });

  test("renders trailing actions and disables ok while loading", () => {
    render(
      <DrawerHeaderTitle
        title="Details"
        onClose={vi.fn()}
        onOk={vi.fn()}
        okText="Save"
        confirmLoading
        trailing={<button type="button">Extra</button>}
      />,
    );

    expect(screen.getByText("Extra")).toBeInTheDocument();
    expect(screen.getByLabelText("Save")).toBeDisabled();
  });
});
