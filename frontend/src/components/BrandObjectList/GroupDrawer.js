import { Button, Card, Drawer, Input, List } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { LIST_GRID_DRAWER, DRAWER_WIDTH } from "./constants";

const { Search } = Input;

const fabStyle = {
  position: "fixed",
  right: 40,
  bottom: 40,
  width: 48,
  height: 48,
  borderRadius: "50%",
  border: "none",
  backgroundColor: "#1890ff",
  color: "#fff",
  fontSize: 24,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  zIndex: 1100,
};

export default function GroupDrawer({
  open,
  onClose,
  selectedGroup,
  userObjects,
  loading,
  searchKeyword,
  onSearchChange,
  onUserObjectClick,
  onEditGroup,
  onDeleteGroup,
  onAddModel,
}) {
  const filteredObjects = searchKeyword.trim()
    ? userObjects.filter((item) =>
        (item.name ?? "")
          .toLowerCase()
          .includes(searchKeyword.trim().toLowerCase())
      )
    : userObjects;

  return (
    <Drawer
      title={
        selectedGroup ? (
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
            <span>{selectedGroup.name} Models</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Button size="small" onClick={onEditGroup}>
                Edit
              </Button>
              <Button size="small" danger onClick={onDeleteGroup}>
                Delete
              </Button>
              <Search
                placeholder="Search models"
                allowClear
                onSearch={onSearchChange}
                onChange={(e) => {
                  if (e.target.value === "") onSearchChange("");
                }}
                style={{ width: 200 }}
              />
            </div>
          </div>
        ) : null
      }
      open={open}
      onClose={onClose}
      width={DRAWER_WIDTH}
    >
      {selectedGroup && (
        <div style={{ position: "relative", minHeight: 200 }}>
          <List
            loading={loading}
            grid={LIST_GRID_DRAWER}
            dataSource={filteredObjects}
            locale={{ emptyText: "No models in this group yet" }}
            renderItem={(item) => (
              <List.Item key={item.id}>
                <Card
                  hoverable
                  bodyStyle={{ height: 56, minHeight: 56, padding: "0 24px", overflow: "hidden", display: "flex", alignItems: "center" }}
                  cover={
                    <img
                      src={item.imageUrl ?? item.image_url}
                      alt={item.name ?? ""}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: 200,
                        objectFit: "cover",
                      }}
                    />
                  }
                  onClick={() => onUserObjectClick(item)}
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
                    {item.name ?? "—"}
                  </div>
                </Card>
              </List.Item>
            )}
          />
          <button type="button" onClick={onAddModel} style={fabStyle}>
            <PlusOutlined />
          </button>
        </div>
      )}
    </Drawer>
  );
}
