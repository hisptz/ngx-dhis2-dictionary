import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-switching-btns',
  templateUrl: './switching-btns.component.html',
  styleUrls: ['./switching-btns.component.css']
})
export class SwitchingBtnsComponent implements OnInit {

  @Input() metadataTypes: any;
  constructor() { }

  ngOnInit() {
  }

  switchMetadata(status, type) {
    console.log(status, type);
  }
}
