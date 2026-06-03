import { Card, Grid, Input, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import CardCover from "./CardCover";
import ObjectSearchFilterPanel from "../ObjectSearchFilterPanel";
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
  showObjectFilters,
  searchFacets,
  facetsLoading,
  selectedCategoryIds,
  selectedBrandIds,
  selectedScaleIds,
  onToggleCategory,
  onToggleBrand,
  onToggleScale,
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
          <>
            <div className="neu-card-cover">
              <div className="neu-card-image-well">
                <div className="neu-card-image-frame">
                  <div className="neu-card-image-placeholder">
                    <PlusOutlined
                      style={{ fontSize: 36, color: "var(--neu-text-2)" }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="neu-nameplate">{t("addGroup")}</div>
          </>
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

  const showFilterColumn =
    showObjectFilters || (searchActive && facetsLoading);

  const showObjectsSection =
    searchActive &&
    (searchResultObjects.length > 0 ||
      showFilterColumn ||
      loading);

  const spinning =
    searchActive &&
    loading &&
    searchResultGroups.length === 0 &&
    searchResultObjects.length === 0 &&
    !showFilterColumn;

  const renderObjectCard = (obj) => (
    <Card
      key={obj.id}
      hoverable
      className="neu-model-card"
      cover={
        <CardCover image_url={obj.imageUrl ?? obj.image_url} name={obj.name} />
      }
      onClick={() =>
        navigate(`/groups/${obj.groupId ?? obj.group_id}/objects/${obj.id}`, {
          state: {
            userObject: obj,
            group: {
              id: obj.groupId ?? obj.group_id,
              name: obj.groupName ?? obj.group_name,
            },
          },
        })
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

      <Spin spinning={spinning}>
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
            {showObjectsSection && (
              <>
                <div
                  style={{
                    ...sectionLabelStyle,
                    marginTop: searchResultGroups.length > 0 ? 24 : 0,
                  }}
                >
                  {t("myObjects")}
                </div>
                <div className="neu-search-objects-layout">
                  {showFilterColumn && (
                    <ObjectSearchFilterPanel
                      facets={searchFacets}
                      loading={facetsLoading}
                      selectedCategoryIds={selectedCategoryIds}
                      selectedBrandIds={selectedBrandIds}
                      selectedScaleIds={selectedScaleIds}
                      onToggleCategory={onToggleCategory}
                      onToggleBrand={onToggleBrand}
                      onToggleScale={onToggleScale}
                    />
                  )}
                  <div
                    className="neu-search-objects-cards"
                    style={
                      showFilterColumn ? undefined : { gridColumn: "1 / -1" }
                    }
                  >
                    {searchResultObjects.map(renderObjectCard)}
                  </div>
                </div>
              </>
            )}
            {searchResultGroups.length === 0 &&
              !showObjectsSection &&
              !loading && (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--neu-text-2)",
                    padding: "32px 0",
                  }}
                >
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
