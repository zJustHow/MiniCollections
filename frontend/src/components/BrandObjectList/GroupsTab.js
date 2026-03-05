import { Card, Input, List } from "antd";
import CardCover from "./CardCover";
import { LIST_GRID } from "./constants";

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
  zIndex: 1000,
};

export default function GroupsTab({
  groups,
  loading,
  onSearch,
  onGroupClick,
  onCreateGroup,
}) {
  return (
    <div style={{ position: "relative", minHeight: 200 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <Search
          placeholder="Search groups"
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
        dataSource={groups}
        renderItem={(group) => (
          <List.Item key={group.id}>
            <Card
              hoverable
              style={{ borderRadius: 8, overflow: "hidden" }}
              cover={
                <CardCover
                  imageUrl={group.imageUrl ?? group.image_url}
                  name={group.name}
                />
              }
              onClick={() => onGroupClick(group)}
              bodyStyle={{ padding: 0 }}
            />
          </List.Item>
        )}
      />
      <button type="button" onClick={onCreateGroup} style={fabStyle}>
        +
      </button>
    </div>
  );
}
