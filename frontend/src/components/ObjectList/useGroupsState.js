import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { App, Form } from "antd";
import { getGroups, searchGroups, createGroup } from "../../utils";
import { useLocale } from "../../LocaleContext";

export default function useGroupsState() {
  const { message } = App.useApp();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Create group modal
  const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false);
  const [createGroupLoading, setCreateGroupLoading] = useState(false);
  const [groupForm] = Form.useForm();
  const [groupImageData, setGroupImageData] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true);
      try {
        const data = await getGroups();
        setGroups(data);
      } catch (err) {
        message.error(err.message || t("failedToLoadGroups"));
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGroupClick = (group) => {
    navigate(`/groups/${group.id}`, { state: { group } });
  };

  const handleGroupSearch = async (value) => {
    const keyword = value.trim();
    setLoadingGroups(true);
    try {
      const data = keyword ? await searchGroups(keyword) : await getGroups();
      setGroups(data);
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
    createGroupModalVisible,
    setCreateGroupModalVisible,
    createGroupLoading,
    groupForm,
    groupImageData,
    setGroupImageData,
    handleCreateGroup,
  };
}
