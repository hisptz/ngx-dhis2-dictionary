import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, pipe } from 'rxjs';
import { getListOfIndicators, getAllIndicators } from '../../store/selectors/indicators.selectors';
import { AppState } from '../../store/reducers/indicators.reducers';

@Component({
  selector: 'app-indicators-list',
  templateUrl: './indicators-list.component.html',
  styleUrls: ['./indicators-list.component.css']
})
export class IndicatorsListComponent implements OnInit {

  @Input() indicators: any;
  @Input() completedPercent: number;
  @Input() totalAvailableIndicators: number;
  @Output() selectedMetadataIdentifier = new EventEmitter<string>()
  error: boolean = false;
  loading: boolean = true;
  hoverState = 'notHovered';
  selectedIndicator: any = null;
  searchingText: string;
  searchingTextForIndicatorGroup: string;
  constructor() {
    this.searchingText = '';
    this.searchingTextForIndicatorGroup = '';
    if (this.completedPercent >= 100) {
      this.loading = false;
      this.error = false;
    }
  }

  ngOnInit() {
  }

  selectedMetadata(e){
    this.selectedMetadataIdentifier.emit(e)
  }

  mouseEnter(indicator, hoverState) {
    this.selectedIndicator = indicator.id;
    this.hoverState = hoverState;
  }

  mouseLeave() {
    this.selectedIndicator = null;
    this.hoverState = 'notHovered';
  }

  showGroups() {
    //
  }

  inGroupToFilter(id) {
    //
  }

  groupNames() {
    //
  }

  updateIndicatorGroupsForSearch(group, event) {
    //
  }
}
