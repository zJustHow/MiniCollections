import { Card, Input, List } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import CardCover from "./CardCover";
import { LIST_GRID } from "./constants";
import { useLocale } from "../../LocaleContext";

const { Search } = Input;

export default function BrandsTab({
  brands,
  loading,
  onSearch,
  onBrandClick,
  isAdmin,
  onCreateBrand,
}) {
  const { t } = useLocale();

  const dataSource = isAdmin ? [{ id: "__add__" }, ...brands] : brands;

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <Search
          placeholder={t("searchBrands")}
          allowClear
          onSearch={onSearch}
          onChange={(e) => {
            if (e.target.value === "") onSearch("");
          }}
          style={{ width: 260 }}
        />
      </div>
      <List
        loading={loading}
        grid={LIST_GRID}
        dataSource={dataSource}
        renderItem={(brand) => (
          <List.Item key={brand.id}>
            {brand.id === "__add__" ? (
              <Card
                hoverable
                className="neu-model-card"
                cover={
                  <div
                    style={{
                      position: "relative",
                      paddingTop: "75%",
                      overflow: "hidden",
                      borderRadius: "32px 32px 0 0",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PlusOutlined style={{ fontSize: 36, color: "var(--neu-text-2)" }} />
                    </div>
                    <div className="neu-nameplate">{t("addBrand")}</div>
                  </div>
                }
                onClick={onCreateBrand}
                bodyStyle={{ padding: 0 }}
              />
            ) : (
              <Card
                hoverable
                className="neu-model-card"
                cover={<CardCover image_url={brand.image_url} name={brand.name} />}
                onClick={() => onBrandClick(brand)}
                bodyStyle={{ padding: 0 }}
              />
            )}
          </List.Item>
        )}
      />
    </>
  );
}
