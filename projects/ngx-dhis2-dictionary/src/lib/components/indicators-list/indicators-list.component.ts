import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

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
  @Input() indicatorGroups: any;
  @Output() selectedMetadataIdentifier = new EventEmitter<string>()
  error: boolean = false;
  loading: boolean = true;
  hoverState = 'notHovered';
  selectedIndicator: any = null;
  searchText: string;
  currentPage: number = 1;
  searchTextForIndicatorGroup: string;
  indicatorGroupsForSearching = [];
  showIndicatorGroups = false;
  groupToFilter: any[] = [];
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
    this.showIndicatorGroups = !this.showIndicatorGroups;
  }

  inGroupToFilter(id) {
    return _.find(this.groupToFilter, {id: id});
  }

  groupNames() {
    if ( this.indicatorGroupsForSearching.length < 5 ) {
      return this.indicatorGroupsForSearching.map( g => g.name ).join(', ');
    }else {
      const diff = this.indicatorGroupsForSearching.length - 4;
      return this.indicatorGroupsForSearching.slice(0, 4).map( g => g.name ).join(', ') + ' and ' + diff + ' More';
    }
  }

  updateIndicatorGroupsForSearch(group, event) {
    if (event) {
      this.indicatorGroupsForSearching.push(group);
    } else {
      let index = this.indicatorGroupsForSearching.indexOf(group);
      this.indicatorGroupsForSearching.splice(index, 1)
    }
  }
}
