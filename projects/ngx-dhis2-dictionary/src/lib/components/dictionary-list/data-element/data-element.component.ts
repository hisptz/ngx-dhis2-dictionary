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
  listAllMetadataInGroup: boolean = false;
  showOptions: boolean = false;
  constructor() { }

  ngOnInit() {
  }

  setActiveItem(e, metaDataId) {
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

  getOtherMetadata(allMedatada, listAllMetadataInGroup) {
    let newSlicedList = [];
    _.map(allMedatada, (metadata) => {
      if (metadata.id !== this.dataElementInfo.data.metadata.id) {
        newSlicedList.push(metadata);
      }
    })
    if (!listAllMetadataInGroup) {
      return newSlicedList.slice(0,3)
    } else {
      return newSlicedList;
    }
  }

  showOptionsList() {
    this.showOptions = !this.showOptions;
  }
}
