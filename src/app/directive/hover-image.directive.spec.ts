import { ElementRef } from "@angular/core";
import { HoverImageDirective } from "./hover-image.directive";

describe('HoverImageDirective', () => {
  it('should create an instance', () => {
    const el = new ElementRef(document.createElement('img')); // عنصر وهمي
    const directive = new HoverImageDirective(el);
    expect(directive).toBeTruthy();
  });
});
