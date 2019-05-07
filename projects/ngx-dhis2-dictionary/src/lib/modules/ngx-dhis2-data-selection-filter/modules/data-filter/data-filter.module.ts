import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { DragulaModule } from 'ng2-dragula';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxPaginationModule } from 'ngx-pagination';

import { DataFilterClickOutsideDirective } from './directives/click-outside.directive';
import { DataFilterGroupMemberComponent } from './components/data-filter-group-member/data-filter-group-member.component';
import { DataFilterGroupsComponent } from './components/data-filter-groups/data-filter-groups.component';
import { DataGroupItemComponent } from './components/data-group-item/data-group-item.component';
import { DataFilterComponent } from './containers/data-filter/data-filter.component';
import { AddUnderscorePipe } from './pipes/add-underscore.pipe';
import { FilterByNamePipe } from './pipes/filter-by-name.pipe';
import { OrderPipe } from './pipes/order-by.pipe';
import { RemoveSelectedItemsPipe } from './pipes/remove-selected-items.pipe';
import { DataFilterEffects } from './store/effects/data-filter.effects';
import { FunctionRuleEffects } from './store/effects/function-rule.effects';
import { FunctionEffects } from './store/effects/function.effects';
import { IndicatorGroupEffects } from './store/effects/indicator-group.effects';
import { IndicatorEffects } from './store/effects/indicator.effects';
import { reducer as dataFilterReducer } from './store/reducers/data-filter.reducer';
import { reducer as functionRuleReducer } from './store/reducers/function-rule.reducer';
import { reducer as functionReducer } from './store/reducers/function.reducer';
import { reducer as indicatorGroupReducer } from './store/reducers/indicator-group.reducer';
import { reducer as indicatorReducer } from './store/reducers/indicator.reducer';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpModule,
    DragulaModule,
    ColorPickerModule,
    NgxPaginationModule,
    StoreModule.forFeature('dataFilter', dataFilterReducer),
    StoreModule.forFeature('function', functionReducer),
    StoreModule.forFeature('functionRule', functionRuleReducer),
    StoreModule.forFeature('indicatorGroup', indicatorGroupReducer),
    StoreModule.forFeature('indicator', indicatorReducer),
    EffectsModule.forFeature([
      DataFilterEffects,
      FunctionEffects,
      FunctionRuleEffects,
      IndicatorEffects,
      IndicatorGroupEffects
    ])
  ],
  declarations: [
    DataFilterClickOutsideDirective,
    AddUnderscorePipe,
    FilterByNamePipe,
    OrderPipe,
    RemoveSelectedItemsPipe,
    DataFilterComponent,
    DataFilterGroupsComponent,
    DataGroupItemComponent,
    DataFilterGroupMemberComponent
  ],
  exports: [DataFilterComponent],
  providers: []
})
export class DataFilterModule {}
