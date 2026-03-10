import { Form, message, Modal } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  getBrands,
  searchBrands,
  getBrandObjectsByBrandId,
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
  searchBrandObjects,
} from "../../utils";

const normalizeList = (data) =>
  Array.isArray(data) ? data : data?.content != null ? data.content : [];

export default function useBrandObjectListState() {
  const [brands, setBrands] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const [brandDrawerOpen, setBrandDrawerOpen] = useState(false);
  const [groupDrawerOpen, setGroupDrawerOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedGroupUserObjects, setSelectedGroupUserObjects] = useState([]);
  const [loadingGroupUserObjects, setLoadingGroupUserObjects] = useState(false);
  const [brandObjectSearchKeyword, setBrandObjectSearchKeyword] = useState("");
  const [groupUserObjectSearchKeyword, setGroupUserObjectSearchKeyword] =
    useState("");

  const [brandObjects, setBrandObjects] = useState([]);
  const [loadingBrandObjects, setLoadingBrandObjects] = useState(false);

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
    setLoadingBrands(true);
    getBrands()
      .then((data) => setBrands(data))
      .catch((err) => {
        message.error(err.message || "Failed to load brands");
      })
      .finally(() => setLoadingBrands(false));
  }, []);

  useEffect(() => {
    setLoadingGroups(true);
    getGroups()
      .then((data) => setGroups(data))
      .catch((err) => {
        message.error(err.message || "Failed to load groups");
      })
      .finally(() => setLoadingGroups(false));
  }, []);

  useEffect(() => {
    if (!selectedGroup) {
      setSelectedGroupUserObjects([]);
      return;
    }
    setLoadingGroupUserObjects(true);
    getUserObjects(selectedGroup.id)
      .then((data) => setSelectedGroupUserObjects(normalizeList(data)))
      .catch((err) => {
        message.error(err.message || "Failed to load group models");
        setSelectedGroupUserObjects([]);
      })
      .finally(() => setLoadingGroupUserObjects(false));
  }, [selectedGroup]);

  const handleBrandClick = (brand) => {
    setSelectedBrand(brand);
    setBrandDrawerOpen(true);
    setLoadingBrandObjects(true);
    getBrandObjectsByBrandId(brand.id)
      .then((data) => setBrandObjects(data))
      .catch((err) => {
        message.error(err.message || "Failed to load models");
      })
      .finally(() => setLoadingBrandObjects(false));
  };

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

  const handleUserObjectClick = (userObject) => {
    setSelectedUserObject(userObject);
    setUserObjectDetailVisible(true);
    const brandObjectId =
      userObject.brandObjectId ?? userObject.brand_object_id;
    if (brandObjectId) {
      setLoadingUserObjectBrandDetail(true);
      getBrandObjectById(brandObjectId)
        .then((data) => setUserObjectBrandDetail(data))
        .catch((err) => {
          message.error(err.message || "Failed to load brand object detail");
        })
        .finally(() => setLoadingUserObjectBrandDetail(false));
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

  const handleCreateUserObject = () => {
    form
      .validateFields()
      .then((values) => {
        if (!selectedBrandObject) return;
        const payload = {
          brand_object_id: selectedBrandObject.id,
          name: values.name,
          image_url:
            customImageData || selectedBrandObject.image_url,
          purchase_date: values.purchaseDate
            ? values.purchaseDate.format("YYYY-MM-DD")
            : null,
          purchase_price:
            values.purchasePrice !== undefined ? values.purchasePrice : null,
          other_notes: values.otherNotes || null,
        };
        setCreateModalLoading(true);
        const groupId = values.groupId;
        createUserObject(groupId, payload)
          .then((created) => {
            message.success("Added to group successfully");
            if (selectedGroup && selectedGroup.id === groupId) {
              setSelectedGroupUserObjects((prev) => [...prev, created]);
            }
            setCreateModalVisible(false);
          })
          .catch((err) => {
            message.error(err.message || "Failed to add model to group");
          })
          .finally(() => setCreateModalLoading(false));
      })
      .catch(() => {});
  };

  const handleBrandSearch = (value) => {
    const keyword = value.trim();
    setLoadingBrands(true);
    const fetcher = keyword ? searchBrands(keyword) : getBrands();
    fetcher
      .then((data) => setBrands(data))
      .catch((err) => {
        message.error(err.message || "Failed to search brands");
      })
      .finally(() => setLoadingBrands(false));
  };

  const handleGroupSearch = (value) => {
    const keyword = value.trim();
    setLoadingGroups(true);
    const fetcher = keyword ? searchGroups(keyword) : getGroups();
    fetcher
      .then((data) => setGroups(data))
      .catch((err) => {
        message.error(err.message || "Failed to search groups");
      })
      .finally(() => setLoadingGroups(false));
  };

  const openEditGroupModal = () => {
    if (!selectedGroup) return;
    editGroupForm.setFieldsValue({ name: selectedGroup.name });
    setEditGroupImageData(null);
    setEditGroupModalVisible(true);
  };

  const handleUpdateGroup = () => {
    if (!selectedGroup) return;
    editGroupForm
      .validateFields()
      .then((values) => {
        setEditGroupLoading(true);
        const image_url =
          editGroupImageData ??
          selectedGroup.image_url;
        const payload = { name: values.name, image_url: image_url || null };
        updateGroup(selectedGroup.id, payload)
          .then((data) => {
            message.success("Group updated");
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
          })
          .catch((err) => {
            message.error(err.message || "Failed to update group");
          })
          .finally(() => setEditGroupLoading(false));
      })
      .catch(() => {});
  };

  const handleDeleteGroup = () => {
    if (!selectedGroup) return;
    const groupId = selectedGroup.id;
    const groupName = selectedGroup.name;
    Modal.confirm({
      title: "Delete group",
      content: `Are you sure you want to delete "${groupName}"? This cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () =>
        deleteGroup(groupId)
          .then(() => {
            setGroupDrawerOpen(false);
            setSelectedGroup(null);
            setGroups((prev) => prev.filter((g) => g.id !== groupId));
            message.success("Group deleted");
          })
          .catch((err) => {
            message.error(err.message || "Failed to delete group");
          }),
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
      purchasePrice:
        selectedUserObject.purchasePrice ?? selectedUserObject.purchase_price,
      purchaseDate: pd ? moment(pd) : null,
      otherNotes:
        selectedUserObject.otherNotes ?? selectedUserObject.other_notes ?? "",
    });
    setEditUserObjectImageData(null);
    setEditModelSearchResults(
      userObjectBrandDetail ? [userObjectBrandDetail] : []
    );
    setEditUserObjectModalVisible(true);
  };

  const handleUpdateUserObject = () => {
    if (!selectedUserObject || !selectedGroup) return;
    editUserObjectForm
      .validateFields()
      .then((values) => {
        setEditUserObjectLoading(true);
        const selectedBo =
          (values.brandObjectId != null &&
            values.brandObjectId !== "" &&
            editModelSearchResults.find(
              (o) => Number(o.id) === Number(values.brandObjectId)
            )) ||
          null;
        // Keep existing user object image when only changing brand association; use new image only if user picked one or object had none
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
          purchase_price:
            values.purchasePrice !== undefined ? values.purchasePrice : null,
          other_notes: values.otherNotes || null,
        };
        updateUserObject(
          selectedGroup.id,
          selectedUserObject.id,
          payload
        )
          .then((data) => {
            message.success("Model updated");
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
              prev.map((o) =>
                o.id === selectedUserObject.id ? updated : o
              )
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
            // Refresh brand detail shown in user object detail modal when brand_object_id changed
            const newBrandObjectId = updated.brandObjectId ?? updated.brand_object_id;
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
              getBrandObjectById(newBrandObjectId)
                .then((brandData) => setUserObjectBrandDetail(brandData))
                .catch(() => setUserObjectBrandDetail(null));
            }
            setEditUserObjectModalVisible(false);
          })
          .catch((err) => {
            message.error(err.message || "Failed to update model");
          })
          .finally(() => setEditUserObjectLoading(false));
      })
      .catch(() => {});
  };

  const handleDeleteUserObject = () => {
    if (!selectedUserObject || !selectedGroup) return;
    const groupId = selectedGroup.id;
    const userObjectId = selectedUserObject.id;
    const itemName = selectedUserObject.name ?? "—";
    Modal.confirm({
      title: "Delete model",
      content: `Are you sure you want to delete "${itemName}"? This cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () =>
        deleteUserObject(groupId, userObjectId)
          .then(() => {
            setUserObjectDetailVisible(false);
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
            message.success("Model deleted");
          })
          .catch((err) => {
            message.error(err.message || "Failed to delete model");
          }),
    });
  };

  const openAddUserObjectInGroupModal = () => {
    addUserObjectInGroupForm.resetFields();
    setAddUserObjectInGroupImageData(null);
    setAddModelSearchResults([]);
    setSelectedBrandObjectForAdd(null);
    setAddUserObjectInGroupModalVisible(true);
  };

  const handleAddUserObjectInGroup = () => {
    if (!selectedGroup) return;
    addUserObjectInGroupForm
      .validateFields()
      .then((values) => {
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
          purchase_price:
            values.purchasePrice !== undefined ? values.purchasePrice : null,
          other_notes: values.otherNotes || null,
        };
        setAddUserObjectInGroupLoading(true);
        createUserObject(selectedGroup.id, payload)
          .then((created) => {
            message.success("Model added");
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
          })
          .catch((err) => {
            message.error(err.message || "Failed to add model");
          })
          .finally(() => setAddUserObjectInGroupLoading(false));
      })
      .catch(() => {});
  };

  const setBrandObjectDetailFromUserObject = () => {
    setUserObjectDetailVisible(false);
    setBrandObjectDetail({
      ...userObjectBrandDetail,
      image_url: userObjectBrandDetail.image_url,
    });
    setBrandObjectDetailVisible(true);
  };

  const handleCreateGroup = () => {
    groupForm
      .validateFields()
      .then((values) => {
        setCreateGroupLoading(true);
        const payload = {
          name: values.name,
          image_url: groupImageData || null,
        };
        createGroup(payload)
          .then((created) => {
            message.success("Group created");
            setGroups((prev) => [...prev, created]);
            setCreateGroupModalVisible(false);
            setGroupImageData(null);
          })
          .catch((err) => {
            message.error(err.message || "Failed to create group");
          })
          .finally(() => setCreateGroupLoading(false));
      })
      .catch(() => {});
  };

  return {
    brands,
    setBrands,
    groups,
    setGroups,
    loadingBrands,
    loadingGroups,
    brandDrawerOpen,
    setBrandDrawerOpen,
    groupDrawerOpen,
    setGroupDrawerOpen,
    selectedBrand,
    selectedGroup,
    setSelectedGroup,
    selectedGroupUserObjects,
    setSelectedGroupUserObjects,
    loadingGroupUserObjects,
    brandObjectSearchKeyword,
    setBrandObjectSearchKeyword,
    groupUserObjectSearchKeyword,
    setGroupUserObjectSearchKeyword,
    brandObjects,
    loadingBrandObjects,
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
    handleBrandClick,
    handleGroupClick,
    handleBrandObjectClick,
    handleUserObjectClick,
    openCreateModal,
    handleCreateUserObject,
    handleBrandSearch,
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
    searchBrandObjects,
    message,
  };
}
