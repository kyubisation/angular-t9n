import { Filterable } from './filterable';
import { Filterables } from './filterables';

export class FilterableBuilder<TModel> {
  private _filterables: {
    [property: string]: Filterable<TModel>;
  } = {};

  constructor(private readonly _selector: (model: TModel) => any = (m) => m) {}

  addFilterables(...properties: string[]) {
    for (const property of properties) {
      this._filterables[property] = (f) => (e) =>
        !!this._selector(e)[property]?.toUpperCase().includes(f.toUpperCase());
    }
    return this;
  }

  build(): Filterables<TModel> {
    return this._filterables as any;
  }
}
