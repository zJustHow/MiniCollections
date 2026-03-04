import {
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
} from "antd";
import { useEffect, useState } from "react";
import {
  getBrands,
  getBrandObjectsByBrandId,
  getGroups,
  createUserObject,
  getBrandObjectById,
} from "../utils";
import { PlusOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;

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

  const [brandObjects, setBrandObjects] = useState([]);
  const [loadingBrandObjects, setLoadingBrandObjects] = useState(false);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createModalLoading, setCreateModalLoading] = useState(false);
  const [selectedBrandObject, setSelectedBrandObject] = useState(null);
  const [form] = Form.useForm();

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
          image_url: selectedBrandObject.imageUrl ?? selectedBrandObject.image_url,
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
            // update groups state so UI reflects new object
            setGroups((prev) =>
              prev.map((g) =>
                g.id === groupId
                  ? {
                      ...g,
                      userObjects: [...(g.userObjects || []), created],
                    }
                  : g
              )
            );
            if (selectedGroup && selectedGroup.id === groupId) {
              setSelectedGroup((prev) =>
                prev
                  ? {
                      ...prev,
                      userObjects: [...(prev.userObjects || []), created],
                    }
                  : prev
              );
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

  const renderBrands = () => (
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
  );

  const renderGroups = () => (
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
            cover={cardCover(group.imageUrl, group.name)}
            onClick={() => handleGroupClick(group)}
            bodyStyle={{ padding: 0 }}
          />
        </List.Item>
      )}
    />
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
        title={selectedBrand ? `${selectedBrand.name} Models` : ""}
        open={brandDrawerOpen}
        onClose={() => setBrandDrawerOpen(false)}
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
              dataSource={brandObjects}
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
        title={selectedGroup ? `${selectedGroup.name} Models` : ""}
        open={groupDrawerOpen}
        onClose={() => setGroupDrawerOpen(false)}
        width={720}
      >
        {selectedGroup && (
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
            dataSource={selectedGroup.userObjects || []}
            locale={{ emptyText: "No models in this group yet" }}
            renderItem={(item) => (
              <List.Item key={item.id}>
                <Card
                  hoverable
                  cover={
                    <img
                      src={item.imageUrl ?? item.image_url}
                      alt={item.name ?? ""}
                      style={{ width: "100%", height: 200, objectFit: "cover" }}
                    />
                  }
                  onClick={() => handleUserObjectClick(item)}
                >
                  {item.name ?? "—"}
                </Card>
              </List.Item>
            )}
          />
        )}
      </Drawer>

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
        title={selectedUserObject ? (selectedUserObject.name ?? "—") : ""}
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
    </>
  );
};

export default BrandObjectList;

