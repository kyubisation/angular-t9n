import { AbstractControl, ValidatorFn } from '@angular/forms';

const parser = new DOMParser();

export function xlfElementValidator(source: string): ValidatorFn {
  const doc = parser.parseFromString(`<root>${source}</root>`, 'text/xml');
  const placeholders = Array.from<Element>(doc.documentElement.childNodes as any)
    .filter(n => n.nodeType !== doc.TEXT_NODE)
    .map(p => p.outerHTML);
  return !placeholders.length ||
    source.startsWith('{VAR_PLURAL') ||
    source.startsWith('{VAR_SELECT')
    ? () => null
    : (control: AbstractControl) => {
        const value: string = control.value;
        return typeof value !== 'string' || !value || placeholders.every(p => value.indexOf(p) >= 0)
          ? null
          : { placeholders };
      };
}
