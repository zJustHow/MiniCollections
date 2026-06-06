import { useEffect, useState } from "react";
import { Spin } from "antd";
import NeuCard from "../NeuCard";
import { NeuInput } from "../NeuFormControl";
import { useNavigate } from "react-router-dom";
import ObjectSearchFilterLayout from "../ObjectSearchFilterLayout";
import ObjectSearchFilterPanel from "../ObjectSearchFilterPanel";
import ObjectListPageLayout from "../ObjectListPageLayout";
import SearchResultsSummary from "../SearchResultsSummary";
import { useLocale } from "../../LocaleContext";

const { Search } = NeuInput;

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
  const [draftQuery, setDraftQuery] = useState(searchValue ?? "");

  useEffect(() => {
    setDraftQuery(searchValue ?? "");
  }, [searchValue]);

  const sectionLabelStyle = {
    fontSize: 13,
    color: "var(--neu-text-2)",
    marginBottom: 10,
  };

  const renderGroupCard = (group) =>
    group.id === "__add__" ? (
      <NeuCard key="__add__" add name={t("addGroup")} onClick={onCreateGroup} />
    ) : (
      <NeuCard
        key={group.id}
        name={group.name}
        imageUrl={group.image_url}
        onClick={() => onGroupClick(group)}
      />
    );

  const showFilterColumn = showObjectFilters || (searchActive && facetsLoading);

  const showObjectsSection =
    searchActive &&
    (searchResultObjects.length > 0 || showFilterColumn || loading);

  const spinning =
    searchActive &&
    loading &&
    searchResultGroups.length === 0 &&
    searchResultObjects.length === 0 &&
    !showFilterColumn;

  const renderObjectCard = (obj) => (
    <NeuCard
      key={obj.id}
      name={obj.name}
      imageUrl={obj.imageUrl ?? obj.image_url}
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
    />
  );

  const searchResultCount =
    searchResultGroups.length +
    (searchFacets?.total ?? searchResultObjects.length);

  return (
    <div style={{ position: "relative", minHeight: 200, width: "100%" }}>
      <Spin spinning={spinning}>
        <ObjectListPageLayout
          showFilterColumn={
            searchActive && showObjectsSection && showFilterColumn
          }
          summary={
            <SearchResultsSummary
              active={searchActive}
              keyword={searchValue}
              count={searchResultCount}
              loading={searchActive && loading}
            />
          }
          search={
            <Search
              id="groups-search"
              name="groupsSearch"
              placeholder={t("searchGroups")}
              allowClear
              value={draftQuery}
              onSearch={onSearch}
              onChange={(e) => {
                const v = e.target.value;
                setDraftQuery(v);
                if (v === "") onSearch("");
              }}
            />
          }
          filter={
            searchActive && showObjectsSection && showFilterColumn ? (
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
            ) : null
          }
        >
          {searchActive ? (
            <>
              {searchResultGroups.length > 0 && (
                <>
                  <div style={sectionLabelStyle}>{t("groups")}</div>
                  <div className="neu-list-page-browse-grid">
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
                  <ObjectSearchFilterLayout
                    showFilterColumn={showFilterColumn}
                    facets={searchFacets}
                    loading={facetsLoading}
                    selectedCategoryIds={selectedCategoryIds}
                    selectedBrandIds={selectedBrandIds}
                    selectedScaleIds={selectedScaleIds}
                    onToggleCategory={onToggleCategory}
                    onToggleBrand={onToggleBrand}
                    onToggleScale={onToggleScale}
                  >
                    {searchResultObjects.map(renderObjectCard)}
                  </ObjectSearchFilterLayout>
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
            <div className="neu-list-page-browse-grid">
              {[{ id: "__add__" }, ...groups].map(renderGroupCard)}
            </div>
          )}
        </ObjectListPageLayout>
      </Spin>
    </div>
  );
}
