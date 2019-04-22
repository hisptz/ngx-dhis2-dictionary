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

  formatTextToSentenceFormat(text) {
    text.split('_').map(function(stringSection) {
      return stringSection.slice(0,1).toUpperCase() + stringSection.slice(1).toLowerCase();
    }).join(' ')
    return text.split('_').join(' ').slice(0,1).toUpperCase() + text.split('_').join(' ').slice(1).toLowerCase();
  }
}
