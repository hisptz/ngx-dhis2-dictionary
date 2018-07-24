import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { DictionaryListComponent } from './components/dictionary-list/dictionary-list.component';
import { DictionaryProgressComponent } from './components/dictionary-progress/dictionary-progress.component';
import { dictionaryReducer } from './store/reducers/dictionary.reducer';
import { DictionaryEffects } from './store/effects/dictionary.effects';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    StoreModule.forFeature('dictionary', dictionaryReducer),
    EffectsModule.forFeature([DictionaryEffects])
  ],

  declarations: [DictionaryListComponent, DictionaryProgressComponent],
  exports: [DictionaryListComponent],
  providers: [DatePipe]
})
export class NgxDhis2DictionaryModule {}
