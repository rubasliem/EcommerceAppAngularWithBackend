import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appHoverImage]',
  standalone: true
})
export class HoverImageDirective {

  @Input('appHoverImage') hoverSrc:string='';
  private originalSrc:string='';

  constructor(private _EL:ElementRef) {}

   ngOnInit() {
  this.originalSrc = this._EL.nativeElement.src;
}

   @HostListener('mouseenter')  onMouseEnter(){
    if(this.hoverSrc)
      this._EL.nativeElement.src=this.hoverSrc;
   }

   @HostListener('mouseleave') onMouseLeave(){
    this._EL.nativeElement.src=this.originalSrc;
   }

}
