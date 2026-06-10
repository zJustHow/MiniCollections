import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Form } from "antd";
import useModalForm from "./useModalForm";

const mockMessageError = vi.fn();

vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    App: Object.assign(actual.App, {
      useApp: () => ({
        message: {
          success: vi.fn(),
          error: mockMessageError,
        },
      }),
    }),
  };
});

function ModalFormProbe({ onSubmit, onSuccess, onClose }) {
  const { form, loading, handleOk } = useModalForm({
    onSubmit,
    successMessage: "saved",
    errorMessage: "failed",
    onSuccess,
    onClose,
  });

  return (
    <Form form={form} layout="vertical">
      <Form.Item name="name" rules={[{ required: true, message: "required" }]}>
        <input aria-label="name" />
      </Form.Item>
      <button type="button" onClick={handleOk} disabled={loading}>
        submit
      </button>
    </Form>
  );
}

function renderProbe(props) {
  return render(<ModalFormProbe {...props} />);
}

describe("useModalForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("validates before submit", async () => {
    const onSubmit = vi.fn();
    renderProbe({ onSubmit, onSuccess: vi.fn(), onClose: vi.fn() });

    await userEvent.click(screen.getByRole("button", { name: "submit" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("submits values and closes on success", async () => {
    const onSubmit = vi.fn(async () => {});
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    renderProbe({ onSubmit, onSuccess, onClose });

    await userEvent.type(screen.getByLabelText("name"), "Alice");
    await userEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ name: "Alice" });
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  test("shows fallback error message when submit fails without details", async () => {
    const onSubmit = vi.fn(async () => {
      throw {};
    });
    renderProbe({ onSubmit, onSuccess: vi.fn(), onClose: vi.fn() });

    await userEvent.type(screen.getByLabelText("name"), "Alice");
    await userEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(mockMessageError).toHaveBeenCalledWith("failed");
    });
  });
});
