import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import * as indicators from '../actions/indicators.actions';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import { switchMap, map, catchError, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { IndicatorsService } from '../../services/indicators.service';
import { IndicatorGroupsState } from '../state/indicators.state';

@Injectable()
export class IndicatorsEffects {
  @Effect()
  indicatorsList$: Observable<any> = this.actions$.pipe(
    ofType<indicators.IndicatorsAction>(
      indicators.IndicatorsActions.LoadIndicators
    ),
    switchMap(() =>
      this.httpClient.get('indicators.json').pipe(
        map(
          (indicatorsListObject: any) =>
            new indicators.loadIndicatorsSuccessAction(indicatorsListObject)
        ),
        catchError(error => of(new indicators.loadIndicatorsFailAction(error)))
      )
    )
  );

  @Effect()
  programIndicatorsList$: Observable<any> = this.actions$.pipe(
    ofType<indicators.IndicatorsAction>(
      indicators.IndicatorsActions.LoadProgramIndicators
    ),
    switchMap(() =>
      this.httpClient.get('programIndicators.json').pipe(
        map(
          (programIndicatorsListObject: any) =>
            new indicators.loadProgramIndicatorsSuccessAction(
              programIndicatorsListObject
            )
        ),
        catchError(error => of(new indicators.loadIndicatorsFailAction(error)))
      )
    )
  );

  @Effect()
  indicatorGroups$: Observable<any> = this.actions$.pipe(
    ofType<indicators.IndicatorsAction>(
      indicators.IndicatorsActions.LoadIndicatorGroups
    ),
    switchMap(() =>
      this.httpClient
        .get(
          'indicatorGroups.json?fields=id,name,description,indicators[id]&paging=false'
        )
        .pipe(
          map(
            (indicatorGroupsObject: IndicatorGroupsState) =>
              new indicators.LoadIndicatorGroupsSuccessAction(
                indicatorGroupsObject
              )
          ),
          catchError(error =>
            of(new indicators.LoadIndicatorGroupsFailAction(error))
          )
        )
    )
  );

  @Effect({ dispatch: false })
  indicatorsListSuccess$: Observable<any> = this.actions$.pipe(
    ofType<indicators.IndicatorsAction>(
      indicators.IndicatorsActions.LoadIndicatorsSuccess
    ),
    tap((action: any) => {
      let indicatorsArr: any[] = [];
      this.indicatorService
        ._loadAllIndicators(action.payload['pager'])
        .subscribe(allIndicators => {
          indicatorsArr = [...indicatorsArr, ...allIndicators['indicators']];
          this.store.dispatch(
            new indicators.LoadIndicatorsByPagesSuccessAction(indicatorsArr)
          );
        });
    })
  );

  @Effect({ dispatch: false })
  programIndicator$: Observable<any> = this.actions$.pipe(
    ofType<indicators.IndicatorsAction>(
      indicators.IndicatorsActions.LoadProgramIndicatorsSuccess
    ),
    tap((action: any) => {
      let programIndicatorsArr: any[] = [];
      this.indicatorService
        ._loadAllProgramIndicators(action.payload['pager'])
        .subscribe(allIndicators => {
          programIndicatorsArr = [
            ...programIndicatorsArr,
            ...allIndicators['programIndicators']
          ];
          this.store.dispatch(
            new indicators.LoadProgramIndicatorsByPagesSuccessAction(
              programIndicatorsArr
            )
          );
        });
    })
  );

  constructor(
    private actions$: Actions,
    private store: Store<any>,
    private httpClient: NgxDhis2HttpClientService,
    private indicatorService: IndicatorsService
  ) {}
}
