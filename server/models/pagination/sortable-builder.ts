import { Sortable } from './sortable';
import { Sortables } from './sortables';

export class SortableBuilder<TModel> {
  private _sortables: {
    [property: string]: Sortable<TModel>;
  } = {};

  constructor(private readonly _selector: (model: TModel) => any = (m) => m) {}

  addSortables(...properties: string[]) {
    for (const property of properties) {
      this._sortables[property] = (a, b) =>
        this._selector(a)[property].localeCompare(this._selector(b)[property]);
    }
    return this;
  }

  addSafeSortables(...properties: string[]) {
    for (const property of properties) {
      this._sortables[property] = (a, b) =>
        (this._selector(a)[property] || '').localeCompare(this._selector(b)[property] || '');
    }
    return this;
  }

  build(): Sortables<TModel> {
    return this._sortables as any;
  }
}
