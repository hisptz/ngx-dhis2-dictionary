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
import { indicatorsListReducer, allIndicatorsRedcuer, indicatorGroupsReducer, programIndicatorsListReducer } from './store/reducers/indicators.reducers';
import { IndicatorsEffects } from './store/effects/indicators.effects';

import { DictionaryListComponent } from './components/dictionary-list/dictionary-list.component';
import { DictionaryProgressComponent } from './components/dictionary-progress/dictionary-progress.component';
import { dictionaryReducer } from './store/reducers/dictionary.reducer';
import { DictionaryEffects } from './store/effects/dictionary.effects';
import { IndicatorsService } from './services/indicators.service';
// import { IndicatorsListComponent } from './components/metadata-list/indicators-list/indicators-list.component';
// import { IndicatorPropertiesComponent } from './components/metadata-list/indicators-list/indicator-properties/indicator-properties.component';

import { NgxPaginationModule } from 'ngx-pagination';
import { SwitchingBtnsComponent } from './shared/switching-btns/switching-btns.component';
import { MetadataListComponent } from './components/metadata-list/metadata-list.component';
import { IndicatorPropertiesComponent } from './components/metadata-list/indicators-list/indicator-properties/indicator-properties.component';
import { IndicatorsListComponent } from './components/metadata-list/indicators-list/indicators-list.component';
import { ProgramIndicatorsComponent } from './components/metadata-list/program-indicators/program-indicators.component';
import { ProgramIndicatorPropertiesComponent } from './components/metadata-list/program-indicators/program-indicator-properties/program-indicator-properties.component';
import { ExportService } from './services/export.service';
import { DataSetComponent } from './components/dictionary-list/data-set/data-set.component';
import { DataElementComponent } from './components/dictionary-list/data-element/data-element.component';
import { ProgramIndicatorComponent } from './components/dictionary-list/program-indicator/program-indicator.component';
import { DataElementGroupComponent } from './components/dictionary-list/data-element-group/data-element-group.component';
import { FunctionsComponent } from './components/dictionary-list/functions/functions.component';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    NgxPaginationModule,
    StoreModule.forFeature('dictionary', dictionaryReducer),
    StoreModule.forFeature('indicatorsList', indicatorsListReducer),
    StoreModule.forFeature('programIndicatorsList', programIndicatorsListReducer),
    StoreModule.forFeature('allIndicators', allIndicatorsRedcuer),
    StoreModule.forFeature('indicatorGroups', indicatorGroupsReducer),
    EffectsModule.forFeature([DictionaryEffects]),
    EffectsModule.forFeature([IndicatorsEffects])
  ],

  declarations: [DictionaryListComponent, DictionaryProgressComponent, SearchIndicatorGroupPipe, FilterBySearchInputPipe, FilterIndicatorsByGroupIdPipe, ShortenNamePipe, IndicatorsListComponent, IndicatorPropertiesComponent, SwitchingBtnsComponent, MetadataListComponent, ProgramIndicatorsComponent, ProgramIndicatorPropertiesComponent, DataSetComponent, DataElementComponent, ProgramIndicatorComponent, DataElementGroupComponent, FunctionsComponent],
  exports: [DictionaryListComponent],
  providers: [DatePipe, IndicatorsService, ExportService]
})
export class NgxDhis2DictionaryModule {}
