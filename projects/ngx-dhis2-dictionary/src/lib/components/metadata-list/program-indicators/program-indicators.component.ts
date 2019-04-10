import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppState } from '../../../store/reducers/indicators.reducers';
import { Store } from '@ngrx/store';
import { Observable, pipe } from 'rxjs';
import * as _ from 'lodash';
import { getListOfProgramIndicators, getAllProgramIndicators } from '../../../store/selectors/indicators.selectors';
import * as indicators from '../../../store/actions/indicators.actions'

@Component({
  selector: 'app-program-indicators',
  templateUrl: './program-indicators.component.html',
  styleUrls: ['./program-indicators.component.css']
})
export class ProgramIndicatorsComponent implements OnInit {


  @Input() metadataIdentifiers: any;
  @Output() selectedMetadataIdentifier = new EventEmitter<string>()
  programIndicatorsList$: Observable<any> = null;
  allProgramIndicators$: Observable<any>;
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
  activeItem: number;
  searchingText: string;
  indicatorsList$: Observable<any>;
  allIndicators$: Observable<any>;
  programIndicators: any[] = [];
  completedPercentage = 0;
  totalAvailableProgramIndicators = 0;
  indicatorGroups: any[] = [];
  constructor(private metadataStore: Store<AppState>) {
    this.searchText = '';
    this.searchingTextForIndicatorGroup = '';
    this.listingIsSet = true;
    if (this.completedPercentage >= 100) {
      this.loading = false;
      this.error = false;
    }
   }

  ngOnInit() {
    this.loadAllProgramIndicators();
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

  loadAllProgramIndicators(){
    this.programIndicatorsList$ = this.metadataStore.select(pipe(getListOfProgramIndicators));
    this.allProgramIndicators$ = this.metadataStore.select(pipe(getAllProgramIndicators));
    if (this.programIndicatorsList$) {
      this.programIndicatorsList$.subscribe((list) => {
        if (list) {
          this.totalAvailableProgramIndicators = list['pager']['total']
                this.allProgramIndicators$.subscribe((indicatorsLoaded) => {
                  if (indicatorsLoaded) {
                    this.programIndicators = [];
                    _.map(indicatorsLoaded, (indicatorsByPage) => {
                      this.programIndicators = [...this.programIndicators, ...indicatorsByPage];
                      this.completedPercentage = 100 * (this.programIndicators.length / this.totalAvailableProgramIndicators);
                      if (this.completedPercentage === 100 ) {
                        this.loading = false;
                        this.error = false;
                      }
                    })
                  }
                })
        } else {
          this.metadataStore.dispatch(new indicators.loadProgramIndicatorsAction());
          this.programIndicatorsList$ = this.metadataStore.select(pipe(getListOfProgramIndicators));
          this.allProgramIndicators$ = this.metadataStore.select(pipe(getAllProgramIndicators));
          if (this.programIndicatorsList$) {
            this.programIndicatorsList$.subscribe((list) => {
              if (list) {
                this.totalAvailableProgramIndicators = list['pager']['total']
                this.allProgramIndicators$.subscribe((indicatorsLoaded) => {
                  if (indicatorsLoaded) {
                    this.programIndicators = [];
                    _.map(indicatorsLoaded, (indicatorsByPage) => {
                      this.programIndicators = [...this.programIndicators, ...indicatorsByPage];
                      this.completedPercentage = 100 * (this.programIndicators.length / this.totalAvailableProgramIndicators);
                      if (this.completedPercentage === 100 ) {
                        this.loading = false;
                        this.error = false;
                      }
                    })
                  }
                })
              }
            })
          }
        }
      })
    }
  }
}
