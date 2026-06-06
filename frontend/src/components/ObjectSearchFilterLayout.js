import { useState } from "react";
import { Badge, Button, Drawer, Grid } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import ObjectSearchFilterPanel from "./ObjectSearchFilterPanel";
import DrawerHeaderTitle from "./DrawerHeaderTitle";
import { NeuDrawerBody } from "./drawerStyles";
import { useLocale } from "../LocaleContext";

const { useBreakpoint } = Grid;

export default function ObjectSearchFilterLayout({
  showFilterColumn,
  facets,
  loading,
  selectedCategoryIds,
  selectedBrandIds,
  selectedScaleIds,
  onToggleCategory,
  onToggleBrand,
  onToggleScale,
  children,
  cardsStyle,
}) {
  const { t } = useLocale();
  const screens = useBreakpoint();
  const isMobile = !screens.lg;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filterProps = {
    facets,
    loading,
    selectedCategoryIds,
    selectedBrandIds,
    selectedScaleIds,
    onToggleCategory,
    onToggleBrand,
    onToggleScale,
  };

  const activeFilterCount =
    selectedCategoryIds.length +
    selectedBrandIds.length +
    selectedScaleIds.length;

  const showInlineFilter = showFilterColumn && !isMobile;
  const showMobileFilter = showFilterColumn && isMobile;

  return (
    <>
      {showMobileFilter && (
        <div className="neu-filter-mobile-bar">
          <Badge count={activeFilterCount} size="small" offset={[-4, 4]}>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setDrawerOpen(true)}
            >
              {t("searchFilters")}
            </Button>
          </Badge>
        </div>
      )}

      <div
        className={`neu-search-objects-layout${
          isMobile ? " neu-search-objects-layout--mobile" : ""
        }${
          !showInlineFilter && !isMobile
            ? " neu-search-objects-layout--wide-cards"
            : ""
        }`}
      >
        {showInlineFilter && <ObjectSearchFilterPanel {...filterProps} />}
        <div
          className="neu-search-objects-cards"
          style={
            showInlineFilter
              ? cardsStyle
              : !isMobile
                ? { gridColumn: "1 / -1", ...cardsStyle }
                : cardsStyle
          }
        >
          {children}
        </div>
      </div>

      {showMobileFilter && (
        <Drawer
          closable={false}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement="right"
          width={320}
          destroyOnClose={false}
        >
          <DrawerHeaderTitle
            title={t("searchFilters")}
            onClose={() => setDrawerOpen(false)}
          />
          <NeuDrawerBody>
            <ObjectSearchFilterPanel {...filterProps} variant="drawer" />
          </NeuDrawerBody>
        </Drawer>
      )}
    </>
  );
}
