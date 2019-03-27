import { Injectable } from "@angular/core";
import { Effect, Actions, ofType } from "@ngrx/effects";
import { Observable, of } from "rxjs";
import * as indicators from '../actions/indicators.actions';
import { NgxDhis2HttpClientService } from "@hisptz/ngx-dhis2-http-client";
import { switchMap, map, catchError, tap } from "rxjs/operators";
import { Store } from "@ngrx/store";
import { IndicatorsService } from "../../services/indicators.service";


@Injectable()
export class IndicatorsEffects {

    @Effect()
    indicatorsList$: Observable<any> = this.actions$
    .pipe(ofType<indicators.IndicatorsAction>(indicators.IndicatorsActions.LoadIndicators),
        switchMap(() => this.httpClient.get('indicators.json').pipe(
          map((indicatorsListObject: any) =>
            new indicators.loadIndicatorsSuccessAction(indicatorsListObject)),
          catchError((error) => of(new indicators.loadIndicatorsFailAction(error)))
        ))
    );

    @Effect()
    programIndicatorsList$: Observable<any> = this.actions$
    .pipe(ofType<indicators.IndicatorsAction>(indicators.IndicatorsActions.LoadIndicators),
        switchMap(() => this.httpClient.get('programIndicators.json').pipe(
          map((indicatorsListObject: any) =>
            new indicators.loadIndicatorsSuccessAction(indicatorsListObject)),
          catchError((error) => of(new indicators.loadIndicatorsFailAction(error)))
        ))
    );


    @Effect({dispatch: false})
    indicatorsListSuccess$: Observable<any> = this.actions$
    .pipe(
      ofType<indicators.IndicatorsAction>(indicators.IndicatorsActions.LoadIndicatorsSuccess),
      tap((action: any) => {
        let indicatorsArr: any[] = [];
        this.indicatorService._loadAllIndicators(action.payload['pager']).subscribe((allIndicators) => {
          indicatorsArr = [...indicatorsArr, ...allIndicators]
          this.store.dispatch(new indicators.LoadIndicatorsByPagesSuccessAction(indicatorsArr));
        });
      })
    )

    constructor(private actions$: Actions, 
        private store: Store<any>, 
        private httpClient: NgxDhis2HttpClientService,
        private indicatorService: IndicatorsService) {}
}