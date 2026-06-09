import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App, Form } from "antd";
import useModalForm from "./useModalForm";

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
  return render(
    <App>
      <ModalFormProbe {...props} />
    </App>,
  );
}

describe("useModalForm", () => {
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
});
