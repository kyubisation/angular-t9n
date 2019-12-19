import { HalLink } from './hal-link';

export interface PaginationResponse<TResponse> {
  entriesPerPage: number;
  currentPage: number;
  totalEntries: number;
  totalPages: number;
  _links: { first?: HalLink; previous?: HalLink; page?: HalLink; next?: HalLink; last?: HalLink };
  _embedded: { entries: TResponse[] };
}
