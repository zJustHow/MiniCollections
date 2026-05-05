import { Card, Input, List } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import CardCover from "./CardCover";
import { LIST_GRID } from "./constants";
import { useLocale } from "../../LocaleContext";

const { Search } = Input;

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
        dataSource={[{ id: "__add__" }, ...groups]}
        renderItem={(group) => (
          <List.Item key={group.id}>
            {group.id === "__add__" ? (
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
                    <div className="neu-nameplate">{t("createGroup")}</div>
                  </div>
                }
                onClick={onCreateGroup}
                bodyStyle={{ padding: 0 }}
              />
            ) : (
              <Card
                hoverable
                className="neu-model-card"
                cover={
                  <CardCover
                    image_url={group.image_url}
                    name={group.name}
                  />
                }
                onClick={() => onGroupClick(group)}
                bodyStyle={{ padding: 0 }}
              />
            )}
          </List.Item>
        )}
      />
    </div>
  );
}
