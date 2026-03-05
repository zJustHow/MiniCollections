import { DatePicker, Form, Input, InputNumber, Modal, Select, Upload } from "antd";

export default function AddToGroupModal({
  visible,
  onOk,
  onCancel,
  confirmLoading,
  form,
  groups,
  selectedBrandObject,
  customImageData,
  onImageChange,
}) {
  return (
    <Modal
      title="Add to My Group"
      open={visible}
      onOk={onOk}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
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
              reader.onload = (e) => onImageChange(e.target.result);
              reader.readAsDataURL(file);
              return false;
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
  );
}
