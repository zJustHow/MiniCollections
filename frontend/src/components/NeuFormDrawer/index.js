import { Drawer } from "antd";
import { useLocale as useAntdLocale } from "antd/es/locale";
import DrawerHeaderTitle from "../DrawerHeaderTitle";
import { NeuDrawerBody } from "../drawerStyles";

/**
 * Form/detail drawer — Modal-like API (footer actions, width, destroyOnClose).
 */
export default function NeuFormDrawer({
  title,
  open,
  onClose,
  onOk,
  okText,
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
  const [antdLocale] = useAntdLocale();
  const defaultOkText = antdLocale?.Modal?.okText ?? "OK";
  const resolvedOkText = okText ?? defaultOkText;

  let resolvedFooter = footer;
  if (resolvedFooter === undefined && onOk) {
    resolvedFooter = null;
  }

  return (
    <Drawer
      title={null}
      closable={false}
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
      <DrawerHeaderTitle
        title={title}
        onClose={onClose}
        onOk={onOk}
        okText={resolvedOkText}
        confirmLoading={confirmLoading}
        okButtonProps={okButtonProps}
      />
      <NeuDrawerBody>{children}</NeuDrawerBody>
    </Drawer>
  );
}
