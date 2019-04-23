import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-data-element-group',
  templateUrl: './data-element-group.component.html',
  styleUrls: ['./data-element-group.component.css']
})
export class DataElementGroupComponent implements OnInit {

  @Input() dataElementGroupInfo: any;
  @Output() selectedMetadataId = new EventEmitter<string>();
  constructor() { }

  ngOnInit() {
  }

  setActiveItem(metaDataId) {
    this.selectedMetadataId.emit(metaDataId);
  }

  getDistinctDataSetsCount(dataElements) {
    let dataSets = [];
    dataElements.forEach((dataElement) => {
      dataSets.push(dataElement.dataSetElements[0].dataSet);
    })
    return _.uniqBy(dataSets, 'id');
  }

  getTodayDate() {
    const now = new Date();
    return now;
  }
}
