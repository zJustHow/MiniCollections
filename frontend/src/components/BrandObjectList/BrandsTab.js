import { Card, Input, List } from "antd";
import CardCover from "./CardCover";
import { LIST_GRID } from "./constants";

const { Search } = Input;

export default function BrandsTab({
  brands,
  loading,
  onSearch,
  onBrandClick,
}) {
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
          placeholder="Search brands"
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
        dataSource={brands}
        renderItem={(brand) => (
          <List.Item key={brand.id}>
            <Card
              hoverable
              style={{ borderRadius: 8, overflow: "hidden" }}
              cover={<CardCover imageUrl={brand.imageUrl ?? brand.image_url} name={brand.name} />}
              onClick={() => onBrandClick(brand)}
              bodyStyle={{ padding: 0 }}
            />
          </List.Item>
        )}
      />
    </>
  );
}
