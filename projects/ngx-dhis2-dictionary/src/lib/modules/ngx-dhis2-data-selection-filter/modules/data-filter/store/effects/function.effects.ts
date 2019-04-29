import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import {
  withLatestFrom,
  tap,
  map,
  mergeMap,
  take,
  catchError
} from 'rxjs/operators';

import * as fromFunctionReducer from '../reducers/function.reducer';

import * as fromFunctionActions from '../actions/function.actions';
import * as fromFuctionSelectors from '../selectors/function.selectors';
import * as fromHelpers from '../../helpers';

import { FunctionObject } from '../../models/function.model';
import { FunctionService } from '../../services/function.service';
import { getStandardizedFunction } from '../../helpers';
import { getSelectedFunctionRule } from '../../helpers/get-selected-function-rule.helper';

@Injectable()
export class FunctionEffects {
  @Effect({ dispatch: false })
  loadFunctions$: Observable<any> = this.actions$.pipe(
    ofType(fromFunctionActions.FunctionActionTypes.LoadFunctions),
    withLatestFrom(
      this.functionStore.select(fromFuctionSelectors.getFunctionInitiatedStatus)
    ),
    tap(
      ([action, functionInitiated]: [
        fromFunctionActions.LoadFunctions,
        boolean
      ]) => {
        if (!functionInitiated) {
          this.functionStore.dispatch(
            new fromFunctionActions.LoadFunctionsInitiated()
          );
          this.functionService.loadAll(action.currentUser).subscribe(
            (functions: FunctionObject[]) => {
              const standardizedFunctions = fromHelpers.getStandardizedFunctions(
                functions,
                action.routeParams ? action.routeParams.function || '' : ''
              );
              const selectedFunction = _.find(standardizedFunctions, [
                'selected',
                true
              ]);

              const selectedRuleId = getSelectedFunctionRule(
                selectedFunction.rules || [],
                action.routeParams ? action.routeParams.rule || '' : ''
              );

              this.functionStore.dispatch(
                new fromFunctionActions.AddFunctions(
                  standardizedFunctions,
                  fromHelpers.getStandardizedFunctionRulesFromFunctionList(
                    functions,
                    selectedRuleId
                  )
                )
              );
            },
            (error: any) => {
              this.functionStore.dispatch(
                new fromFunctionActions.LoadFunctionsFail(error)
              );
            }
          );
        }
      }
    )
  );

  @Effect()
  saveFunction$: Observable<any> = this.actions$.pipe(
    ofType(fromFunctionActions.FunctionActionTypes.SaveFunction),
    mergeMap((action: fromFunctionActions.SaveFunction) => {
      return this.functionStore
        .select(
          fromFuctionSelectors.getFunctionById(
            action.functionObject ? action.functionObject.id : ''
          )
        )
        .pipe(
          take(1),
          mergeMap((functionObject: FunctionObject) =>
            this.functionService.save(functionObject, action.currentUser).pipe(
              map(
                (savedFunctionObject: FunctionObject) =>
                  new fromFunctionActions.SaveFunctionSuccess(
                    getStandardizedFunction(savedFunctionObject)
                  )
              ),
              catchError(error =>
                of(
                  new fromFunctionActions.SaveFunctionFails(
                    functionObject,
                    error
                  )
                )
              )
            )
          )
        );
    })
  );

  constructor(
    private actions$: Actions,
    private functionService: FunctionService,
    private functionStore: Store<fromFunctionReducer.State>
  ) {}
}
