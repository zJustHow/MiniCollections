import { Form, Input, Modal, Upload } from "antd";

export default function EditGroupModal({
  visible,
  onOk,
  onCancel,
  confirmLoading,
  form,
  selectedGroup,
  imageData,
  onImageChange,
}) {
  return (
    <Modal
      title="Edit Group"
      open={visible}
      onOk={onOk}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form layout="vertical" form={form}>
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
              reader.onload = (e) => onImageChange(e.target.result);
              reader.readAsDataURL(file);
              return false;
            }}
          >
            <div style={{ width: 120 }}>
              <img
                src={
                  imageData ||
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
  );
}
