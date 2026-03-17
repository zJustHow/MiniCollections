import { message } from "antd";
import { searchBrandObjects } from "../../utils";
import useBrandsState from "./useBrandsState";
import useGroupsState from "./useGroupsState";

/** Combines brand- and group-related state for ObjectList. */
export default function useObjectListState() {
  const brandsSection = useBrandsState();
  const groupsSection = useGroupsState();

  return {
    ...brandsSection,
    ...groupsSection,
    // Pass through utility functions for backward compatibility.
    searchBrandObjects,
    message,
  };
}


