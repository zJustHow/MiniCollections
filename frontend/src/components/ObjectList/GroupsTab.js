import SortableNeuCard from "../listPage/SortableNeuCard";
import { useNavigate } from "react-router-dom";
import useTabListSearchField from "../../hooks/useTabListSearchField";
import ObjectListPageShell from "../listPage/ObjectListPageShell";
import TabCombinedSearchSection from "../listPage/TabCombinedSearchSection";
import SortableInfiniteBrowseSection from "../listPage/SortableInfiniteBrowseSection";
import ActivePagePagination from "../listPage/ActivePagePagination";
import NoSearchResults from "../listPage/NoSearchResults";
import { withAddCardSlot } from "../../utils/listPageUtils";
import { useLocale } from "../../LocaleContext";
import { prefetchGroupObjectDetailPage } from "../../utils/prefetchRoutes";

export default function GroupsTab({
  groups,
  onSearch,
  onGroupClick,
  onCreateGroup,
  onGroupReorder,
  searchValue,
  searchActive,
  searchResultGroups,
  searchResultObjects,
  groupsBrowse,
  combinedSearchPage,
}) {
  const { t } = useLocale();
  const navigate = useNavigate();
  const { draftQuery, handleDraftChange } = useTabListSearchField(
    searchValue,
    onSearch,
  );

  const renderGroupCard = (group) =>
    group.id === "__add__" ? (
      <SortableNeuCard
        key="__add__"
        id="__add__"
        sortEnabled={false}
        add
        name={t("addGroup")}
        onClick={onCreateGroup}
      />
    ) : (
      <SortableNeuCard
        key={group.id}
        id={group.id}
        sortEnabled={groupsBrowse?.sortEnabled}
        name={group.name}
        imageUrl={group.image_url}
        onClick={() => onGroupClick(group)}
      />
    );

  const renderObjectCard = (obj) => (
    <SortableNeuCard
      key={obj.id}
      id={obj.id}
      sortEnabled={false}
      name={obj.name}
      subtitle={obj.groupName ?? obj.group_name}
      nameplateVariant="object"
      imageUrl={obj.imageUrl ?? obj.image_url}
      onMouseEnter={prefetchGroupObjectDetailPage}
      onFocus={prefetchGroupObjectDetailPage}
      onClick={() => {
        prefetchGroupObjectDetailPage();
        navigate(`/groups/${obj.groupId ?? obj.group_id}/objects/${obj.id}`, {
          state: {
            userObject: obj,
            group: {
              id: obj.groupId ?? obj.group_id,
              name: obj.groupName ?? obj.group_name,
            },
          },
        });
      }}
    />
  );

  const hasGroupResults = (combinedSearchPage?.totalBrands ?? 0) > 0;
  const showObjectsSection =
    searchActive &&
    (searchResultObjects.length > 0 ||
      combinedSearchPage?.loading ||
      (combinedSearchPage?.totalObjects ?? 0) > 0);
  const showGroupCards = searchResultGroups.length > 0;
  const showObjectCards =
    searchResultObjects.length > 0 || combinedSearchPage?.loading;

  const searchSpinning = Boolean(combinedSearchPage?.loading);
  const searchHasResults = hasGroupResults || showObjectsSection;

  const browseData = withAddCardSlot(groups, true);
  const sortableIds = groupsBrowse?.orderedIds ?? [];

  return (
    <ObjectListPageShell
      framed
      searchActive={searchActive}
      searchKeyword={searchValue}
      resultPage={combinedSearchPage}
      searchFieldId="groups-search"
      searchFieldName="groupsSearch"
      searchPlaceholder={t("searchGroups")}
      draftQuery={draftQuery}
      onDraftChange={handleDraftChange}
      onSearch={onSearch}
    >
      {searchActive ? (
        <>
          <TabCombinedSearchSection
            spinning={searchSpinning}
            hasResults={searchHasResults}
            showPrimaryCards={showGroupCards}
            showObjectSection={showObjectsSection}
            showObjectCards={showObjectCards}
            showDivider={
              showGroupCards && showObjectsSection && showObjectCards
            }
            primaryCards={searchResultGroups.map(renderGroupCard)}
            objectCards={searchResultObjects.map(renderObjectCard)}
          />
          <ActivePagePagination
            activePage={combinedSearchPage}
            includeTotals={false}
          />
          {!searchSpinning && !searchHasResults ? <NoSearchResults /> : null}
        </>
      ) : (
        <SortableInfiniteBrowseSection
          loading={groupsBrowse?.loading}
          orderLoading={groupsBrowse?.orderLoading}
          items={browseData}
          renderItem={renderGroupCard}
          sortableIds={sortableIds}
          sortEnabled={groupsBrowse?.sortEnabled}
          onDragEnd={onGroupReorder}
          hasMore={groupsBrowse?.hasMore}
          loadingMore={groupsBrowse?.loadingMore}
          onLoadMore={groupsBrowse?.loadMore}
          skeletonVariant="catalog"
        />
      )}
    </ObjectListPageShell>
  );
}
