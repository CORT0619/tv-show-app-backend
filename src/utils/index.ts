import { PaginationRecords, PreviousOrNextPage } from '../models/pagination';

function paginateRecords<T>(
  records: T[],
  size: number,
  page?: number
): PaginationRecords<T> {
  let currentPage = 0,
    totalRecords = 0,
    totalPages = 0,
    nextPage: PreviousOrNextPage = null,
    previousPage: PreviousOrNextPage = null;

  totalRecords = records.length;
  totalPages = Math.ceil(totalRecords / size);
  currentPage = page || 1;
  previousPage = currentPage > 1 ? currentPage - 1 : null;
  nextPage = currentPage < totalPages ? currentPage + 1 : null;

  size = totalRecords < size ? totalRecords : size;

  // retrieve the correct records for the current page
  const startingIndex = (currentPage - 1) * size;
  const endingIndex = startingIndex + size;
  const data = records.slice(startingIndex, endingIndex);
  return {
    data,
    pagination: {
      totalRecords,
      currentPage,
      totalPages,
      nextPage,
      previousPage
    }
  };
}

export { paginateRecords };
