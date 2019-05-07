import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { withLatestFrom, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import {
  IndicatorGroupActionTypes,
  LoadIndicatorGroups,
  LoadIndicatorGroupsInitiated,
  AddIndicatorGroups,
  LoadIndicatorGroupsFail
} from '../actions/indicator-group.actions';
import { getIndicatorGroupsInitiatedStatus } from '../selectors/indicator-group.selectors';
import { getStandardizedIndicatorGroups } from '../../helpers/get-standardized-indicator-groups.helper';
import { IndicatorGroupService } from '../../services/indicator-group.service';
import { State } from '../reducers/indicator-group.reducer';

@Injectable()
export class IndicatorGroupEffects {
  @Effect({ dispatch: false })
  loadIndicatorGroups$: Observable<any> = this.actions$.pipe(
    ofType(IndicatorGroupActionTypes.LoadIndicatorGroups),
    withLatestFrom(
      this.indicatorGroupStore.select(getIndicatorGroupsInitiatedStatus)
    ),
    tap(([action, indicatorGroupInitiated]: [LoadIndicatorGroups, boolean]) => {
      if (!indicatorGroupInitiated) {
        this.indicatorGroupStore.dispatch(new LoadIndicatorGroupsInitiated());
        this.indicatorGroupService.loadAll().subscribe(
          (indicatorGroups: any[]) => {
            this.indicatorGroupStore.dispatch(
              new AddIndicatorGroups(
                getStandardizedIndicatorGroups(indicatorGroups)
              )
            );
          },
          (error: any) => {
            this.indicatorGroupStore.dispatch(
              new LoadIndicatorGroupsFail(error)
            );
          }
        );
      }
    })
  );

  constructor(
    private actions$: Actions,
    private indicatorGroupService: IndicatorGroupService,
    private indicatorGroupStore: Store<State>
  ) {}
}
