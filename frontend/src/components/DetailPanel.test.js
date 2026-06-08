import { render, screen } from "@testing-library/react";
import { DetailPanel, DetailRow, PanelText } from "./DetailPanel";

describe("DetailPanel", () => {
  test("renders visible rows and hides empty values", () => {
    render(
      <DetailPanel>
        <DetailRow label="Brand" value="BMW" />
        <DetailRow label="Series" value="" />
        <PanelText label="Notes" text="Mint" />
      </DetailPanel>,
    );

    expect(screen.getByText("Brand")).toBeInTheDocument();
    expect(screen.getByText("BMW")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
    expect(screen.getByText("Mint")).toBeInTheDocument();
    expect(screen.queryByText("Series")).not.toBeInTheDocument();
  });

  test("returns null when all children are empty", () => {
    const { container } = render(
      <DetailPanel>
        <DetailRow label="Brand" value="—" />
      </DetailPanel>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});

describe("DetailDescription", () => {
  test("renders labeled description block", async () => {
    const { DetailDescription } = await import("./DetailPanel");
    render(<DetailDescription label="About" text="Detailed notes" />);

    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Detailed notes")).toBeInTheDocument();
  });
});
