import { render, screen } from "@testing-library/react";
import { NeuDrawerBody } from "./drawerStyles";

describe("drawerStyles", () => {
  test("NeuDrawerBody wraps children in drawer content class", () => {
    render(<NeuDrawerBody>Drawer content</NeuDrawerBody>);

    const body = screen.getByText("Drawer content");
    expect(body).toHaveClass("neu-drawer-body-content");
  });
});
