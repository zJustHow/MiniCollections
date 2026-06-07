import { Spin } from "antd";

export default function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 240,
        padding: 48,
      }}
    >
      <Spin size="large" />
    </div>
  );
}
