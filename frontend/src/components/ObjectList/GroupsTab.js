import { Card, Input, List } from "antd";
import CardCover from "./CardCover";
import { LIST_GRID, Z_INDEX } from "./constants";
import { useLocale } from "../../LocaleContext";

const { Search } = Input;

const fabStyle = {
  position: "fixed",
  right: 40,
  bottom: 40,
  width: 52,
  height: 52,
  borderRadius: "50%",
  fontSize: 26,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  zIndex: Z_INDEX.FAB_MAIN_LIST,
};

export default function GroupsTab({
  groups,
  loading,
  onSearch,
  onGroupClick,
  onCreateGroup,
}) {
  const { t } = useLocale();
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
          placeholder={t("searchGroups")}
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
                  image_url={group.image_url}
                  name={group.name}
                />
              }
              onClick={() => onGroupClick(group)}
              bodyStyle={{ padding: 0 }}
            />
          </List.Item>
        )}
      />
      <button type="button" onClick={onCreateGroup} style={fabStyle} className="neu-fab">
        +
      </button>
    </div>
  );
}
