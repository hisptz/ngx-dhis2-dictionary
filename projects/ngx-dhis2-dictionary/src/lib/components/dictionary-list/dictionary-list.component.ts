import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { Store } from '@ngrx/store';
import * as _ from 'lodash';
import { Observable, pipe } from 'rxjs';
import { MetadataDictionary } from '../../models/dictionary';

import { DictionaryState } from '../../store/reducers/dictionary.reducer';
import { getDictionaryList } from '../../store/selectors/dictionary.selectors';
import { InitializeDictionaryMetadataAction } from '../../store/actions/dictionary.actions';
import * as indicators from '../../store/actions/indicators.actions'
import { DomSanitizer } from '@angular/platform-browser';
import { getListOfIndicators, getAllIndicators } from '../../store/selectors/indicators.selectors';
import { AppState } from '../../store/reducers/indicators.reducers';
import { Identifiers } from '@angular/compiler';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ngx-dhis2-dictionary-list',
  templateUrl: './dictionary-list.component.html',
  styleUrls: ['./dictionary-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DictionaryListComponent implements OnInit {
  @Input() metadataIdentifiers: Array<string>;
  @Input() isFullScreen: boolean;
  dictionaryList$: Observable<MetadataDictionary[]>;
  activeItem: number;
  indicators: any[] = [];
  indicatorsList$: Observable<any>;
  allIndicators$: Observable<any>;
  completedPercent = 0;
  selectedIndicator: any = null;
  totalAvailableIndicators: any = null;
  error: boolean;
  loading: boolean;

  constructor(private store: Store<DictionaryState>, private indicatorsStore: Store<AppState>, private sanitizer: DomSanitizer) {
    if (this.isFullScreen) {
      this.activeItem = -1;
    } else {
      this.activeItem = 0;
    }
    this.indicators = [];
    this.loading = true;
    this.error =false;
  }

  ngOnInit() {
    if (this.metadataIdentifiers.length > 0) {
      this.store.dispatch(
        new InitializeDictionaryMetadataAction(this.metadataIdentifiers)
      );

      this.dictionaryList$ = this.store.select(
        getDictionaryList(this.metadataIdentifiers)
      );
    }
  }

  selectedMetadataIdentifier(identifier) {
    let identifiers = [];
    if (_.indexOf(this.metadataIdentifiers, identifier) < 0) {
      this.metadataIdentifiers.push(identifier);
    }
    identifiers = _.uniq(this.metadataIdentifiers);
    const currentIdentifierIndex = _.indexOf(this.metadataIdentifiers, identifier);
    this.setActiveItem(currentIdentifierIndex);
    this.store.dispatch(
      new InitializeDictionaryMetadataAction(this.metadataIdentifiers)
    );

    this.dictionaryList$ = this.store.select(
      getDictionaryList(identifiers)
    );
  }

  setActiveItem(index, e?) {
    if (e) {
      e.stopPropagation();
    }
    this.activeItem = index;
    if (index == -1) {
      // check if the store has the items
      this.indicatorsList$ = this.indicatorsStore.select(pipe(getListOfIndicators));
      if (this.indicatorsList$) {
        this.indicatorsList$.subscribe((indicatorList) => {
          if (indicatorList) {
            this.totalAvailableIndicators = indicatorList['pager']['total'];
            this.allIndicators$ = this.indicatorsStore.select(pipe(getAllIndicators));
            if (this.allIndicators$) {
              this.allIndicators$.subscribe((indicatorsLoaded) => {
                if (indicatorsLoaded) {
                  this.indicators = [];
                  _.map(indicatorsLoaded, (indicatorsByPage) => {
                    this.indicators = [...this.indicators, ...indicatorsByPage['indicators']];
                    this.completedPercent = 100 * (this.indicators.length / this.totalAvailableIndicators);
                    if (this.completedPercent === 100 ) {
                      this.loading = false;
                      this.error = false;
                    }
                  })
                }
              })
            }
          } else {
            this.store.dispatch(new indicators.loadIndicatorsAction());
            this.indicatorsList$ = this.indicatorsStore.select(pipe(getListOfIndicators));
            this.allIndicators$ = this.indicatorsStore.select(pipe(getAllIndicators));
            if (this.indicatorsList$) {
              this.indicatorsList$.subscribe((indicatorList) => {
                if (indicatorList) {
                  this.totalAvailableIndicators = indicatorList['pager']['total']
                  if (this.allIndicators$) {
                    this.allIndicators$.subscribe((indicatorsLoaded) => {
                      if (indicatorsLoaded) {
                        this.indicators = [];
                        _.map(indicatorsLoaded, (indicatorsByPage) => {
                          this.indicators = [...this.indicators, ...indicatorsByPage['indicators']];
                          this.completedPercent = 100 * (this.indicators.length / this.totalAvailableIndicators);
                          if (this.completedPercent === 100 ) {
                            this.loading = false;
                            this.error = false;
                          }
                        })
                      }
                    })
                  }
                }
              })
            }
          }
        })
      }
    }
  }

  getSafeHtml(html) {
    let safeHtml;
    safeHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    return safeHtml;
  }

  remove(item) {
    let identifiers = [];
    if (this.metadataIdentifiers.length === 1) {
      this.activeItem = -1;
    }
    this.metadataIdentifiers.forEach((identifier) => {
      if (item.id !== identifier) {
        identifiers.push(identifier);
      }
    });
    this.metadataIdentifiers = _.uniq(identifiers);
    this.store.dispatch(
      new InitializeDictionaryMetadataAction(this.metadataIdentifiers)
    );

    this.dictionaryList$ = this.store.select(
      getDictionaryList(this.metadataIdentifiers)
    );
  }
}
