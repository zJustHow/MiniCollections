import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import GroupObjectsPageHeader from "../pageHeaders/GroupObjectsPageHeader";
import { useHeader } from "../../HeaderContext";
import { useSearchParams } from "react-router-dom";
import { mutateSearchParams } from "../../utils/searchParams";
import usePagedList from "../../hooks/usePagedList";
import useCombinedBrandSearch from "../../hooks/useCombinedBrandSearch";
import { App, Form } from "antd";
import { getGroupsPage, searchGroupsCombinedPage, createGroup, PAGE_SIZE } from "../../utils";
import { useLocale } from "../../LocaleContext";

export default function useGroupsState() {
  const { message } = App.useApp();
  const { t } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const { setHeaderSlot } = useHeader();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchValue = searchParams.get("q") || "";
  const [searchKeyword, setSearchKeyword] = useState("");
  const syncedKeywordRef = useRef("");

  const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false);
  const [createGroupLoading, setCreateGroupLoading] = useState(false);
  const [groupForm] = Form.useForm();
  const [groupImageData, setGroupImageData] = useState(null);

  const groupSearchActive =
    location.pathname === "/groups" && Boolean((searchValue ?? "").trim());

  const groupsList = usePagedList(
    ({ size, page }) => getGroupsPage({ size, page }),
    {
      resetKey: "groups-list",
      enabled: !groupSearchActive,
      pageSize: PAGE_SIZE,
      pageParamKey: "page",
      reservedFirstPageSlots: 1,
    },
  );

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
    const returnSearch = location.search;
    setHeaderSlot(
      <GroupObjectsPageHeader group={group} returnSearch={returnSearch} />,
    );
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
        groupsList.loadPage(0);
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

  const loadingGroups = groupSearchActive ? combinedSearch.loading : groupsList.loading;

  return useMemo(
    () => ({
      groups: groupsList.items,
      loadingGroups,
      handleGroupClick,
      handleGroupSearch,
      searchValue,
      groupSearchActive,
      groupSearchResultGroups: combinedSearch.brands,
      groupSearchResultObjects: combinedSearch.objects,
      groupsListPage: groupsList,
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
      groupsList,
      combinedSearch,
      loadingGroups,
      handleGroupSearch,
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
