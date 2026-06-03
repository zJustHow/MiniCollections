import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useSearchParam from "../../hooks/useSearchParam";
import useObjectFilterParams from "../../hooks/useObjectFilterParams";
import { App, Form } from "antd";
import { getGroups, searchGroups, searchGroupsFacets, createGroup } from "../../utils";
import { filterKeyFromIds } from "../../utils/filterParams";
import { useLocale } from "../../LocaleContext";

export default function useGroupsState() {
  const { message } = App.useApp();
  const { t } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchParam] = useSearchParam();
  const {
    selectedCategoryIds,
    selectedBrandIds,
    selectedScaleIds,
    clearObjectFilters,
    onToggleCategory,
    onToggleBrand,
    onToggleScale,
  } = useObjectFilterParams();
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupSearchActive, setGroupSearchActive] = useState(false);
  const [groupSearchKeyword, setGroupSearchKeyword] = useState("");
  const [groupSearchResultGroups, setGroupSearchResultGroups] = useState([]);
  const [groupSearchResultObjects, setGroupSearchResultObjects] = useState([]);
  const [searchFacets, setSearchFacets] = useState(null);
  const [facetsLoading, setFacetsLoading] = useState(false);

  // Create group modal
  const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false);
  const [createGroupLoading, setCreateGroupLoading] = useState(false);
  const [groupForm] = Form.useForm();
  const [groupImageData, setGroupImageData] = useState(null);
  const syncedKeywordRef = useRef((searchValue ?? "").trim());
  const fetchKeywordRef = useRef("");

  const objectFilterKey = filterKeyFromIds(
    selectedCategoryIds,
    selectedBrandIds,
    selectedScaleIds,
  );

  const runGroupSearch = useCallback(
    async (keyword, filters = {}) => {
      const data = await searchGroups(keyword, filters);
      setGroupSearchResultGroups(data.groups ?? []);
      setGroupSearchResultObjects(data.objects ?? []);
    },
    [],
  );

  const loadBrowseGroups = useCallback(async () => {
    const data = await getGroups();
    setGroups(data);
    setGroupSearchActive(false);
    setGroupSearchResultGroups([]);
    setGroupSearchResultObjects([]);
  }, []);

  useEffect(() => {
    if (location.pathname !== "/groups") return undefined;

    const keyword = (searchValue ?? "").trim();
    if (keyword) {
      if (keyword !== syncedKeywordRef.current) {
        clearObjectFilters();
        syncedKeywordRef.current = keyword;
      }
      setGroupSearchKeyword(keyword);
      setGroupSearchActive(true);
    } else {
      setGroupSearchKeyword("");
      setGroupSearchActive(false);
      clearObjectFilters();
      setSearchFacets(null);
      syncedKeywordRef.current = "";
      fetchKeywordRef.current = "";
    }

    const keywordChanged = keyword !== fetchKeywordRef.current;
    fetchKeywordRef.current = keyword;

    let cancelled = false;
    const fetchPage = async () => {
      if (!keyword || keywordChanged) {
        setLoadingGroups(true);
      }
      try {
        if (keyword) {
          await runGroupSearch(keyword, {
            categoryIds: selectedCategoryIds,
            brandIds: selectedBrandIds,
            scaleIds: selectedScaleIds,
          });
        } else {
          await loadBrowseGroups();
        }
      } catch (err) {
        if (!cancelled) {
          message.error(err?.message || t("failedToLoadGroups"));
        }
      } finally {
        if (!cancelled && (!keyword || keywordChanged)) {
          setLoadingGroups(false);
        }
      }
    };
    fetchPage();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, searchValue, objectFilterKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!groupSearchActive || !groupSearchKeyword) {
      setSearchFacets(null);
      return undefined;
    }

    let cancelled = false;
    setFacetsLoading(true);
    searchGroupsFacets(groupSearchKeyword)
      .then((data) => {
        if (!cancelled) {
          setSearchFacets(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSearchFacets({ total: 0, categories: [], brands: [], scales: [] });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setFacetsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [groupSearchKeyword, groupSearchActive, clearObjectFilters]);

  const handleGroupClick = (group) => {
    navigate(`/groups/${group.id}`, { state: { group } });
  };

  const handleGroupSearch = useCallback(
    async (value) => {
      const keyword = value.trim();
      setSearchParam(keyword);
      if (!keyword) {
        setGroupSearchKeyword("");
        setGroupSearchActive(false);
        clearObjectFilters();
        setSearchFacets(null);
        syncedKeywordRef.current = "";
        fetchKeywordRef.current = "";
        setLoadingGroups(true);
        try {
          await loadBrowseGroups();
        } catch (err) {
          message.error(err?.message || t("failedToSearchGroups"));
        } finally {
          setLoadingGroups(false);
        }
        return;
      }
      if (keyword !== syncedKeywordRef.current) {
        clearObjectFilters();
        syncedKeywordRef.current = keyword;
      }
      setGroupSearchKeyword(keyword);
      setGroupSearchActive(true);
    },
    [setSearchParam, clearObjectFilters, loadBrowseGroups, message, t],
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
        const created = await createGroup(payload);
        message.success(t("groupCreated"));
        setGroups((prev) => [...prev, created]);
        setCreateGroupModalVisible(false);
        setGroupImageData(null);
      } catch (err) {
        message.error(err?.message || t("failedToCreateGroup"));
      } finally {
        setCreateGroupLoading(false);
      }
    } catch {
      // validation failed
    }
  };

  const groupShowObjectFilters =
    groupSearchActive &&
    Boolean(groupSearchKeyword) &&
    searchFacets != null &&
    ((searchFacets.categories?.length ?? 0) > 0 ||
      (searchFacets.brands?.length ?? 0) > 0 ||
      (searchFacets.scales?.length ?? 0) > 0);

  return {
    groups,
    setGroups,
    loadingGroups,
    handleGroupClick,
    handleGroupSearch,
    searchValue,
    groupSearchActive,
    groupSearchResultGroups,
    groupSearchResultObjects,
    groupShowObjectFilters,
    groupSearchFacets: searchFacets,
    groupFacetsLoading: facetsLoading,
    groupSelectedCategoryIds: selectedCategoryIds,
    groupSelectedBrandIds: selectedBrandIds,
    groupSelectedScaleIds: selectedScaleIds,
    onGroupToggleCategory: onToggleCategory,
    onGroupToggleBrand: onToggleBrand,
    onGroupToggleScale: onToggleScale,
    createGroupModalVisible,
    setCreateGroupModalVisible,
    createGroupLoading,
    groupForm,
    groupImageData,
    setGroupImageData,
    handleCreateGroup,
  };
}
