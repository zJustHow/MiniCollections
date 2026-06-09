import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HeaderActionButton from "./HeaderActionButton";

vi.mock("./NeuPressableButton", () => ({
  default: ({ children, onClick, disabled, ...props }) => (
    <button type="button" onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

describe("HeaderActionButton", () => {
  test("renders icon and handles click", async () => {
    const onClick = vi.fn();
    render(
      <HeaderActionButton icon={<span>icon</span>} aria-label="back" onClick={onClick} />,
    );

    await userEvent.click(screen.getByLabelText("back"));
    expect(onClick).toHaveBeenCalled();
  });

  test("shows loading indicator instead of icon", () => {
    render(
      <HeaderActionButton
        loading
        icon={<span data-testid="custom-icon">icon</span>}
        aria-label="save"
      />,
    );

    expect(screen.queryByTestId("custom-icon")).not.toBeInTheDocument();
    expect(screen.getByLabelText("save")).toBeDisabled();
  });
});
