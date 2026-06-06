export function computeTotalPages(
  totalElements,
  pageSize,
  reservedFirstPageSlots = 0,
) {
  if (reservedFirstPageSlots <= 0) {
    return totalElements === 0 ? 0 : Math.ceil(totalElements / pageSize);
  }
  const totalSlots = totalElements + reservedFirstPageSlots;
  return totalSlots === 0 ? 0 : Math.ceil(totalSlots / pageSize);
}

export function getUiPageDataRange(uiPage, pageSize, reservedFirstPageSlots = 0) {
  if (reservedFirstPageSlots <= 0) {
    return {
      dataOffset: uiPage * pageSize,
      dataLimit: pageSize,
    };
  }

  const dataLimit =
    uiPage === 0 ? pageSize - reservedFirstPageSlots : pageSize;
  const dataOffset =
    uiPage === 0
      ? 0
      : pageSize - reservedFirstPageSlots + (uiPage - 1) * pageSize;

  return { dataOffset, dataLimit };
}

export async function fetchAddCardPageData(
  fetchPage,
  uiPage,
  pageSize,
  reservedFirstPageSlots,
) {
  const { dataOffset, dataLimit } = getUiPageDataRange(
    uiPage,
    pageSize,
    reservedFirstPageSlots,
  );

  if (reservedFirstPageSlots <= 0) {
    return fetchPage({ page: uiPage, size: pageSize });
  }

  if (uiPage === 0) {
    const response = await fetchPage({ page: 0, size: dataLimit });
    const totalElements = response?.total_elements ?? 0;
    return {
      ...response,
      page: uiPage,
      total_pages: computeTotalPages(
        totalElements,
        pageSize,
        reservedFirstPageSlots,
      ),
    };
  }

  const startPage = Math.floor(dataOffset / pageSize);
  const endPage = Math.floor((dataOffset + dataLimit - 1) / pageSize);
  let metadata = null;
  const chunks = [];

  for (let backendPage = startPage; backendPage <= endPage; backendPage += 1) {
    const response = await fetchPage({ page: backendPage, size: pageSize });
    if (!metadata) {
      metadata = response;
    }
    chunks.push(...(Array.isArray(response?.content) ? response.content : []));
  }

  const localStart = dataOffset - startPage * pageSize;
  const content = chunks.slice(localStart, localStart + dataLimit);
  const totalElements = metadata?.total_elements ?? 0;

  return {
    ...metadata,
    content,
    page: uiPage,
    total_pages: computeTotalPages(
      totalElements,
      pageSize,
      reservedFirstPageSlots,
    ),
  };
}
