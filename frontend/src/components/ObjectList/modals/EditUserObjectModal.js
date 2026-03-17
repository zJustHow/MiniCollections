import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Upload,
} from "antd";
import { Z_INDEX } from "../constants";

export default function EditUserObjectModal({
  visible,
  onOk,
  onCancel,
  confirmLoading,
  form,
  searchResults,
  searchLoading,
  onSearch,
  imageData,
  selectedUserObject,
  onImageChange,
}) {
  return (
    <Modal
      zIndex={Z_INDEX.MODAL_EDIT_USER_OBJECT}
      title="Edit Model"
      open={visible}
      onOk={onOk}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form layout="vertical" form={form}>
        <Form.Item label="Model" name="brandObjectId">
          <Select
            placeholder="Search by keyword (optional)"
            allowClear
            showSearch
            loading={searchLoading}
            filterOption={false}
            onSearch={onSearch}
            onChange={(value) => form.setFieldsValue({ brandObjectId: value })}
            optionFilterProp="children"
          >
            {searchResults.map((bo) => (
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
              reader.onload = (e) => onImageChange(e.target.result);
              reader.readAsDataURL(file);
              return false;
            }}
          >
            <div style={{ width: 120 }}>
              <img
                src={
                  imageData ||
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
  );
}
