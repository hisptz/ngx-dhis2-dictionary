import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-functions',
  templateUrl: './functions.component.html',
  styleUrls: ['./functions.component.css']
})
export class FunctionsComponent implements OnInit {

  @Input() functionsDetails: any;
  constructor() { }

  ngOnInit() {
  }

  getTodayDate() {
    const now = new Date();
    return now;
  }

  getSizeOfTheFunction(functionDefinition) {
    let functionSize = functionDefinition.length;
    if (functionSize < 1000) {
      return functionSize;
    } else if (functionSize >= 1000 && functionSize < 1000000) {
      return (functionSize/1000).toFixed(2);
    } else {
      return (functionSize/1000000).toFixed(2);
    }
  }
}
