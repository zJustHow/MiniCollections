import { Card, Grid, Input, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import CardCover from "./CardCover";
import { useLocale } from "../../LocaleContext";

const { Search } = Input;
const { useBreakpoint } = Grid;

export default function BrandsTab({
  brands,
  loading,
  onSearch,
  onBrandClick,
  isAdmin,
  onCreateBrand,
}) {
  const { t } = useLocale();
  const screens = useBreakpoint();
  const cols = screens.lg ? 4 : screens.md ? 3 : 2;

  const dataSource = isAdmin ? [{ id: "__add__" }, ...brands] : brands;

  return (
    <>
      <div
        style={{
          display: screens.md ? "flex" : "block",
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
          style={{ width: screens.md ? 260 : "100%" }}
        />
      </div>
      <Spin spinning={loading}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 16,
          }}
        >
          {dataSource.map((brand) =>
            brand.id === "__add__" ? (
              <Card
                key="__add__"
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
                key={brand.id}
                hoverable
                className="neu-model-card"
                cover={<CardCover image_url={brand.image_url} name={brand.name} />}
                onClick={() => onBrandClick(brand)}
                bodyStyle={{ padding: 0 }}
              />
            )
          )}
        </div>
      </Spin>
    </>
  );
}
