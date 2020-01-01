import { UrlOptionsQuery } from '@koa/router';

export type UrlFactory = (name: string, params?: any, options?: UrlOptionsQuery) => string;
