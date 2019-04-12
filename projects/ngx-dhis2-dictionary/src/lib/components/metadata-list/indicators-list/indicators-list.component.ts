import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { Observable, pipe } from 'rxjs';
import { IndicatorGroupsState } from '../../../store/state/indicators.state';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../store/reducers/indicators.reducers';
import { getListOfIndicators, getAllIndicators, getIndicatorGroups } from '../../../store/selectors/indicators.selectors';
import * as indicators from '../../../store/actions/indicators.actions'
import { DictionaryState } from '../../../store/reducers/dictionary.reducer';
import { ExportToCsv } from 'export-to-csv';

@Component({
  selector: 'app-indicators-list',
  templateUrl: './indicators-list.component.html',
  styleUrls: ['./indicators-list.component.css']
})
export class IndicatorsListComponent implements OnInit {

  @Input() metadataIdentifiers: any;
  @Output() selectedMetadataIdentifier = new EventEmitter<string>()
  error: boolean = false;
  loading: boolean = true;
  hoverState = 'notHovered';
  selectedIndicator: any = null;
  searchText: string;
  currentPage: number = 1;
  searchingTextForIndicatorGroup: string;
  indicatorGroupsForSearching = [];
  showIndicatorGroups = false;
  groupToFilter: any[] = [];
  listingIsSet: boolean;
  indicatorGroups$: Observable<IndicatorGroupsState>;
  activeItem: number;
  searchingText: string;
  indicatorsList$: Observable<any>;
  allIndicators$: Observable<any>;
  indicators: any[] = [];
  completedPercent = 0;
  totalAvailableIndicators = 0;
  indicatorGroups: any[] = [];
  activeMetadataType: string = 'indicator';
  constructor(private store: Store<DictionaryState>, private indicatorsStore: Store<AppState>) {
    this.searchText = '';
    this.searchingTextForIndicatorGroup = '';
    this.listingIsSet = true;
    if (this.completedPercent >= 100) {
      this.loading = false;
      this.error = false;
    }
  }

  ngOnInit() {
    this.loadAllIndicators();
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

  loadAllIndicators() {
    this.indicatorsList$ = this.indicatorsStore.select(pipe(getListOfIndicators));
    this.allIndicators$ = this.indicatorsStore.select(pipe(getAllIndicators));
    this.indicatorGroups$ = this.indicatorsStore.pipe(select(getIndicatorGroups));
    if (this.indicatorsList$) {
      this.indicatorsList$.subscribe((indicatorList) => {
        if (indicatorList) {
          this.totalAvailableIndicators = indicatorList['pager']['total']
                this.allIndicators$.subscribe((indicatorsLoaded) => {
                  if (indicatorsLoaded) {
                    this.indicators = [];
                    _.map(indicatorsLoaded, (indicatorsByPage) => {
                      this.indicators = [...this.indicators, ...indicatorsByPage];
                      this.completedPercent = 100 * (this.indicators.length / this.totalAvailableIndicators);
                      if (this.completedPercent === 100 ) {
                        this.loading = false;
                        this.error = false;
                      }
                    })
                  }
                })
        } else {
          this.indicatorsStore.dispatch(new indicators.loadIndicatorsAction());
          this.indicatorsStore.dispatch(new indicators.LoadIndicatorGroupsAction())
          this.indicatorsList$ = this.indicatorsStore.select(pipe(getListOfIndicators));
          this.allIndicators$ = this.indicatorsStore.select(pipe(getAllIndicators));
          if (this.indicatorsList$) {
            this.indicatorsList$.subscribe((indicatorList) => {
              if (indicatorList) {
                this.totalAvailableIndicators = indicatorList['pager']['total']
                this.allIndicators$.subscribe((indicatorsLoaded) => {
                  if (indicatorsLoaded) {
                    this.indicators = [];
                    _.map(indicatorsLoaded, (indicatorsByPage) => {
                      this.indicators = [...this.indicators, ...indicatorsByPage];
                      this.completedPercent = 100 * (this.indicators.length / this.totalAvailableIndicators);
                      if (this.completedPercent === 100 ) {
                        this.loading = false;
                        this.error = false;
                      }
                    })
                  }
                })
              }
            })
          }
          this.indicatorGroups$ = this.indicatorsStore.pipe(select(getIndicatorGroups));
        }
      })
    }
  }

  getActiveMetadataType(type) {
    this.activeMetadataType = type;
  }

  export(metadataObject$) {
    let data = [];
    metadataObject$.subscribe((metadataArr) => {
      if (metadataArr) {metadataArr.forEach((metadata) => {
        let object = {}
          object['identifier'] = metadata.id;
          object['name'] = metadata.name;
          if (metadata.description) {
            object['description'] = metadata.description;
          } else {
            object['description'] = 'Measured by ' + metadata.numeratorDescription + ' to ' + metadata.denominatorDescription
          }
          object['numeratorDescription'] = metadata.numeratorDescription;
          object['numeratorExpression'] = metadata.numeratorExpression;
          object['denominatorDescription'] = metadata.denominatorDescription,
          object['denominatorExpression'] = metadata.denominatorExpression;
          object['dataOfCreation'] = metadata.created;
          object['createdBy'] = metadata.user.name;
        data.push(object)
      })}
    })
    const options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true, 
      showTitle: true,
      title: 'Indicators available in the system',
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
      // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
    };
     
    const csvExporter = new ExportToCsv(options);
     
    csvExporter.generateCsv(data);
  }
}
