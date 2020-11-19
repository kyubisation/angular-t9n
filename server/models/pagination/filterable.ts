export type Filterable<TModel> = (filter: string) => (e: TModel) => boolean;
