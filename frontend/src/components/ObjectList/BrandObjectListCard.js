import { Card } from "antd";
import { AppstoreAddOutlined, EyeOutlined } from "@ant-design/icons";
import CardCover from "./CardCover";
import { useLocale } from "../../LocaleContext";

export default function BrandObjectListCard({ item, onClick }) {
  const { t } = useLocale();
  const groupAdds = item.group_add_count ?? 0;
  const views = item.view_count ?? 0;

  return (
    <Card
      hoverable
      className="neu-model-card neu-brand-object-list-card"
      cover={
        <CardCover image_url={item.image_url} namePlacement="none" />
      }
      onClick={onClick}
      styles={{ body: { padding: 0 } }}
    >
      <div className="neu-card-footer">
        <div className="neu-card-title" title={item.name}>
          {item.name}
        </div>
        <div className="neu-card-stats">
          <span
            className="neu-card-stat"
            title={t("statGroupAdds")}
          >
            <AppstoreAddOutlined />
            {groupAdds}
          </span>
          <span
            className="neu-card-stat"
            title={t("statViews")}
          >
            <EyeOutlined />
            {views}
          </span>
        </div>
      </div>
    </Card>
  );
}
