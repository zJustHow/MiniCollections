import { Button, Drawer, Space } from "antd";
import { useLocale as useAntdLocale } from "antd/es/locale";
import { useLocale } from "../../LocaleContext";

/**
 * Form/detail drawer — Modal-like API (footer actions, width, destroyOnClose).
 */
export default function NeuFormDrawer({
  title,
  open,
  onClose,
  onOk,
  okText,
  cancelText,
  confirmLoading = false,
  width = 480,
  destroyOnClose,
  footer,
  okButtonProps,
  extra,
  zIndex,
  placement = "right",
  mask = true,
  maskClosable = true,
  children,
}) {
  const { t } = useLocale();
  const [antdLocale] = useAntdLocale();
  const defaultOkText = antdLocale?.Modal?.okText ?? "OK";

  let resolvedFooter = footer;
  if (resolvedFooter === undefined && onOk) {
    resolvedFooter = (
      <Space>
        <Button onClick={onClose}>{cancelText ?? t("cancel")}</Button>
        <Button
          type="primary"
          onClick={onOk}
          loading={confirmLoading}
          {...okButtonProps}
        >
          {okText ?? defaultOkText}
        </Button>
      </Space>
    );
  }

  return (
    <Drawer
      title={title}
      open={open}
      onClose={onClose}
      width={width}
      placement={placement}
      destroyOnClose={destroyOnClose}
      footer={resolvedFooter}
      extra={extra}
      zIndex={zIndex}
      mask={mask}
      maskClosable={maskClosable}
    >
      {children}
    </Drawer>
  );
}
