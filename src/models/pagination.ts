export type PreviousOrNextPage = number | null;

export interface MetaData {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  nextPage: PreviousOrNextPage;
  previousPage: PreviousOrNextPage;
}

export interface PaginationRecords<T> {
  data: T[];
  pagination: MetaData;
}
