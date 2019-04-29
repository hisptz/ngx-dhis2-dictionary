import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { DragulaModule } from 'ng2-dragula';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxPaginationModule } from 'ngx-pagination';

import { components } from './components/index';
import { containers } from './containers/index';
import { directives } from './directives/index';
import { pipes } from './pipes/index';
import * as fromDataGroupEffects from './store/effects/index';
import * as fromDataFilterReducer from './store/reducers/data-filter.reducer';
import * as fromFunctionRuleReducer from './store/reducers/function-rule.reducer';
import * as fromFunctionReducer from './store/reducers/function.reducer';
import * as fromIndicatorGroupReducer from './store/reducers/indicator-group.reducer';
import * as fromIndicatorReducer from './store/reducers/indicator.reducer';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpModule,
    DragulaModule,
    ColorPickerModule,
    NgxPaginationModule,
    StoreModule.forFeature('dataFilter', fromDataFilterReducer.reducer),
    StoreModule.forFeature('function', fromFunctionReducer.reducer),
    StoreModule.forFeature('functionRule', fromFunctionRuleReducer.reducer),
    StoreModule.forFeature('indicatorGroup', fromIndicatorGroupReducer.reducer),
    StoreModule.forFeature('indicator', fromIndicatorReducer.reducer),
    EffectsModule.forFeature(fromDataGroupEffects.effects)
  ],
  declarations: [...directives, ...pipes, ...containers, ...components],
  exports: [...containers],
  providers: []
})
export class DataFilterModule {}
