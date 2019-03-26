import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-indicator-properties',
  templateUrl: './indicator-properties.component.html',
  styleUrls: ['./indicator-properties.component.css']
})
export class IndicatorPropertiesComponent implements OnInit {

  @Input() indicator: any;
  @Output() selectedMetadata = new EventEmitter<string>();
  constructor() { }

  ngOnInit() {
  }

  getIndicatorType(indicatorType) {
    if (indicatorType.name.toLowerCase().indexOf('cent') > -1) {
      return 'Percentage indicator';
    } else {
      return 'Number indicator';
    }
  }

  addSelectedMetadata(e) {
    this.selectedMetadata.emit(e);
  }
}
