import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { Observable, pipe } from 'rxjs';
import { IndicatorGroupsState } from '../../../store/state/indicators.state';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../store/reducers/indicators.reducers';
import { getListOfIndicators, getAllIndicators, getIndicatorGroups } from '../../../store/selectors/indicators.selectors';
import * as indicators from '../../../store/actions/indicators.actions'
import { DictionaryState } from '../../../store/reducers/dictionary.reducer';
import { DatePipe } from '@angular/common';

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
  itemsPerPageCount = 10;
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
  dataToDownload: any = [];
  pageItemsConfiguration = [{value: 10, symbol: '10'},{value: 25, symbol: '25'},{value: 50, symbol: '50'},{value: 100, symbol: '100'},{value: 200, symbol: '200'},{value: 'all', symbol: 'all'}];
  constructor(private store: Store<DictionaryState>, private indicatorsStore: Store<AppState>, private datePipe: DatePipe) {
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

  setItemsPerPage(value){
    this.itemsPerPageCount =value;
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

  dwndToCSV(metadataObject$) {
    metadataObject$.subscribe((metadataArr) => {
      let arr = [];
      arr.push('UID'); arr.push('Indicator Name'); arr.push('Description'); arr.push('Numerator formula');
      arr.push('Numerator description'); arr.push('Denominator formula'); arr.push('Numerator description');
      arr.push('Created on'); arr.push('Created by');
      this.dataToDownload.push(arr);
      if (metadataArr) {metadataArr.forEach((metadata) => {
        let arr = [];
        arr.push(metadata.id);
        arr.push(metadata.name);
          if (metadata.description) {
            arr.push(metadata.description);
          } else {
            arr.push('Measured by ' + metadata.numeratorDescription + ' to ' + metadata.denominatorDescription)
          }
        arr.push(metadata.numeratorExpression);
        arr.push(metadata.numeratorDescription);
        arr.push(metadata.denominatorExpression);
        arr.push(metadata.denominatorDescription),
        arr.push(metadata.created);
        arr.push(metadata.user.name);
        this.dataToDownload.push(arr)
      })}
      (function() {
        let asUtf16, downloadExcelCsv, makeExcelCsvBlob, toTsv;
        let rows = this.dataToDownload;
      
        asUtf16 = function(str) {
          var buffer, bufferView, i, val, _i, _ref;
          buffer = new ArrayBuffer(str.length * 2);
          bufferView = new Uint16Array(buffer);
          bufferView[0] = 0xfeff;
          for (i = _i = 0, _ref = str.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
            val = str.charCodeAt(i);
            bufferView[i + 1] = val;
          }
          return bufferView;
        };
      
        makeExcelCsvBlob = function(rows) {
          return new Blob([asUtf16(toTsv(rows)).buffer], {
            type: "text/csv;charset=UTF-16"
          });
        };
      
        toTsv = function(rows) {
          var escapeValue;
          escapeValue = function(val) {
            if (typeof val === 'string') {
              return '"' + val.replace(/"/g, '""') + '"';
            } else if (val != null) {
              return val;
            } else {
              return '';
            }
          };
          return rows.map(function(row) {
            return row.map(escapeValue).join(',');
          }).join('\n') + '\n';
        };
      
        downloadExcelCsv = function(rows, attachmentFilename) {
          var a, blob;
          blob = makeExcelCsvBlob(rows);
          a = document.createElement('a');
          a.style.display = 'none';
          a.download = attachmentFilename;
          document.body.appendChild(a);
          a.href = URL.createObjectURL(blob);
          a.click();
          URL.revokeObjectURL(a.href);
          a.remove();
        };
        rows = this.dataToDownload;
        let theDate = new Date();
        theDate = this.datePipe.transform(theDate, 'yyyy-MM-dd')
       return downloadExcelCsv(this.dataToDownload, 'List_of_'  + this.totalAvailableIndicators + '_indicators_generated_on' + theDate + '.csv');
      }).call(this);
    })
  }

}
