import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchIndicatorGroupPipe } from './pipes/search-indicator-group.pipe';
import { FilterBySearchInputPipe } from './pipes/filter-by-search-input.pipe';
import { FilterIndicatorsByGroupIdPipe } from './pipes/filter-indicators-by-group-id.pipe';
import { ShortenNamePipe } from './pipes/shorten-name.pipe';
import { indicatorsListReducer, allIndicatorsRedcuer, indicatorGroupsReducer } from './store/reducers/indicators.reducers';
import { IndicatorsEffects } from './store/effects/indicators.effects';

import { DictionaryListComponent } from './components/dictionary-list/dictionary-list.component';
import { DictionaryProgressComponent } from './components/dictionary-progress/dictionary-progress.component';
import { dictionaryReducer } from './store/reducers/dictionary.reducer';
import { DictionaryEffects } from './store/effects/dictionary.effects';
import { IndicatorsService } from './services/indicators.service';
import { IndicatorsListComponent } from './components/indicators-list/indicators-list.component';
import { IndicatorPropertiesComponent } from './components/indicators-list/indicator-properties/indicator-properties.component';

import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    NgxPaginationModule,
    StoreModule.forFeature('dictionary', dictionaryReducer),
    StoreModule.forFeature('indicatorsList', indicatorsListReducer),
    StoreModule.forFeature('allIndicators', allIndicatorsRedcuer),
    StoreModule.forFeature('indicatorGroups', indicatorGroupsReducer),
    EffectsModule.forFeature([DictionaryEffects]),
    EffectsModule.forFeature([IndicatorsEffects])
  ],

  declarations: [DictionaryListComponent, DictionaryProgressComponent, SearchIndicatorGroupPipe, FilterBySearchInputPipe, FilterIndicatorsByGroupIdPipe, ShortenNamePipe, IndicatorsListComponent, IndicatorPropertiesComponent],
  exports: [DictionaryListComponent],
  providers: [DatePipe, IndicatorsService]
})
export class NgxDhis2DictionaryModule {}
