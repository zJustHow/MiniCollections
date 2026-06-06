import { useState } from "react";
import NeuButton from "./NeuButton";
import { Badge, Drawer, Grid } from "antd";
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
  selectedSeriesIds = [],
  onToggleCategory,
  onToggleBrand,
  onToggleScale,
  onToggleSeries = () => {},
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
    selectedSeriesIds,
    onToggleCategory,
    onToggleBrand,
    onToggleScale,
    onToggleSeries,
  };

  const activeFilterCount =
    selectedCategoryIds.length +
    selectedBrandIds.length +
    selectedScaleIds.length +
    selectedSeriesIds.length;

  const showMobileFilter = showFilterColumn && isMobile;

  return (
    <>
      {showMobileFilter && (
        <div className="neu-filter-mobile-bar">
          <Badge count={activeFilterCount} size="small" offset={[-4, 4]}>
            <NeuButton
              icon={<FilterOutlined />}
              onClick={() => setDrawerOpen(true)}
            >
              {t("searchFilters")}
            </NeuButton>
          </Badge>
        </div>
      )}

      <div className="neu-search-objects-cards" style={cardsStyle}>
        {children}
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
