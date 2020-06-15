import { HalLink } from './hal-link';

export interface Hal {
  _links?: { [key: string]: HalLink };
  _embedded?: { [key: string]: unknown };
}
