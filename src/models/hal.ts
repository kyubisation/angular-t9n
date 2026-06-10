import { HalLink } from './hal-link';

export interface Hal {
  _links?: Record<string, HalLink>;
  _embedded?: Record<string, unknown>;
}
