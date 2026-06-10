import React from "react";
import SearchOutlined from "@ant-design/icons/es/icons/SearchOutlined.js";
import { Input } from "antd";
import { createNeuButton } from "../NeuButton";
import { createNeuControl, neuControlStyle, useNeuFieldIdentity } from "./shared.js";

function createNeuInputVariant(Component, displayName) {
  return createNeuControl(Component, displayName, { defaultFullWidth: false });
}

function resolveSearchEnterButton(enterButton) {
  if (enterButton === false) return false;
  if (typeof enterButton === "string") {
    return createNeuButton({ variant: "primary", children: enterButton });
  }
  if (React.isValidElement(enterButton)) {
    return enterButton;
  }
  return createNeuButton({
    icon: <SearchOutlined />,
    "aria-label": "search",
  });
}

const NeuInputSearch = React.forwardRef(function NeuInputSearch(
  { enterButton = true, fullWidth = false, style, id, name, ...props },
  ref,
) {
  const fieldIdentity = useNeuFieldIdentity({ id, name, prefix: "neu-search" });
  return (
    <Input.Search
      ref={ref}
      style={neuControlStyle(style, fullWidth)}
      enterButton={resolveSearchEnterButton(enterButton)}
      {...fieldIdentity}
      {...props}
    />
  );
});
NeuInputSearch.displayName = "NeuInput.Search";

const NeuInputBase = createNeuControl(Input, "NeuInput", { defaultFullWidth: false });
NeuInputBase.TextArea = createNeuInputVariant(Input.TextArea, "NeuInput.TextArea");
NeuInputBase.Password = createNeuInputVariant(
  Input.Password,
  "NeuInput.Password",
);
NeuInputBase.Search = NeuInputSearch;

/** Neumorphic text inputs — theme tokens via root ConfigProvider. */
export const NeuInput = NeuInputBase;
