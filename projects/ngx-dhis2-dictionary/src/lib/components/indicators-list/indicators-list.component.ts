import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-indicators-list',
  templateUrl: './indicators-list.component.html',
  styleUrls: ['./indicators-list.component.css']
})
export class IndicatorsListComponent implements OnInit {

  @Input() indicators: any;
  @Input() completedPercent: number;
  @Input() totalAvailableIndicators: number;
  @Input() metadataIdentifiers: any;
  @Output() selectedMetadataIdentifier = new EventEmitter<string>()
  error: boolean = false;
  loading: boolean = true;
  hoverState = 'notHovered';
  selectedIndicator: any = null;
  searchText: string;
  currentPage: number = 1;
  searchTextForIndicatorGroup: string;
  listingIsSet: boolean;
  constructor() {
    this.searchText = '';
    this.searchTextForIndicatorGroup = '';
    this.listingIsSet = false;
    if (this.completedPercent >= 100) {
      this.loading = false;
      this.error = false;
    }
  }

  ngOnInit() {
  }

  toggleListingOfItems() {
    this.listingIsSet = !this.listingIsSet;
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
