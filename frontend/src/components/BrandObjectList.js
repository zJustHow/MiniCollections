import {
  Button,
  Card,
  Drawer,
  List,
  message,
  Spin,
  Tabs,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Upload,
} from "antd";
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
} from "../utils";
import { PlusOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;
const { Search } = Input;

const cardCover = (imageUrl, name) => (
  <div style={{ position: "relative", paddingTop: "75%", overflow: "hidden" }}>
    <img
      src={imageUrl}
      alt={name}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        width: "100%",
        padding: "8px 12px",
        background:
          "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)",
        color: "#fff",
        fontWeight: 600,
      }}
    >
      {name}
    </div>
  </div>
);

const BrandObjectList = () => {
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
  const [groupUserObjectSearchKeyword, setGroupUserObjectSearchKeyword] = useState("");

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
  const [loadingBrandObjectDetail, setLoadingBrandObjectDetail] =
    useState(false);

  const [userObjectDetailVisible, setUserObjectDetailVisible] =
    useState(false);
  const [selectedUserObject, setSelectedUserObject] = useState(null);
  const [userObjectBrandDetail, setUserObjectBrandDetail] = useState(null);
  const [loadingUserObjectBrandDetail, setLoadingUserObjectBrandDetail] =
    useState(false);

  const [createGroupModalVisible, setCreateGroupModalVisible] =
    useState(false);
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
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.content != null ? data.content : []);
        setSelectedGroupUserObjects(list);
      })
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
      imageUrl: brandObject.imageUrl ?? brandObject.image_url,
    });
    setBrandObjectDetailVisible(true);
  };

  const handleUserObjectClick = (userObject) => {
    setSelectedUserObject(userObject);
    setUserObjectDetailVisible(true);

    const brandObjectId = userObject.brandObjectId ?? userObject.brand_object_id;
    if (brandObjectId) {
      setLoadingUserObjectBrandDetail(true);
      getBrandObjectById(brandObjectId)
        .then((data) => {
          setUserObjectBrandDetail(data);
        })
        .catch((err) => {
          message.error(err.message || "Failed to load brand object detail");
        })
        .finally(() => {
          setLoadingUserObjectBrandDetail(false);
        });
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
        if (!selectedBrandObject) {
          return;
        }
        const payload = {
          brand_object_id: selectedBrandObject.id,
          name: values.name,
          image_url:
            customImageData ||
            selectedBrandObject.imageUrl ||
            selectedBrandObject.image_url,
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
          .finally(() => {
            setCreateModalLoading(false);
          });
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

  const handleBrandObjectSearch = (value) => {
    setBrandObjectSearchKeyword(value);
  };

  const handleGroupUserObjectSearch = (value) => {
    setGroupUserObjectSearchKeyword(value);
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
        const imageUrl =
          editGroupImageData ??
          selectedGroup.imageUrl ??
          selectedGroup.image_url;
        const payload = {
          name: values.name,
          image_url: imageUrl || null,
        };
        updateGroup(selectedGroup.id, payload)
          .then((data) => {
            message.success("Group updated");
            const updated = {
              ...data,
              imageUrl: data.imageUrl ?? data.image_url,
              userObjects: selectedGroup.userObjects ?? data.userObjects ?? [],
            };
            setSelectedGroup(updated);
            setGroups((prev) =>
              prev.map((g) =>
                g.id === selectedGroup.id
                  ? { ...g, name: updated.name, imageUrl: updated.imageUrl }
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
        const selectedBo = (values.brandObjectId != null &&
          editModelSearchResults.find((o) => o.id === values.brandObjectId)) ||
          null;
        const imageUrl =
          editUserObjectImageData ??
          selectedBo?.imageUrl ??
          selectedBo?.image_url ??
          selectedUserObject.imageUrl ??
          selectedUserObject.image_url;
        const payload = {
          brand_object_id: values.brandObjectId ?? null,
          name: values.name,
          image_url: imageUrl || null,
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
              imageUrl: data.imageUrl ?? data.image_url,
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
            if (selectedGroup) {
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
        const imageUrl =
          addUserObjectInGroupImageData ??
          selectedBrandObjectForAdd?.imageUrl ??
          selectedBrandObjectForAdd?.image_url ??
          null;
        const payload = {
          brand_object_id: brandObjectId,
          name: values.name,
          image_url: imageUrl || null,
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
              imageUrl: created.imageUrl ?? created.image_url,
              purchasePrice: created.purchasePrice ?? created.purchase_price,
              purchaseDate: created.purchaseDate ?? created.purchase_date,
              otherNotes: created.otherNotes ?? created.other_notes,
              brandObjectId: created.brandObjectId ?? created.brand_object_id,
            };
            setSelectedGroupUserObjects((prev) => [...prev, item]);
            setSelectedGroup((prev) =>
              prev
                ? {
                    ...prev,
                    userObjects: [...(prev.userObjects || []), item],
                  }
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

  const renderBrands = () => (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <Search
          placeholder="Search brands"
          allowClear
          onSearch={handleBrandSearch}
          onChange={(e) => {
            if (e.target.value === "") {
              handleBrandSearch("");
            }
          }}
          style={{ width: 260 }}
        />
      </div>
      <List
        loading={loadingBrands}
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 3,
          lg: 4,
          xl: 4,
          xxl: 4,
        }}
        dataSource={brands}
        renderItem={(brand) => (
          <List.Item key={brand.id}>
            <Card
              hoverable
              style={{ borderRadius: 8, overflow: "hidden" }}
              cover={cardCover(brand.imageUrl, brand.name)}
              onClick={() => handleBrandClick(brand)}
              bodyStyle={{ padding: 0 }}
            />
          </List.Item>
        )}
      />
    </>
  );

  const renderGroups = () => (
    <div style={{ position: "relative", minHeight: 200 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <Search
          placeholder="Search groups"
          allowClear
          onSearch={handleGroupSearch}
          onChange={(e) => {
            if (e.target.value === "") {
              handleGroupSearch("");
            }
          }}
          style={{ width: 260 }}
        />
      </div>
      <List
        loading={loadingGroups}
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 3,
          lg: 4,
          xl: 4,
          xxl: 4,
        }}
        dataSource={groups}
        renderItem={(group) => (
          <List.Item key={group.id}>
            <Card
              hoverable
              style={{ borderRadius: 8, overflow: "hidden" }}
              cover={cardCover(group.imageUrl ?? group.image_url, group.name)}
              onClick={() => handleGroupClick(group)}
              bodyStyle={{ padding: 0 }}
            />
          </List.Item>
        )}
      />
      <button
        type="button"
        onClick={() => {
          groupForm.resetFields();
          setCreateGroupModalVisible(true);
        }}
        style={{
          position: "fixed",
          right: 40,
          bottom: 40,
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "none",
          backgroundColor: "#1890ff",
          color: "#fff",
          fontSize: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          zIndex: 1000,
        }}
      >
        +
      </button>
    </div>
  );

  return (
    <>
      <Tabs defaultActiveKey="brands">
        <TabPane tab="Brands" key="brands">
          {renderBrands()}
        </TabPane>
        <TabPane tab="My Groups" key="groups">
          {renderGroups()}
        </TabPane>
      </Tabs>

      <Drawer
        title={
          selectedBrand ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                width: "100%",
                paddingRight: 8,
              }}
            >
              <span>{selectedBrand.name} Models</span>
              <Search
                placeholder="Search models"
                allowClear
                onSearch={handleBrandObjectSearch}
                onChange={(e) => {
                  if (e.target.value === "") {
                    setBrandObjectSearchKeyword("");
                  }
                }}
                style={{ width: 220 }}
              />
            </div>
          ) : (
            ""
          )
        }
        open={brandDrawerOpen}
        onClose={() => {
          setBrandDrawerOpen(false);
          setBrandObjectSearchKeyword("");
        }}
        width={720}
      >
        {selectedBrand && (
          <Spin spinning={loadingBrandObjects}>
            <List
              grid={{
                gutter: 16,
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
                xl: 4,
                xxl: 4,
              }}
              dataSource={
                brandObjectSearchKeyword.trim()
                  ? brandObjects.filter((bo) =>
                      (bo.name || "")
                        .toLowerCase()
                        .includes(brandObjectSearchKeyword.trim().toLowerCase())
                    )
                  : brandObjects
              }
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <Card
                    hoverable
                    onClick={() => handleBrandObjectClick(item)}
                    cover={
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          height: 200,
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={item.imageUrl ?? item.image_url}
                          alt={item.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCreateModal(item);
                          }}
                          style={{
                            position: "absolute",
                            right: 12,
                            bottom: 12,
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            border: "none",
                            backgroundColor: "#1890ff",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            boxShadow:
                              "0 2px 4px rgba(0, 0, 0, 0.3)",
                          }}
                        >
                          <PlusOutlined />
                        </button>
                      </div>
                    }
                  >
                    {item.name}
                  </Card>
                </List.Item>
              )}
            />
          </Spin>
        )}
      </Drawer>

      <Drawer
        title={
          selectedGroup ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                width: "100%",
                paddingRight: 8,
              }}
            >
              <span>{selectedGroup.name} Models</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Button size="small" onClick={openEditGroupModal}>
                  Edit
                </Button>
                <Button size="small" danger onClick={handleDeleteGroup}>
                  Delete
                </Button>
                <Search
                  placeholder="Search models"
                  allowClear
                  onSearch={handleGroupUserObjectSearch}
                  onChange={(e) => {
                    if (e.target.value === "") {
                      setGroupUserObjectSearchKeyword("");
                    }
                  }}
                  style={{ width: 200 }}
                />
              </div>
            </div>
          ) : (
            ""
          )
        }
        open={groupDrawerOpen}
        onClose={() => {
          setGroupDrawerOpen(false);
          setGroupUserObjectSearchKeyword("");
        }}
        width={720}
      >
        {selectedGroup && (
          <div style={{ position: "relative", minHeight: 200 }}>
            <List
              loading={loadingGroupUserObjects}
              grid={{
                gutter: 16,
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
                xl: 4,
                xxl: 4,
              }}
              dataSource={
                groupUserObjectSearchKeyword.trim()
                  ? selectedGroupUserObjects.filter((item) =>
                      (item.name ?? "")
                        .toLowerCase()
                        .includes(
                          groupUserObjectSearchKeyword.trim().toLowerCase()
                        )
                    )
                  : selectedGroupUserObjects
              }
              locale={{ emptyText: "No models in this group yet" }}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <Card
                    hoverable
                    cover={
                      <img
                        src={item.imageUrl ?? item.image_url}
                        alt={item.name ?? ""}
                        style={{
                          width: "100%",
                          height: 200,
                          objectFit: "cover",
                        }}
                      />
                    }
                    onClick={() => handleUserObjectClick(item)}
                  >
                    {item.name ?? "—"}
                  </Card>
                </List.Item>
              )}
            />
            <button
              type="button"
              onClick={openAddUserObjectInGroupModal}
              style={{
                position: "fixed",
                right: 40,
                bottom: 40,
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "none",
                backgroundColor: "#1890ff",
                color: "#fff",
                fontSize: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                zIndex: 1100,
              }}
            >
              <PlusOutlined />
            </button>
          </div>
        )}
      </Drawer>

      <Modal
        title="Add Model"
        open={addUserObjectInGroupModalVisible}
        onOk={handleAddUserObjectInGroup}
        confirmLoading={addUserObjectInGroupLoading}
        onCancel={() => setAddUserObjectInGroupModalVisible(false)}
        destroyOnClose
      >
        <Form layout="vertical" form={addUserObjectInGroupForm}>
          <Form.Item label="Model" name="brandObjectId">
            <Select
              placeholder="Search by keyword (optional)"
              allowClear
              showSearch
              loading={addModelSearchLoading}
              filterOption={false}
              onSearch={(value) => {
                const keyword = (value || "").trim();
                if (keyword === "") {
                  setAddModelSearchResults([]);
                  return;
                }
                setAddModelSearchLoading(true);
                searchBrandObjects(keyword)
                  .then((data) => {
                    const list = Array.isArray(data) ? data : [];
                    setAddModelSearchResults(list);
                  })
                  .catch((err) => {
                    message.error(err.message || "Search failed");
                    setAddModelSearchResults([]);
                  })
                  .finally(() => setAddModelSearchLoading(false));
              }}
              onChange={(value) => {
                if (value == null) {
                  setSelectedBrandObjectForAdd(null);
                  return;
                }
                const bo = addModelSearchResults.find((o) => o.id === value);
                setSelectedBrandObjectForAdd(bo ?? null);
                if (bo) {
                  addUserObjectInGroupForm.setFieldsValue({
                    name: bo.name ?? "",
                  });
                }
              }}
            >
              {addModelSearchResults.map((bo) => (
                <Select.Option key={bo.id} value={bo.id}>
                  {bo.name ?? ""}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter a name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Purchase Price" name="purchasePrice">
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              step={0.01}
              stringMode
            />
          </Form.Item>
          <Form.Item label="Purchase Date" name="purchaseDate">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Other Note" name="otherNotes">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Image">
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={(file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  setAddUserObjectInGroupImageData(e.target.result);
                };
                reader.readAsDataURL(file);
                return false;
              }}
            >
              <div style={{ width: 120 }}>
                <img
                  src={
                    addUserObjectInGroupImageData ||
                    "https://via.placeholder.com/120x80?text=Image"
                  }
                  alt="preview"
                  style={{
                    width: "100%",
                    maxHeight: 120,
                    objectFit: "contain",
                    display: "block",
                    marginBottom: 8,
                  }}
                />
                <div style={{ fontSize: 12 }}>Select image</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add to My Group"
        open={createModalVisible}
        onOk={handleCreateUserObject}
        confirmLoading={createModalLoading}
        onCancel={() => setCreateModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter a name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Image">
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={(file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  setCustomImageData(e.target.result);
                };
                reader.readAsDataURL(file);
                return false; // prevent auto upload
              }}
            >
              <div style={{ width: 120 }}>
                <img
                  src={
                    customImageData ||
                    selectedBrandObject?.imageUrl ||
                    selectedBrandObject?.image_url
                  }
                  alt="preview"
                  style={{
                    width: "100%",
                    maxHeight: 120,
                    objectFit: "contain",
                    display: "block",
                    marginBottom: 8,
                  }}
                />
                <div style={{ fontSize: 12 }}>Select image</div>
              </div>
            </Upload>
          </Form.Item>
          <Form.Item label="Purchase Price" name="purchasePrice">
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              step={0.01}
              stringMode
            />
          </Form.Item>
          <Form.Item label="Purchase Date" name="purchaseDate">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Other Note" name="otherNotes">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            label="Group"
            name="groupId"
            rules={[{ required: true, message: "Please select a group" }]}
          >
            <Select placeholder="Select a group">
              {groups.map((g) => (
                <Select.Option key={g.id} value={g.id}>
                  {g.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Create Group"
        open={createGroupModalVisible}
        onOk={() => {
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
                .finally(() => {
                  setCreateGroupLoading(false);
                });
            })
            .catch(() => {});
        }}
        confirmLoading={createGroupLoading}
        onCancel={() => setCreateGroupModalVisible(false)}
        destroyOnClose
      >
        <Form layout="vertical" form={groupForm}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter group name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Image">
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={(file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  setGroupImageData(e.target.result);
                };
                reader.readAsDataURL(file);
                return false;
              }}
            >
              <div style={{ width: 120 }}>
                <img
                  src={groupImageData || "https://via.placeholder.com/120x80?text=Group"}
                  alt="group-preview"
                  style={{
                    width: "100%",
                    maxHeight: 120,
                    objectFit: "contain",
                    display: "block",
                    marginBottom: 8,
                  }}
                />
                <div style={{ fontSize: 12 }}>Select image</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Group"
        open={editGroupModalVisible}
        onOk={handleUpdateGroup}
        confirmLoading={editGroupLoading}
        onCancel={() => setEditGroupModalVisible(false)}
        destroyOnClose
      >
        <Form layout="vertical" form={editGroupForm}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter group name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Image">
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={(file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  setEditGroupImageData(e.target.result);
                };
                reader.readAsDataURL(file);
                return false;
              }}
            >
              <div style={{ width: 120 }}>
                <img
                  src={
                    editGroupImageData ||
                    selectedGroup?.imageUrl ||
                    selectedGroup?.image_url ||
                    "https://via.placeholder.com/120x80?text=Group"
                  }
                  alt="group-preview"
                  style={{
                    width: "100%",
                    maxHeight: 120,
                    objectFit: "contain",
                    display: "block",
                    marginBottom: 8,
                  }}
                />
                <div style={{ fontSize: 12 }}>Select image</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          brandObjectDetail ? `Brand Object: ${brandObjectDetail.name}` : ""
        }
        open={brandObjectDetailVisible}
        onCancel={() => setBrandObjectDetailVisible(false)}
        footer={null}
        width={600}
      >
        <Spin spinning={loadingBrandObjectDetail}>
          {brandObjectDetail && (
            <>
              <img
                src={brandObjectDetail.imageUrl ?? brandObjectDetail.image_url}
                alt={brandObjectDetail.name}
                style={{
                  width: "100%",
                  maxHeight: 320,
                  objectFit: "contain",
                  marginBottom: 16,
                }}
              />
              <p>
                <strong>Name: </strong>
                {brandObjectDetail.name ?? "—"}
              </p>
              <p>
                <strong>Release Price: </strong>
                {brandObjectDetail.releasePrice != null
                  ? brandObjectDetail.releasePrice
                  : "—"}
              </p>
              <p>
                <strong>Release Date: </strong>
                {brandObjectDetail.releaseDate ?? "—"}
              </p>
            </>
          )}
        </Spin>
      </Modal>

      <Modal
        title={
          selectedUserObject ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                width: "100%",
                paddingRight: 48,
              }}
            >
              <span>{selectedUserObject.name ?? "—"}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <Button size="small" onClick={openEditUserObjectModal}>
                  Edit
                </Button>
                <Button size="small" danger onClick={handleDeleteUserObject}>
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            ""
          )
        }
        open={userObjectDetailVisible}
        onCancel={() => setUserObjectDetailVisible(false)}
        footer={null}
        width={600}
      >
        {selectedUserObject && (
          <>
            <img
              src={selectedUserObject.imageUrl ?? selectedUserObject.image_url}
              alt={selectedUserObject.name ?? ""}
              style={{
                width: "100%",
                maxHeight: 320,
                objectFit: "contain",
                marginBottom: 16,
              }}
            />
            <p>
              <strong>Name: </strong>
              {selectedUserObject.name ?? "—"}
            </p>
            <p>
              <strong>Purchase Price: </strong>
              {(selectedUserObject.purchasePrice ?? selectedUserObject.purchase_price) != null
                ? (selectedUserObject.purchasePrice ?? selectedUserObject.purchase_price)
                : "—"}
            </p>
            <p>
              <strong>Purchase Date: </strong>
              {selectedUserObject.purchaseDate ?? selectedUserObject.purchase_date ?? "—"}
            </p>
            <p>
              <strong>Other Note: </strong>
              {selectedUserObject.otherNotes ?? selectedUserObject.other_notes ?? "—"}
            </p>
            <div style={{ marginTop: 16 }}>
              <strong>Brand Object:</strong>
              <Spin spinning={loadingUserObjectBrandDetail}>
                {userObjectBrandDetail ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: 8,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setUserObjectDetailVisible(false);
                      setBrandObjectDetail({
                        ...userObjectBrandDetail,
                        imageUrl:
                          userObjectBrandDetail.imageUrl ??
                          userObjectBrandDetail.image_url,
                      });
                      setBrandObjectDetailVisible(true);
                    }}
                  >
                    <img
                      src={
                        userObjectBrandDetail.imageUrl ??
                        userObjectBrandDetail.image_url
                      }
                      alt={userObjectBrandDetail.name}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 4,
                        marginRight: 12,
                      }}
                    />
                    <span>{userObjectBrandDetail.name}</span>
                  </div>
                ) : (
                  <p style={{ marginTop: 8 }}>
                    No related brand object found.
                  </p>
                )}
              </Spin>
            </div>
          </>
        )}
      </Modal>

      <Modal
        title="Edit Model"
        open={editUserObjectModalVisible}
        onOk={handleUpdateUserObject}
        confirmLoading={editUserObjectLoading}
        onCancel={() => setEditUserObjectModalVisible(false)}
        destroyOnClose
      >
        <Form layout="vertical" form={editUserObjectForm}>
          <Form.Item label="Model" name="brandObjectId">
            <Select
              placeholder="Search by keyword (optional)"
              allowClear
              showSearch
              loading={editModelSearchLoading}
              filterOption={false}
              onSearch={(value) => {
                const keyword = (value || "").trim();
                if (keyword === "") {
                  setEditModelSearchResults(
                    userObjectBrandDetail ? [userObjectBrandDetail] : []
                  );
                  return;
                }
                setEditModelSearchLoading(true);
                searchBrandObjects(keyword)
                  .then((data) => {
                    const list = Array.isArray(data) ? data : [];
                    setEditModelSearchResults(list);
                  })
                  .catch((err) => {
                    message.error(err.message || "Search failed");
                    setEditModelSearchResults([]);
                  })
                  .finally(() => setEditModelSearchLoading(false));
              }}
              onChange={() => {}}
            >
              {editModelSearchResults.map((bo) => (
                <Select.Option key={bo.id} value={bo.id}>
                  {bo.name ?? ""}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter a name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Purchase Price" name="purchasePrice">
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              step={0.01}
              stringMode
            />
          </Form.Item>
          <Form.Item label="Purchase Date" name="purchaseDate">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Other Note" name="otherNotes">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Image">
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={(file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  setEditUserObjectImageData(e.target.result);
                };
                reader.readAsDataURL(file);
                return false;
              }}
            >
              <div style={{ width: 120 }}>
                <img
                  src={
                    editUserObjectImageData ||
                    selectedUserObject?.imageUrl ||
                    selectedUserObject?.image_url ||
                    "https://via.placeholder.com/120x80?text=Image"
                  }
                  alt="preview"
                  style={{
                    width: "100%",
                    maxHeight: 120,
                    objectFit: "contain",
                    display: "block",
                    marginBottom: 8,
                  }}
                />
                <div style={{ fontSize: 12 }}>Select image</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default BrandObjectList;

