import { HalLink } from './hal-link';

export class Links {
  private _links: { [key: string]: HalLink } = {};

  self(href: string) {
    return this.href('self', href);
  }

  hrefWhen(condition: boolean, name: string, hrefFactory: () => string) {
    return condition ? this.href(name, hrefFactory()) : this;
  }

  href(name: string, href: string) {
    this._links[name] = { href };
    return this;
  }

  templatedHref(name: string, href: string) {
    this._links[name] = { href, templated: true };
    return this;
  }

  build() {
    return Object.keys(this._links).length > 0 ? this._links : undefined;
  }
}
