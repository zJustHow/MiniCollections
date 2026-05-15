import { Card, Grid, Input, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import CardCover from "./CardCover";
import { useLocale } from "../../LocaleContext";

const { Search } = Input;
const { useBreakpoint } = Grid;

export default function GroupsTab({
  groups,
  loading,
  onSearch,
  onGroupClick,
  onCreateGroup,
  searchValue,
  searchActive,
  searchResultGroups,
  searchResultObjects,
}) {
  const { t } = useLocale();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const cols = screens.lg ? 4 : screens.md ? 3 : 2;

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: 16,
  };

  const sectionLabelStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--neu-text-2)",
    marginBottom: 10,
  };

  const renderGroupCard = (group) =>
    group.id === "__add__" ? (
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
            <div className="neu-nameplate">{t("addGroup")}</div>
          </div>
        }
        onClick={onCreateGroup}
        bodyStyle={{ padding: 0 }}
      />
    ) : (
      <Card
        key={group.id}
        hoverable
        className="neu-model-card"
        cover={<CardCover image_url={group.image_url} name={group.name} />}
        onClick={() => onGroupClick(group)}
        bodyStyle={{ padding: 0 }}
      />
    );

  const renderObjectCard = (obj) => (
    <Card
      key={obj.id}
      hoverable
      className="neu-model-card"
      cover={<CardCover image_url={obj.imageUrl ?? obj.image_url} name={obj.name} />}
      onClick={() =>
        navigate(
          `/groups/${obj.groupId ?? obj.group_id}/objects/${obj.id}`,
          {
            state: {
              userObject: obj,
              group: { id: obj.groupId ?? obj.group_id, name: obj.groupName ?? obj.group_name },
            },
          }
        )
      }
      bodyStyle={{ padding: 0 }}
    />
  );

  return (
    <div style={{ position: "relative", minHeight: 200 }}>
      <div
        style={{
          display: screens.md ? "flex" : "block",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <Search
          placeholder={t("searchGroups")}
          allowClear
          defaultValue={searchValue}
          onSearch={onSearch}
          onChange={(e) => {
            if (e.target.value === "") onSearch("");
          }}
          style={{ width: screens.md ? 260 : "100%" }}
        />
      </div>

      <Spin spinning={loading}>
        {searchActive ? (
          <>
            {searchResultGroups.length > 0 && (
              <>
                <div style={sectionLabelStyle}>{t("groups")}</div>
                <div style={gridStyle}>
                  {searchResultGroups.map(renderGroupCard)}
                </div>
              </>
            )}
            {searchResultObjects.length > 0 && (
              <>
                <div style={{ ...sectionLabelStyle, marginTop: searchResultGroups.length > 0 ? 24 : 0 }}>
                  {t("myObjects")}
                </div>
                <div style={gridStyle}>
                  {searchResultObjects.map(renderObjectCard)}
                </div>
              </>
            )}
            {searchResultGroups.length === 0 && searchResultObjects.length === 0 && (
              <div style={{ textAlign: "center", color: "var(--neu-text-2)", padding: "32px 0" }}>
                {t("noSearchResults")}
              </div>
            )}
          </>
        ) : (
          <div style={gridStyle}>
            {[{ id: "__add__" }, ...groups].map(renderGroupCard)}
          </div>
        )}
      </Spin>
    </div>
  );
}
