import { LinkHelper } from '../../link-helper';
import { Hal, HalLink, Links } from '../hal';

export class TargetsResponse implements Hal {
  languages: string[];
  _links?: { [key: string]: HalLink };
  _embedded?: { [key: string]: unknown };

  constructor(languages: string[], linkHelper: LinkHelper) {
    this.languages = languages;
    this._links = new Links()
      .self(linkHelper.targets())
      .templatedHref('target', linkHelper.target('{language}'))
      .build();
  }
}
