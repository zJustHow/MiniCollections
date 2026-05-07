import { useEffect, useState } from "react";
import {
  App, Form } from "antd";
import dayjs from "dayjs";
import {
  getGroups,
  searchGroups,
  getUserObjects,
  createUserObject,
  getBrandObjectById,
  createGroup,
  updateGroup,
  deleteGroup,
  updateUserObject,
  deleteUserObject,
  purchasePriceFromFormValue,
  displayPurchasePriceFromObject,
} from "../../utils";
import { Z_INDEX } from "./constants";
import { useLocale } from "../../LocaleContext";

const normalizeList = (data) =>
  Array.isArray(data) ? data : data?.content != null ? data.content : [];

export default function useGroupsState() {
  const { message, modal } = App.useApp();
  const { t } = useLocale();
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const [groupDrawerOpen, setGroupDrawerOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedGroupUserObjects, setSelectedGroupUserObjects] = useState([]);
  const [loadingGroupUserObjects, setLoadingGroupUserObjects] = useState(false);
  const [groupUserObjectSearchKeyword, setGroupUserObjectSearchKeyword] =
    useState("");

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createModalLoading, setCreateModalLoading] = useState(false);
  const [selectedBrandObject, setSelectedBrandObject] = useState(null);
  const [form] = Form.useForm();
  const [customImageData, setCustomImageData] = useState(null);

  const [brandObjectDetailVisible, setBrandObjectDetailVisible] =
    useState(false);
  const [brandObjectDetail, setBrandObjectDetail] = useState(null);

  const [userObjectDetailVisible, setUserObjectDetailVisible] = useState(false);
  const [selectedUserObject, setSelectedUserObject] = useState(null);
  const [userObjectBrandDetail, setUserObjectBrandDetail] = useState(null);
  const [loadingUserObjectBrandDetail, setLoadingUserObjectBrandDetail] =
    useState(false);

  const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false);
  const [createGroupLoading, setCreateGroupLoading] = useState(false);
  const [groupForm] = Form.useForm();
  const [groupImageData, setGroupImageData] = useState(null);
  const [editGroupModalVisible, setEditGroupModalVisible] = useState(false);
  const [editGroupLoading, setEditGroupLoading] = useState(false);
  const [editGroupForm] = Form.useForm();
  const [editGroupImageData, setEditGroupImageData] = useState(null);
  const [editUserObjectModalVisible, setEditUserObjectModalVisible] =
    useState(false);
  const [editUserObjectLoading, setEditUserObjectLoading] = useState(false);
  const [editUserObjectForm] = Form.useForm();
  const [editUserObjectImageData, setEditUserObjectImageData] = useState(null);
  const [editModelSearchResults, setEditModelSearchResults] = useState([]);
  const [editModelSearchLoading, setEditModelSearchLoading] = useState(false);
  const [addUserObjectInGroupModalVisible, setAddUserObjectInGroupModalVisible] =
    useState(false);
  const [addUserObjectInGroupLoading, setAddUserObjectInGroupLoading] =
    useState(false);
  const [addUserObjectInGroupForm] = Form.useForm();
  const [addUserObjectInGroupImageData, setAddUserObjectInGroupImageData] =
    useState(null);
  const [addModelSearchResults, setAddModelSearchResults] = useState([]);
  const [addModelSearchLoading, setAddModelSearchLoading] = useState(false);
  const [selectedBrandObjectForAdd, setSelectedBrandObjectForAdd] =
    useState(null);

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

  useEffect(() => {
    const fetchGroupUserObjects = async () => {
      if (!selectedGroup) {
        setSelectedGroupUserObjects([]);
        return;
      }
      setLoadingGroupUserObjects(true);
      try {
        const data = await getUserObjects(selectedGroup.id);
        setSelectedGroupUserObjects(normalizeList(data));
      } catch (err) {
        message.error(err.message || t("failedToLoadGroupModels"));
        setSelectedGroupUserObjects([]);
      } finally {
        setLoadingGroupUserObjects(false);
      }
    };
    fetchGroupUserObjects();
  }, [selectedGroup]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setGroupDrawerOpen(true);
  };

  const handleBrandObjectClick = (brandObject) => {
    setBrandObjectDetail({
      ...brandObject,
      image_url: brandObject.image_url,
    });
    setBrandObjectDetailVisible(true);
  };

  const handleUserObjectClick = async (userObject) => {
    setSelectedUserObject(userObject);
    const brandObjectId =
      userObject.brandObjectId ?? userObject.brand_object_id;
    if (brandObjectId) {
      setLoadingUserObjectBrandDetail(true);
      try {
        const data = await getBrandObjectById(brandObjectId);
        setUserObjectBrandDetail(data);
      } catch (err) {
        message.error(err.message || t("failedToLoadBrandObjectDetail"));
      } finally {
        setLoadingUserObjectBrandDetail(false);
      }
    } else {
      setUserObjectBrandDetail(null);
    }
  };

  const openCreateModal = (brandObject) => {
    setSelectedBrandObject(brandObject);
    setCustomImageData(null);
    form.setFieldsValue({
      name: brandObject.name,
      purchasePrice: undefined,
      purchaseDate: null,
      otherNotes: "",
      groupId: undefined,
    });
    setCreateModalVisible(true);
  };

  const handleCreateUserObject = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedBrandObject) return;
      const payload = {
        brand_object_id: selectedBrandObject.id,
        name: values.name,
        image_url: customImageData || selectedBrandObject.image_url,
        purchase_date: values.purchaseDate
          ? values.purchaseDate.format("YYYY-MM-DD")
          : null,
        ...purchasePriceFromFormValue(values.purchasePrice),
        other_notes: values.otherNotes || null,
      };
      setCreateModalLoading(true);
      const groupId = values.groupId;
      try {
        const created = await createUserObject(groupId, payload);
        message.success(t("addedToGroupSuccessfully"));
        if (selectedGroup && selectedGroup.id === groupId) {
          setSelectedGroupUserObjects((prev) => [...prev, created]);
        }
        setCreateModalVisible(false);
      } catch (err) {
        message.error(err.message || t("failedToAddModelToGroup"));
      } finally {
        setCreateModalLoading(false);
      }
    } catch {
      // validation failed, do nothing
    }
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

  const openEditGroupModal = () => {
    if (!selectedGroup) return;
    editGroupForm.setFieldsValue({ name: selectedGroup.name });
    setEditGroupImageData(null);
    setEditGroupModalVisible(true);
  };

  const handleUpdateGroup = async () => {
    if (!selectedGroup) return;
    try {
      const values = await editGroupForm.validateFields();
      setEditGroupLoading(true);
      const image_url = editGroupImageData ?? selectedGroup.image_url;
      const payload = { name: values.name, image_url: image_url || null };
      try {
        const data = await updateGroup(selectedGroup.id, payload);
        message.success(t("groupUpdated"));
        const updated = {
          ...data,
          image_url: data.image_url,
          userObjects: selectedGroup.userObjects ?? data.userObjects ?? [],
        };
        setSelectedGroup(updated);
        setGroups((prev) =>
          prev.map((g) =>
            g.id === selectedGroup.id
              ? { ...g, name: updated.name, image_url: updated.image_url }
              : g
          )
        );
        setEditGroupModalVisible(false);
      } catch (err) {
        message.error(err.message || t("failedToUpdateGroup"));
      } finally {
        setEditGroupLoading(false);
      }
    } catch {
      // validation failed, do nothing
    }
  };

  const handleDeleteGroup = () => {
    if (!selectedGroup) return;
    const groupId = selectedGroup.id;
    const groupName = selectedGroup.name;
    modal.confirm({
      title: t("deleteGroupTitle"),
      content: t("deleteGroupContent", { name: groupName }),
      okText: t("delete"),
      okType: "danger",
      cancelText: t("cancel"),
      zIndex: Z_INDEX.MODAL_CONFIRM_DELETE_GROUP,
      onOk: async () => {
        try {
          await deleteGroup(groupId);
          setGroupDrawerOpen(false);
          setSelectedGroup(null);
          setGroups((prev) => prev.filter((g) => g.id !== groupId));
          message.success(t("groupDeleted"));
        } catch (err) {
          message.error(err.message || t("failedToDeleteGroup"));
        }
      },
    });
  };

  const openEditUserObjectModal = () => {
    if (!selectedUserObject) return;
    const pd =
      selectedUserObject.purchaseDate ?? selectedUserObject.purchase_date;
    const brandObjectId =
      selectedUserObject.brandObjectId ?? selectedUserObject.brand_object_id;
    editUserObjectForm.setFieldsValue({
      brandObjectId: brandObjectId ?? undefined,
      name: selectedUserObject.name ?? "",
      purchasePrice: displayPurchasePriceFromObject(selectedUserObject),
      purchaseDate: pd ? dayjs(pd) : null,
      otherNotes:
        selectedUserObject.otherNotes ?? selectedUserObject.other_notes ?? "",
    });
    setEditUserObjectImageData(null);
    setEditModelSearchResults(
      userObjectBrandDetail ? [userObjectBrandDetail] : []
    );
    setEditUserObjectModalVisible(true);
  };

  const handleUpdateUserObject = async () => {
    if (!selectedUserObject || !selectedGroup) return;
    try {
      const values = await editUserObjectForm.validateFields();
      setEditUserObjectLoading(true);
      const selectedBo =
        (values.brandObjectId != null &&
          values.brandObjectId !== "" &&
          editModelSearchResults.find(
            (o) => Number(o.id) === Number(values.brandObjectId)
          )) ||
        null;
      const image_url =
        editUserObjectImageData ??
        selectedUserObject.image_url ??
        selectedBo?.image_url;
      const payload = {
        brand_object_id:
          values.brandObjectId != null && values.brandObjectId !== ""
            ? Number(values.brandObjectId)
            : null,
        name: values.name,
        image_url: image_url || null,
        purchase_date: values.purchaseDate
          ? values.purchaseDate.format("YYYY-MM-DD")
          : null,
        ...purchasePriceFromFormValue(values.purchasePrice),
        other_notes: values.otherNotes || null,
      };
      try {
        const data = await updateUserObject(
          selectedGroup.id,
          selectedUserObject.id,
          payload
        );
        message.success(t("modelUpdated"));
        const updated = {
          ...data,
          name: data.name,
          image_url: data.image_url,
          purchasePrice: data.purchasePrice ?? data.purchase_price,
          purchaseDate: data.purchaseDate ?? data.purchase_date,
          otherNotes: data.otherNotes ?? data.other_notes,
          brandObjectId: data.brandObjectId ?? data.brand_object_id,
        };
        setSelectedUserObject(updated);
        setSelectedGroupUserObjects((prev) =>
          prev.map((o) => (o.id === selectedUserObject.id ? updated : o))
        );
        setSelectedGroup((prev) =>
          prev
            ? {
                ...prev,
                userObjects: (prev.userObjects || []).map((o) =>
                  o.id === selectedUserObject.id ? updated : o
                ),
              }
            : prev
        );
        const newBrandObjectId =
          updated.brandObjectId ?? updated.brand_object_id;
        if (newBrandObjectId == null) {
          setUserObjectBrandDetail(null);
        } else if (
          selectedBo &&
          Number(selectedBo.id) === Number(newBrandObjectId)
        ) {
          setUserObjectBrandDetail({
            ...selectedBo,
            image_url: selectedBo.image_url,
          });
        } else {
          try {
            const brandData = await getBrandObjectById(newBrandObjectId);
            setUserObjectBrandDetail(brandData);
          } catch {
            setUserObjectBrandDetail(null);
          }
        }
        setEditUserObjectModalVisible(false);
      } catch (err) {
        message.error(err.message || t("failedToUpdateModel"));
      } finally {
        setEditUserObjectLoading(false);
      }
    } catch {
      // validation failed, do nothing
    }
  };

  const handleDeleteUserObject = () => {
    if (!selectedUserObject || !selectedGroup) return;
    const groupId = selectedGroup.id;
    const userObjectId = selectedUserObject.id;
    const itemName = selectedUserObject.name ?? "—";
    modal.confirm({
      title: t("deleteModelTitle"),
      content: t("deleteModelContent", { name: itemName }),
      okText: t("delete"),
      okType: "danger",
      cancelText: t("cancel"),
      zIndex: Z_INDEX.MODAL_CONFIRM_DELETE_USER_OBJECT,
      onOk: async () => {
        try {
          await deleteUserObject(groupId, userObjectId);
          setSelectedUserObject(null);
          setSelectedGroupUserObjects((prev) =>
            prev.filter((o) => o.id !== userObjectId)
          );
          setSelectedGroup((prev) =>
            prev
              ? {
                  ...prev,
                  userObjects: (prev.userObjects || []).filter(
                    (o) => (o.id ?? o.id) !== userObjectId
                  ),
                }
              : prev
          );
          setGroups((prev) =>
            prev.map((g) =>
              g.id === groupId
                ? {
                    ...g,
                    userObjects: (g.userObjects || []).filter(
                      (o) => o.id !== userObjectId
                    ),
                  }
                : g
            )
          );
          message.success(t("modelDeleted"));
        } catch (err) {
          message.error(err.message || t("failedToDeleteModel"));
        }
      },
    });
  };

  const openAddUserObjectInGroupModal = () => {
    addUserObjectInGroupForm.resetFields();
    setAddUserObjectInGroupImageData(null);
    setAddModelSearchResults([]);
    setSelectedBrandObjectForAdd(null);
    setAddUserObjectInGroupModalVisible(true);
  };

  const handleAddUserObjectInGroup = async () => {
    if (!selectedGroup) return;
    try {
      const values = await addUserObjectInGroupForm.validateFields();
      const brandObjectId = values.brandObjectId ?? null;
      const image_url =
        addUserObjectInGroupImageData ??
        selectedBrandObjectForAdd?.image_url ??
        null;
      const payload = {
        brand_object_id: brandObjectId,
        name: values.name,
        image_url: image_url || null,
        purchase_date: values.purchaseDate
          ? values.purchaseDate.format("YYYY-MM-DD")
          : null,
        ...purchasePriceFromFormValue(values.purchasePrice),
        other_notes: values.otherNotes || null,
      };
      setAddUserObjectInGroupLoading(true);
      try {
        const created = await createUserObject(selectedGroup.id, payload);
        message.success(t("modelAdded"));
        const item = {
          ...created,
          name: created.name,
          image_url: created.image_url,
          purchasePrice: created.purchasePrice ?? created.purchase_price,
          purchaseDate: created.purchaseDate ?? created.purchase_date,
          otherNotes: created.otherNotes ?? created.other_notes,
          brandObjectId: created.brandObjectId ?? created.brand_object_id,
        };
        setSelectedGroupUserObjects((prev) => [...prev, item]);
        setSelectedGroup((prev) =>
          prev
            ? { ...prev, userObjects: [...(prev.userObjects || []), item] }
            : prev
        );
        setGroups((prev) =>
          prev.map((g) =>
            g.id === selectedGroup.id
              ? {
                  ...g,
                  userObjects: [...(g.userObjects || []), item],
                }
              : g
          )
        );
        setAddUserObjectInGroupModalVisible(false);
      } catch (err) {
        message.error(err.message || t("failedToAddModel"));
      } finally {
        setAddUserObjectInGroupLoading(false);
      }
    } catch {
      // validation failed, do nothing
    }
  };

  const setBrandObjectDetailFromUserObject = () => {
    setBrandObjectDetail({
      ...userObjectBrandDetail,
      image_url: userObjectBrandDetail.image_url,
    });
    setBrandObjectDetailVisible(true);
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
      // validation failed, do nothing
    }
  };

  return {
    groups,
    setGroups,
    loadingGroups,
    groupDrawerOpen,
    setGroupDrawerOpen,
    selectedGroup,
    setSelectedGroup,
    selectedGroupUserObjects,
    setSelectedGroupUserObjects,
    loadingGroupUserObjects,
    groupUserObjectSearchKeyword,
    setGroupUserObjectSearchKeyword,
    createModalVisible,
    setCreateModalVisible,
    createModalLoading,
    selectedBrandObject,
    form,
    customImageData,
    setCustomImageData,
    brandObjectDetailVisible,
    setBrandObjectDetailVisible,
    brandObjectDetail,
    setBrandObjectDetail,
    userObjectDetailVisible,
    setUserObjectDetailVisible,
    selectedUserObject,
    setSelectedUserObject,
    userObjectBrandDetail,
    loadingUserObjectBrandDetail,
    createGroupModalVisible,
    setCreateGroupModalVisible,
    createGroupLoading,
    groupForm,
    groupImageData,
    setGroupImageData,
    editGroupModalVisible,
    setEditGroupModalVisible,
    editGroupLoading,
    editGroupForm,
    editGroupImageData,
    setEditGroupImageData,
    editUserObjectModalVisible,
    setEditUserObjectModalVisible,
    editUserObjectLoading,
    editUserObjectForm,
    editUserObjectImageData,
    setEditUserObjectImageData,
    editModelSearchResults,
    setEditModelSearchResults,
    editModelSearchLoading,
    setEditModelSearchLoading,
    addUserObjectInGroupModalVisible,
    setAddUserObjectInGroupModalVisible,
    addUserObjectInGroupLoading,
    addUserObjectInGroupForm,
    addUserObjectInGroupImageData,
    setAddUserObjectInGroupImageData,
    addModelSearchResults,
    setAddModelSearchResults,
    addModelSearchLoading,
    setAddModelSearchLoading,
    selectedBrandObjectForAdd,
    setSelectedBrandObjectForAdd,
    handleGroupClick,
    handleBrandObjectClick,
    handleUserObjectClick,
    openCreateModal,
    handleCreateUserObject,
    handleGroupSearch,
    openEditGroupModal,
    handleUpdateGroup,
    handleDeleteGroup,
    openEditUserObjectModal,
    handleUpdateUserObject,
    handleDeleteUserObject,
    openAddUserObjectInGroupModal,
    handleAddUserObjectInGroup,
    setBrandObjectDetailFromUserObject,
    handleCreateGroup,
  };
}
