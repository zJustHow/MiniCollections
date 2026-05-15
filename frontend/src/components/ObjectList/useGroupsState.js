import { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { App, Form } from "antd";
import { getGroups, searchGroups, createGroup } from "../../utils";
import { useLocale } from "../../LocaleContext";

export default function useGroupsState() {
  const { message } = App.useApp();
  const { t } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupSearchActive, setGroupSearchActive] = useState(false);
  const [groupSearchResultGroups, setGroupSearchResultGroups] = useState([]);
  const [groupSearchResultObjects, setGroupSearchResultObjects] = useState([]);

  // Create group modal
  const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false);
  const [createGroupLoading, setCreateGroupLoading] = useState(false);
  const [groupForm] = Form.useForm();
  const [groupImageData, setGroupImageData] = useState(null);

  useEffect(() => {
    if (location.pathname !== "/groups") return;
    const fetchGroups = async () => {
      setLoadingGroups(true);
      try {
        const q = searchParams.get("q");
        if (q) {
          const data = await searchGroups(q);
          setGroupSearchActive(true);
          setGroupSearchResultGroups(data.groups ?? []);
          setGroupSearchResultObjects(data.objects ?? []);
        } else {
          const data = await getGroups();
          setGroups(data);
          setGroupSearchActive(false);
        }
      } catch (err) {
        message.error(err.message || t("failedToLoadGroups"));
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGroupClick = (group) => {
    navigate(`/groups/${group.id}`, { state: { group } });
  };

  const handleGroupSearch = async (value) => {
    const keyword = value.trim();
    if (keyword) setSearchParams({ q: keyword }, { replace: true });
    else setSearchParams({}, { replace: true });
    setLoadingGroups(true);
    try {
      if (keyword) {
        const data = await searchGroups(keyword);
        setGroupSearchActive(true);
        setGroupSearchResultGroups(data.groups ?? []);
        setGroupSearchResultObjects(data.objects ?? []);
      } else {
        const data = await getGroups();
        setGroups(data);
        setGroupSearchActive(false);
        setGroupSearchResultGroups([]);
        setGroupSearchResultObjects([]);
      }
    } catch (err) {
      message.error(err.message || t("failedToSearchGroups"));
    } finally {
      setLoadingGroups(false);
    }
  };

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
        message.error(err.message || t("failedToCreateGroup"));
      } finally {
        setCreateGroupLoading(false);
      }
    } catch {
      // validation failed
    }
  };

  return {
    groups,
    setGroups,
    loadingGroups,
    handleGroupClick,
    handleGroupSearch,
    searchValue: searchParams.get("q") || "",
    groupSearchActive,
    groupSearchResultGroups,
    groupSearchResultObjects,
    createGroupModalVisible,
    setCreateGroupModalVisible,
    createGroupLoading,
    groupForm,
    groupImageData,
    setGroupImageData,
    handleCreateGroup,
  };
}
