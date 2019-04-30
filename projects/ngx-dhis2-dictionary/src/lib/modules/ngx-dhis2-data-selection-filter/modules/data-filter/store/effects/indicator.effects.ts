import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { withLatestFrom, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { State } from '../reducers/indicator.reducer';
import { IndicatorService } from '../../services/indicator.service';
import { getStandardizedIndicators } from '../../helpers/get-standardized-indicators.helper';
import {
  IndicatorActionTypes,
  LoadIndicators,
  LoadIndicatorsInitiated,
  AddIndicators,
  LoadIndicatorsFail
} from '../actions/indicator.actions';
import { getIndicatorsInitiatedStatus } from '../selectors/indicator.selectors';

@Injectable()
export class IndicatorEffects {
  @Effect()
  loadIndicators$: Observable<any> = this.actions$.pipe(
    ofType(IndicatorActionTypes.LoadIndicators),
    withLatestFrom(this.indicatorStore.select(getIndicatorsInitiatedStatus)),
    tap(([action, indicatorInitiated]: [LoadIndicators, boolean]) => {
      if (!indicatorInitiated) {
        this.indicatorStore.dispatch(new LoadIndicatorsInitiated());
        this.indicatorService.loadAll().subscribe(
          (indicators: any[]) => {
            this.indicatorStore.dispatch(
              new AddIndicators(getStandardizedIndicators(indicators))
            );
          },
          (error: any) => {
            this.indicatorStore.dispatch(new LoadIndicatorsFail(error));
          }
        );
      }
    })
  );

  constructor(
    private actions$: Actions,
    private indicatorService: IndicatorService,
    private indicatorStore: Store<State>
  ) {}
}
