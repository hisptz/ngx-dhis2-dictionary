import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-data-set',
  templateUrl: './data-set.component.html',
  styleUrls: ['./data-set.component.css']
})
export class DataSetComponent implements OnInit {

  @Input() dataSetInfo: any;
  constructor() { }

  ngOnInit() {
  }

  sortLegends(legends) {
    return _.reverse(_.sortBy(legends, ['startValue']))
  }
}
