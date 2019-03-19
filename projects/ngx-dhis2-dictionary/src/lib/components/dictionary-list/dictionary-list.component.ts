import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { Store } from '@ngrx/store';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { MetadataDictionary } from '../../models/dictionary';

import { DictionaryState } from '../../store/reducers/dictionary.reducer';
import { getDictionaryList } from '../../store/selectors/dictionary.selectors';
import { InitializeDictionaryMetadataAction } from '../../store/actions/dictionary.actions';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ngx-dhis2-dictionary-list',
  templateUrl: './dictionary-list.component.html',
  styleUrls: ['./dictionary-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DictionaryListComponent implements OnInit {
  @Input() metadataIdentifiers: Array<string>;
  dictionaryList$: Observable<MetadataDictionary[]>;
  activeItem: number;

  constructor(private store: Store<DictionaryState>, private sanitizer: DomSanitizer) {
    this.activeItem = 0;
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
