import { Card, Drawer, Input, List, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { LIST_GRID_DRAWER, DRAWER_WIDTH } from "./constants";

const { Search } = Input;

const addButtonStyle = {
  position: "absolute",
  right: 12,
  bottom: 12,
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "none",
  backgroundColor: "#1890ff",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
};

export default function BrandDrawer({
  open,
  onClose,
  selectedBrand,
  brandObjects,
  loading,
  searchKeyword,
  onSearchChange,
  onBrandObjectClick,
  onAddToGroup,
}) {
  const filteredObjects = searchKeyword.trim()
    ? brandObjects.filter((bo) =>
        (bo.name || "")
          .toLowerCase()
          .includes(searchKeyword.trim().toLowerCase())
      )
    : brandObjects;

  return (
    <Drawer
      title={
        selectedBrand ? (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              width: "100%",
              paddingRight: 8,
            }}
          >
            <span>{selectedBrand.name} Models</span>
            <Search
              placeholder="Search models"
              allowClear
              onSearch={onSearchChange}
              onChange={(e) => {
                if (e.target.value === "") onSearchChange("");
              }}
              style={{ width: 220 }}
            />
          </div>
        ) : null
      }
      open={open}
      onClose={onClose}
      width={DRAWER_WIDTH}
    >
      {selectedBrand && (
        <Spin spinning={loading}>
          <List
            grid={LIST_GRID_DRAWER}
            dataSource={filteredObjects}
            renderItem={(item) => (
              <List.Item key={item.id}>
                <Card
                  hoverable
                  onClick={() => onBrandObjectClick(item)}
                  bodyStyle={{ height: 56, minHeight: 56, padding: "0 24px", overflow: "hidden", display: "flex", alignItems: "center" }}
                  cover={
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: 200,
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        loading="lazy"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToGroup(item);
                        }}
                        style={addButtonStyle}
                      >
                        <PlusOutlined />
                      </button>
                    </div>
                  }
                >
                  <div
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.name}
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </Spin>
      )}
    </Drawer>
  );
}
