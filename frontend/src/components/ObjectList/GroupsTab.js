import { useEffect, useState } from "react";
import { Spin } from "antd";
import NeuCard from "../NeuCard";
import { NeuInput } from "../NeuFormControl";
import { useNavigate } from "react-router-dom";
import ListPagination from "../ListPagination";
import ObjectListPageLayout from "../ObjectListPageLayout";
import SearchResultsSummary from "../SearchResultsSummary";
import { useLocale } from "../../LocaleContext";
import { PAGE_SIZE } from "../../utils";

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
  groupsListPage,
  combinedSearchPage,
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

  const hasGroupResults = (combinedSearchPage?.totalBrands ?? 0) > 0;
  const showObjectsSection =
    searchActive &&
    ((combinedSearchPage?.totalObjects ?? 0) > 0 ||
      combinedSearchPage?.loading ||
      searchResultObjects.length > 0);

  const spinning = searchActive
    ? combinedSearchPage?.loading &&
      searchResultGroups.length === 0 &&
      searchResultObjects.length === 0
    : groupsListPage?.loading && groups.length === 0;

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

  const showAddCard = (groupsListPage?.page ?? 0) === 0;
  const browseData = showAddCard ? [{ id: "__add__" }, ...groups] : groups;
  const activePage = searchActive ? combinedSearchPage : groupsListPage;

  return (
    <div style={{ position: "relative", minHeight: 200, width: "100%" }}>
      <Spin spinning={spinning}>
        <ObjectListPageLayout
          summary={
            <SearchResultsSummary
              active={searchActive}
              keyword={searchValue}
              count={combinedSearchPage?.totalElements ?? 0}
              exact={combinedSearchPage?.totalExact}
              loading={searchActive && combinedSearchPage?.loading}
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
        >
          {searchActive ? (
            <>
              {(hasGroupResults || showObjectsSection) && (
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
                      <div className="neu-list-page-browse-grid">
                        {searchResultObjects.map(renderObjectCard)}
                      </div>
                    </>
                  )}
                  <ListPagination
                    page={activePage?.page ?? 0}
                    totalPages={activePage?.totalPages ?? 0}
                    loading={activePage?.loading}
                    onPageChange={activePage?.onPageChange}
                    pageSize={PAGE_SIZE}
                  />
                </>
              )}
              {!hasGroupResults &&
                !showObjectsSection &&
                !combinedSearchPage?.loading && (
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
            <>
              <div className="neu-list-page-browse-grid">
                {browseData.map(renderGroupCard)}
              </div>
              <ListPagination
                page={activePage?.page ?? 0}
                totalPages={activePage?.totalPages ?? 0}
                loading={activePage?.loading}
                onPageChange={activePage?.onPageChange}
                pageSize={PAGE_SIZE}
              />
            </>
          )}
        </ObjectListPageLayout>
      </Spin>
    </div>
  );
}
