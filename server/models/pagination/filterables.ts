import { Filterable } from './filterable';

export interface Filterables<TModel> {
  [property: string]: Filterable<TModel>;
}
