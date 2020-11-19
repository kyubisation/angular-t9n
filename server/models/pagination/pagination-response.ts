import { Hal, HalLink, LinkBuilder } from '../hal';
import { QueryParams } from '../requests';

import { Filterables } from './filterables';
import { Sortables } from './sortables';

const PAGE_PLACEHOLDER = 'PAGE_PLACEHOLDER';

export class PaginationResponse<TEntry, TResponse> implements Hal {
  entriesPerPage: number;
  currentPage: number;
  totalEntries: number;
  totalPages: number;
  _links?: { [key: string]: HalLink };
  _embedded?: { [key: string]: unknown };

  constructor(params: {
    query: QueryParams;
    entries: TEntry[];
    responseMapper: (entry: TEntry) => TResponse;
    urlFactory: (query: QueryParams) => string;
    sortables?: Sortables<TEntry>;
    filterables?: Filterables<TEntry>;
  }) {
    let entries = params.entries.slice();
    const { entriesPerPage, page, sort, ...query } = params.query;
    entries = this._sort(entries, sort, params.sortables);
    entries = this._filter(entries, query, params.filterables);

    this.entriesPerPage = +entriesPerPage || 10;
    this.currentPage = +page || 0;
    this.totalEntries = entries.length;
    this.totalPages = Math.ceil(entries.length / this.entriesPerPage);
    const lastPage = this.totalPages - 1;
    this._links = new LinkBuilder()
      .self(params.urlFactory(params.query))
      .hrefWhen(this.currentPage > 0, 'first', () =>
        params.urlFactory({ ...params.query, page: '0' })
      )
      .hrefWhen(this.currentPage > 0, 'previous', () =>
        params.urlFactory({ ...params.query, page: `${this.currentPage - 1}` })
      )
      .templatedHref(
        'page',
        params
          .urlFactory({ ...params.query, page: PAGE_PLACEHOLDER })
          .replace(PAGE_PLACEHOLDER, '{page}')
      )
      .hrefWhen(this.currentPage < lastPage, 'next', () =>
        params.urlFactory({ ...params.query, page: `${this.currentPage + 1}` })
      )
      .hrefWhen(this.currentPage < lastPage, 'last', () =>
        params.urlFactory({ ...params.query, page: `${lastPage}` })
      )
      .build();
    const start = this.currentPage * this.entriesPerPage;
    this._embedded = {
      entries: entries.slice(start, start + this.entriesPerPage).map(params.responseMapper),
    };
  }

  private _sort(entries: TEntry[], sort: string | undefined, sortables?: Sortables<TEntry>) {
    if (!sort || !sortables) {
      return entries;
    }

    const direction = sort[0] !== '!' ? 'asc' : 'desc';
    if (direction === 'desc') {
      sort = sort.substring(1);
    }

    if (!(sort in sortables)) {
      return entries;
    }

    const sorting = sortables[sort];
    entries = entries.slice().sort(sorting);
    return direction === 'asc' ? entries : entries.reverse();
  }

  private _filter(
    entries: TEntry[],
    query: { [key: string]: string },
    filterables?: Filterables<TEntry>
  ) {
    if (!filterables) {
      return entries;
    }

    return Object.keys(filterables)
      .filter((k) => query[k])
      .reduce((current, next) => current.filter(filterables[next](query[next])), entries);
  }
}
