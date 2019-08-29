import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { NgxPaginationModule } from 'ngx-pagination';

import { DataElementGroupComponent } from './components/dictionary-list/data-element-group/data-element-group.component';
import { DataElementComponent } from './components/dictionary-list/data-element/data-element.component';
import { DataSetComponent } from './components/dictionary-list/data-set/data-set.component';
import { DictionaryListComponent } from './components/dictionary-list/dictionary-list.component';
import { FunctionsComponent } from './components/dictionary-list/functions/functions.component';
import { ProgramIndicatorComponent } from './components/dictionary-list/program-indicator/program-indicator.component';
import { DictionaryProgressComponent } from './components/dictionary-progress/dictionary-progress.component';
import { IndicatorPropertiesComponent } from './components/metadata-list/indicators-list/indicator-properties/indicator-properties.component';
import { IndicatorsListComponent } from './components/metadata-list/indicators-list/indicators-list.component';
import { MetadataListComponent } from './components/metadata-list/metadata-list.component';
import { ProgramIndicatorPropertiesComponent } from './components/metadata-list/program-indicators/program-indicator-properties/program-indicator-properties.component';
import { ProgramIndicatorsComponent } from './components/metadata-list/program-indicators/program-indicators.component';
import { NgxDhis2VisualizationModule } from './modules/ngx-dhis2-visualization/ngx-dhis2-visualization.module';
import { FilterBySearchInputPipe } from './pipes/filter-by-search-input.pipe';
import { FilterIndicatorsByGroupIdPipe } from './pipes/filter-indicators-by-group-id.pipe';
import { SearchIndicatorGroupPipe } from './pipes/search-indicator-group.pipe';
import { ShortenNamePipe } from './pipes/shorten-name.pipe';
import { ExportService } from './services/export.service';
import { IndicatorsService } from './services/indicators.service';
import { SwitchingBtnsComponent } from './shared/switching-btns/switching-btns.component';
import { DictionaryEffects } from './store/effects/dictionary.effects';
import { IndicatorsEffects } from './store/effects/indicators.effects';
import { dictionaryReducer } from './store/reducers/dictionary.reducer';
import {
  allIndicatorsRedcuer,
  indicatorGroupsReducer,
  indicatorsListReducer,
  programIndicatorsListReducer
} from './store/reducers/indicators.reducers';
import { VisualizationContainerComponent } from './components/visualization-container/visualization-container.component';
@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    NgxPaginationModule,
    NgxDhis2VisualizationModule,
    StoreModule.forFeature('dictionary', dictionaryReducer),
    StoreModule.forFeature('indicatorsList', indicatorsListReducer),
    StoreModule.forFeature(
      'programIndicatorsList',
      programIndicatorsListReducer
    ),
    StoreModule.forFeature('allIndicators', allIndicatorsRedcuer),
    StoreModule.forFeature('indicatorGroups', indicatorGroupsReducer),
    EffectsModule.forFeature([DictionaryEffects]),
    EffectsModule.forFeature([IndicatorsEffects])
  ],

  declarations: [
    DictionaryListComponent,
    DictionaryProgressComponent,
    SearchIndicatorGroupPipe,
    FilterBySearchInputPipe,
    FilterIndicatorsByGroupIdPipe,
    ShortenNamePipe,
    IndicatorsListComponent,
    IndicatorPropertiesComponent,
    SwitchingBtnsComponent,
    MetadataListComponent,
    ProgramIndicatorsComponent,
    ProgramIndicatorPropertiesComponent,
    DataSetComponent,
    DataElementComponent,
    ProgramIndicatorComponent,
    DataElementGroupComponent,
    FunctionsComponent,
    VisualizationContainerComponent
  ],
  exports: [DictionaryListComponent],
  providers: [DatePipe, IndicatorsService, ExportService]
})
export class NgxDhis2DictionaryModule {}
