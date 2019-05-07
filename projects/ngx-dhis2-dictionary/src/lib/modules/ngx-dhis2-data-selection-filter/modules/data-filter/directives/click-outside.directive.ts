import {
  Directive,
  ElementRef,
  Output,
  EventEmitter,
  HostListener
} from '@angular/core';

@Directive({
  selector: '[dataFilterClickOutside]'
})
export class DataFilterClickOutsideDirective {
  constructor(private _elementRef: ElementRef) {}

  @Output() public filterClickOutside = new EventEmitter();
  @HostListener('document:click', ['$event.target']) public onClick(
    targetElement
  ) {
    const clickedInside = this._elementRef.nativeElement.contains(
      targetElement
    );
    if (!clickedInside) {
      this.filterClickOutside.emit(true);
    }
  }
}
