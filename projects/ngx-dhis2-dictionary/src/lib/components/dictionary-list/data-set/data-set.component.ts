import { Component, OnInit, Input } from '@angular/core';

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

}
