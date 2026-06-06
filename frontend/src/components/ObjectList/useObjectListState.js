import { App } from "antd";
import { searchBrandObjects } from "../../utils";
import useBrandsState from "./useBrandsState";
import useGroupsState from "./useGroupsState";

/** Combines brand- and group-related state for ObjectList. */
export default function useObjectListState({ isAdmin = false } = {}) {
  const { message } = App.useApp();
  const brandsSection = useBrandsState({ isAdmin });
  const groupsSection = useGroupsState();

  return {
    ...brandsSection,
    ...groupsSection,
    // Pass through utility functions for backward compatibility.
    searchBrandObjects,
    message,
  };
}


