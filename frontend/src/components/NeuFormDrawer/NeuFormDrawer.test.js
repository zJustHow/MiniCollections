import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NeuFormDrawer, { NEU_FORM_DRAWER_WIDTH } from "./index";

vi.mock("antd/es/locale", () => ({
  useLocale: () => [{ Modal: { okText: "OK" } }],
}));

vi.mock("../DrawerHeaderTitle", () => ({
  default: ({ title, onClose, onOk, okText, confirmLoading, trailing }) => (
    <div data-testid="drawer-header">
      <span>{title}</span>
      <button type="button" aria-label="Close" onClick={onClose}>
        close
      </button>
      {onOk ? (
        <button type="button" aria-label={okText} onClick={onOk} disabled={confirmLoading}>
          {okText}
        </button>
      ) : null}
      {trailing}
    </div>
  ),
}));

vi.mock("../drawerStyles", () => ({
  NeuDrawerBody: ({ children }) => <div data-testid="drawer-body">{children}</div>,
}));

vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    Drawer: ({ open, children, footer, width }) =>
      open ? (
        <div data-testid="drawer" data-width={width}>
          {children}
          {footer}
        </div>
      ) : null,
  };
});

describe("NeuFormDrawer", () => {
  test("exports default form drawer width", () => {
    expect(NEU_FORM_DRAWER_WIDTH).toBe(480);
  });

  test("renders title, body, and ok action when open", async () => {
    const onOk = vi.fn();
    const onClose = vi.fn();

    render(
      <NeuFormDrawer
        open
        title="Edit Group"
        okText="Save"
        onOk={onOk}
        onClose={onClose}
      >
        <p>Form fields</p>
      </NeuFormDrawer>,
    );

    expect(screen.getByTestId("drawer")).toHaveAttribute("data-width", "480");
    expect(screen.getByText("Edit Group")).toBeInTheDocument();
    expect(screen.getByTestId("drawer-body")).toHaveTextContent("Form fields");

    await userEvent.click(screen.getByLabelText("Save"));
    expect(onOk).toHaveBeenCalled();
  });

  test("renders trailing actions and hides when closed", () => {
    const { rerender } = render(
      <NeuFormDrawer
        open
        title="Details"
        onClose={vi.fn()}
        trailing={<button type="button">Extra</button>}
      >
        <p>Content</p>
      </NeuFormDrawer>,
    );

    expect(screen.getByText("Extra")).toBeInTheDocument();

    rerender(
      <NeuFormDrawer open={false} title="Details" onClose={vi.fn()}>
        <p>Content</p>
      </NeuFormDrawer>,
    );

    expect(screen.queryByTestId("drawer")).not.toBeInTheDocument();
  });
});
