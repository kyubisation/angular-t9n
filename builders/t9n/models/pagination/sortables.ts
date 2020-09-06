import { Sortable } from './sortable';

export interface Sortables<TModel> {
  [property: string]: Sortable<TModel>;
}
