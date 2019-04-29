import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { NgxDhis2SelectionFiltersModule } from '../ngx-dhis2-data-selection-filter/ngx-dhis2-selection-filters.module';
import { components } from './components/index';
import { containers } from './containers/index';
import { NgxDhis2ChartModule } from './modules/ngx-dhis-chart/ngx-dhis2-chart.module';
import { NgxDhis2TableModule } from './modules/ngx-dhis2-table/ngx-dhis2-table.module';
import { ReportsModule } from './modules/reports/reports.module';
import { pipes } from './pipes/index';
import { effects } from './store/effects/index';
import { reducers } from './store/reducers/index';

// store
// import { MapModule } from './modules/map/map.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule.forRoot(),
    StoreModule.forFeature('visualization', reducers),
    EffectsModule.forFeature(effects),
    NgxDhis2ChartModule,
    NgxDhis2TableModule,
    NgxDhis2SelectionFiltersModule,
    ReportsModule
  ],
  declarations: [...pipes, ...components, ...containers],
  exports: [...containers, ...components]
})
export class NgxDhis2VisualizationModule {}
