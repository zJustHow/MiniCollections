import NeuCard from "../NeuCard";
import { useNavigate } from "react-router-dom";
import useTabListSearchField from "../../hooks/useTabListSearchField";
import ObjectListPageShell from "../listPage/ObjectListPageShell";
import TabListPageBody from "../listPage/TabListPageBody";
import TabCombinedSearchSection from "../listPage/TabCombinedSearchSection";
import { withAddCardSlot } from "../../utils/listPageUtils";
import { useLocale } from "../../LocaleContext";

export default function GroupsTab({
  groups,
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
  const { draftQuery, handleDraftChange } = useTabListSearchField(
    searchValue,
    onSearch,
  );

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

  const renderObjectCard = (obj) => (
    <NeuCard
      key={obj.id}
      name={obj.name}
      subtitle={obj.groupName ?? obj.group_name}
      nameplateVariant="object"
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

  const hasGroupResults = (combinedSearchPage?.totalBrands ?? 0) > 0;
  const showObjectsSection =
    searchActive &&
    (searchResultObjects.length > 0 ||
      combinedSearchPage?.loading ||
      (combinedSearchPage?.totalObjects ?? 0) > 0);
  const showGroupCards = searchResultGroups.length > 0;
  const showObjectCards =
    searchResultObjects.length > 0 || combinedSearchPage?.loading;

  const spinning = searchActive
    ? Boolean(combinedSearchPage?.loading)
    : Boolean(groupsListPage?.loading);

  const browseData = withAddCardSlot(
    groups,
    (groupsListPage?.page ?? 0) === 0,
  );

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
      <TabListPageBody
        searchActive={searchActive}
        spinning={spinning}
        searchHasResults={hasGroupResults || showObjectsSection}
        searchPaginationPage={combinedSearchPage}
        browsePaginationPage={groupsListPage}
        browsePaginationIncludeTotals={false}
        browseItems={browseData}
        renderBrowseItem={renderGroupCard}
        searchContent={
          <TabCombinedSearchSection
            spinning={spinning}
            hasResults={hasGroupResults || showObjectsSection}
            showPrimaryCards={showGroupCards}
            showObjectSection={showObjectsSection}
            showObjectCards={showObjectCards}
            showDivider={
              showGroupCards && showObjectsSection && showObjectCards
            }
            primaryCards={searchResultGroups.map(renderGroupCard)}
            objectCards={searchResultObjects.map(renderObjectCard)}
          />
        }
      />
    </ObjectListPageShell>
  );
}
