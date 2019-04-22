import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-data-element',
  templateUrl: './data-element.component.html',
  styleUrls: ['./data-element.component.css']
})
export class DataElementComponent implements OnInit {

  @Input() dataElementInfo: any;
  @Output() selectedMetadataId = new EventEmitter<string>();
  constructor() { }

  ngOnInit() {
  }

  setActiveItem(metaDataId) {
    this.selectedMetadataId.emit(metaDataId);
  }

  sortLegends(legends) {
    return _.reverse(_.sortBy(legends, ['startValue']))
  }

  getToCapitalLetters(color) {
    return _.upperCase(color);
  }

  getTodayDate() {
    const now = new Date();
    return now;
  }
}
