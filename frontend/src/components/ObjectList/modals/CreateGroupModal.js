import { Form, Input, message, Modal, Upload } from "antd";
import { uploadImage } from "../../../utils";

export default function CreateGroupModal({
  visible,
  onOk,
  onCancel,
  confirmLoading,
  form,
  imageData,
  onImageChange,
}) {
  return (
    <Modal
      title="Create Group"
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
            beforeUpload={async (file) => {
              try {
                const url = await uploadImage(file);
                onImageChange(url);
              } catch (e) {
                message.error(e.message || "Upload failed");
              }
              return false;
            }}
          >
            <div style={{ width: 120 }}>
              <img
                src={
                  imageData ||
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
