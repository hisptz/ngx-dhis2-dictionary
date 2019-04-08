import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter
} from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as _ from 'lodash';
import { Observable, pipe } from 'rxjs';
import { MetadataDictionary } from '../../models/dictionary';
import * as indicators from '../../store/actions/indicators.actions'

import { DictionaryState } from '../../store/reducers/dictionary.reducer';
import { getDictionaryList } from '../../store/selectors/dictionary.selectors';
import { InitializeDictionaryMetadataAction } from '../../store/actions/dictionary.actions';
import { DomSanitizer } from '@angular/platform-browser';
import { IndicatorGroupsState } from '../../store/state/indicators.state';
import { getIndicatorGroups, getListOfIndicators, getAllIndicators } from '../../store/selectors/indicators.selectors';
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
  @Input() selectedItem: string;
  @Output() dictionaryItemId = new EventEmitter<string>();
  dictionaryList$: Observable<MetadataDictionary[]>;
  activeItem: number;
  selectedIndicator: any = null;
  searchingText: string;

  constructor(private store: Store<DictionaryState>, private indicatorsStore: Store<AppState>, private sanitizer: DomSanitizer) {
    this.activeItem = 0;
    this.searchingText = '';
  }

  ngOnInit() {
    if(this.selectedItem) {
      this.selectedIndicator = this.selectedItem;
    } else {
      this.selectedItem = this.selectedIndicator = this.metadataIdentifiers[0]
    }
    if (this.metadataIdentifiers.length > 0 && this.metadataIdentifiers[0] !== '') {
      this.store.dispatch(
        new InitializeDictionaryMetadataAction(this.metadataIdentifiers)
      );

      this.dictionaryList$ = this.store.select(
        getDictionaryList(this.metadataIdentifiers)
      );
    } else if (this.selectedIndicator == 'all') {
    } else {}
  }

  selectedMetadataIdentifier(identifier) {
    this.selectedIndicator = identifier;
    let identifiers = [];
    if (_.indexOf(this.metadataIdentifiers, identifier) < 0) {
      this.metadataIdentifiers.push(identifier);
    }
    identifiers = _.uniq(this.metadataIdentifiers);
    this.store.dispatch(
      new InitializeDictionaryMetadataAction(this.metadataIdentifiers)
    );

    this.dictionaryList$ = this.store.select(
      getDictionaryList(identifiers)
    );
    const url = this.metadataIdentifiers.join(',') + '/selected/' + identifier;
    this.dictionaryItemId.emit(url);
  }

  setActiveItem(index, e?, dictionaryItemId?) {
    if (e) {
      e.stopPropagation();
    }
    this.selectedIndicator = dictionaryItemId;
    this.activeItem = index;
    if (this.selectedIndicator == 'all') {
      const url = this.metadataIdentifiers.join(',') + '/selected/' + dictionaryItemId;
      this.dictionaryItemId.emit(url);
    } else {
      const url = this.metadataIdentifiers.join(',') + '/selected/' + dictionaryItemId;
      this.dictionaryItemId.emit(url);
    }
  }

  getSafeHtml(html) {
    let safeHtml;
    safeHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    return safeHtml;
  }

  remove(item, allIdentifiers) {
    let identifiers = [];
    allIdentifiers.subscribe((identifiersInfo) => {
      identifiersInfo.forEach((identifier) => {
        if (item.id !== identifier.id && identifier.name.indexOf('not found') < 0) {
          identifiers.push(identifier.id);
        }
      })
    })
    this.metadataIdentifiers = _.uniq(identifiers);
    this.store.dispatch(
      new InitializeDictionaryMetadataAction(this.metadataIdentifiers)
    );

    this.dictionaryList$ = this.store.select(
      getDictionaryList(this.metadataIdentifiers)
    );
  }
}
