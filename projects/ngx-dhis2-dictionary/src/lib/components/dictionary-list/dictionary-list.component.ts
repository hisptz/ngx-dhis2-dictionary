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
    if (this.isFullScreen) {
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
  }

  selectedMetadataIdentifier(identifier) {
    let identifiers = [];
    this.metadataIdentifiers.push(identifier);
    identifiers = _.uniq(this.metadataIdentifiers)
    this.store.dispatch(
      new InitializeDictionaryMetadataAction(identifiers)
    );

    this.dictionaryList$ = this.store.select(
      getDictionaryList(identifiers)
    );
  }

  setActiveItem(index, e) {
    e.stopPropagation();
    if (this.activeItem === index) {
      this.activeItem = -1;
    } else {
      this.activeItem = index;
    }
  }

  getSafeHtml(html) {
    let safeHtml;
    safeHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    return safeHtml;
  }
}
