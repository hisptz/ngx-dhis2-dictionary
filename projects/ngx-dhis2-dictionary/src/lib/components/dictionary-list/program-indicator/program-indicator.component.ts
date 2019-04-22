import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-program-indicator',
  templateUrl: './program-indicator.component.html',
  styleUrls: ['./program-indicator.component.css']
})
export class ProgramIndicatorComponent implements OnInit {

  @Input() programIndicatorInfo: any;
  @Output() selectedMetadataId = new EventEmitter<string>();
  constructor() { }

  ngOnInit() {
  }

  setActiveItem(metaDataId) {
    this.selectedMetadataId.emit(metaDataId);
  }

  getProgramName(metaDataInfo) {
    console.log(metaDataInfo)
    return metaDataInfo.metadata.program.name;
  }
}
