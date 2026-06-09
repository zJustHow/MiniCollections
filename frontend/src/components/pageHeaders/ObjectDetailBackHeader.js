import ArrowLeftOutlined from "@ant-design/icons/es/icons/ArrowLeftOutlined.js";
import HeaderActionButton from "../HeaderActionButton";

export default function ObjectDetailBackHeader({ title, onBack }) {
  return (
    <div className="header-slot-bar">
      <div className="header-slot-actions">
        <HeaderActionButton icon={<ArrowLeftOutlined />} onClick={onBack} />
      </div>
      <span className="header-slot-title">{title ?? "…"}</span>
    </div>
  );
}
