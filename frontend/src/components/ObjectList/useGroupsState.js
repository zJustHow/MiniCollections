import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { mutateSearchParams } from "../../utils/searchParams";
import useCombinedBrandSearch from "../../hooks/useCombinedBrandSearch";
import useOrderableInfiniteBrowse from "../../hooks/useOrderableInfiniteBrowse";
import { App, Form } from "antd";
import { PAGE_SIZE } from "../../utils/apiClient";
import {
  getGroupsPage,
  getGroupOrder,
  reorderGroups,
  searchGroupsCombinedPage,
  createGroup,
} from "../../utils/groupsApi";
import { useLocale } from "../../LocaleContext";
import { prefetchGroupObjectsPage } from "../../utils/prefetchRoutes";

export default function useGroupsState() {
  const { message } = App.useApp();
  const { t } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchValue = searchParams.get("q") || "";
  const [searchKeyword, setSearchKeyword] = useState("");
  const syncedKeywordRef = useRef("");

  const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false);
  const [createGroupLoading, setCreateGroupLoading] = useState(false);
  const [groupForm] = Form.useForm();
  const [groupImageData, setGroupImageData] = useState(null);

  const onGroupsTab = location.pathname === "/groups";
  const groupSearchActive =
    onGroupsTab && Boolean((searchValue ?? "").trim());

  const groupsBrowse = useOrderableInfiniteBrowse({
    entityKey: "groups",
    enabled: onGroupsTab && !groupSearchActive,
    fetchPage: ({ size, page }) => getGroupsPage({ size, page }),
    fetchOrder: getGroupOrder,
    reorder: reorderGroups,
    pageSize: PAGE_SIZE,
    reservedFirstPageSlots: 1,
    listResetKey: "groups-list",
  });

  const combinedSearch = useCombinedBrandSearch(
    ({ size, page }) =>
      searchGroupsCombinedPage(searchKeyword, { size, page }).then((response) => ({
        ...response,
        brands: response.groups ?? [],
        total_brands: response.total_groups ?? 0,
      })),
    {
      resetKey: `group-search:${searchKeyword}`,
      enabled: groupSearchActive && Boolean(searchKeyword),
      pageSize: PAGE_SIZE,
      pageParamKey: "searchPage",
    },
  );

  useEffect(() => {
    if (location.pathname !== "/groups") return;
    const keyword = (searchValue ?? "").trim();
    if (keyword) {
      syncedKeywordRef.current = keyword;
      setSearchKeyword(keyword);
    } else {
      syncedKeywordRef.current = "";
      setSearchKeyword("");
    }
  }, [location.pathname, searchValue]);

  const handleGroupClick = (group) => {
    prefetchGroupObjectsPage();
    const returnSearch = location.search;
    const nextSearch = new URLSearchParams(location.search);
    nextSearch.delete("q");
    nextSearch.delete("page");
    nextSearch.delete("searchPage");
    const search = nextSearch.toString();
    navigate(
      { pathname: `/groups/${group.id}`, search: search ? `?${search}` : "" },
      { state: { group, returnSearch } },
    );
  };

  const handleGroupSearch = useCallback(
    (value) => {
      const keyword = value.trim();
      mutateSearchParams(
        setSearchParams,
        (next) => {
          next.delete("page");
          next.delete("searchPage");
          if (keyword) {
            next.set("q", keyword);
          } else {
            next.delete("q");
          }
        },
        { replace: true },
      );
      syncedKeywordRef.current = keyword;
      setSearchKeyword(keyword);
    },
    [setSearchParams],
  );

  const handleGroupReorder = useCallback(
    async (activeId, overId) => {
      const ok = await groupsBrowse.handleDragEnd(activeId, overId);
      if (ok === false) {
        message.error(t("failedToReorder"));
      }
    },
    [groupsBrowse, message, t],
  );

  const handleCreateGroup = async () => {
    try {
      const values = await groupForm.validateFields();
      setCreateGroupLoading(true);
      const payload = {
        name: values.name,
        image_url: groupImageData || null,
      };
      try {
        await createGroup(payload);
        message.success(t("groupCreated"));
        await groupsBrowse.refreshAll();
        setCreateGroupModalVisible(false);
        setGroupImageData(null);
        groupForm.resetFields();
      } catch (err) {
        message.error(err?.message || t("failedToCreateGroup"));
      } finally {
        setCreateGroupLoading(false);
      }
    } catch {
      // validation failed
    }
  };

  const loadingGroups = groupSearchActive
    ? combinedSearch.loading
    : groupsBrowse.loading || groupsBrowse.orderLoading;

  return useMemo(
    () => ({
      groups: groupsBrowse.displayItems,
      loadingGroups,
      handleGroupClick,
      handleGroupSearch,
      handleGroupReorder,
      searchValue,
      groupSearchActive,
      groupSearchResultGroups: combinedSearch.brands,
      groupSearchResultObjects: combinedSearch.objects,
      groupsBrowse,
      groupCombinedSearchPage: combinedSearch,
      createGroupModalVisible,
      setCreateGroupModalVisible,
      createGroupLoading,
      groupForm,
      groupImageData,
      setGroupImageData,
      handleCreateGroup,
    }),
    [
      groupsBrowse,
      combinedSearch,
      loadingGroups,
      handleGroupSearch,
      handleGroupReorder,
      searchValue,
      groupSearchActive,
      createGroupModalVisible,
      createGroupLoading,
      groupForm,
      groupImageData,
      handleCreateGroup,
    ],
  );
}
