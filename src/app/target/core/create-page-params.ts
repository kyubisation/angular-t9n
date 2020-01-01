import { HttpParams } from '@angular/common/http';
import { SortDirection } from '@angular/material/sort';

export function createPageParams(query: {
  page?: number;
  entriesPerPage?: number;
  sort?: { active: string; direction: SortDirection };
  filter?: { [property: string]: string };
}) {
  let params = new HttpParams();
  if (query.page) {
    params = params.set('page', query.page.toString());
  }
  if (query.entriesPerPage) {
    params = params.set('entriesPerPage', query.entriesPerPage.toString());
  }
  if (query.sort && query.sort.active) {
    params = params.set(
      'sort',
      `${query.sort.direction === 'desc' ? '!' : ''}${query.sort.active}`
    );
  }
  if (query.filter) {
    params = Object.keys(query.filter)
      .filter(k => query.filter![k])
      .reduce((current, next) => current.set(next, query.filter![next]), params);
  }

  return params;
}
