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

import { FunctionObject } from '../../models/function.model';
import { FunctionService } from '../../services/function.service';
import { getSelectedFunctionRule } from '../../helpers/get-selected-function-rule.helper';
import {
  FunctionActionTypes,
  LoadFunctions,
  LoadFunctionsInitiated,
  AddFunctions,
  LoadFunctionsFail,
  SaveFunction,
  SaveFunctionSuccess,
  SaveFunctionFails
} from '../actions/function.actions';
import {
  getFunctionInitiatedStatus,
  getFunctionById
} from '../selectors/function.selectors';
import { getStandardizedFunctions } from '../../helpers/get-standardized-functions.helper';
import { getStandardizedFunctionRulesFromFunctionList } from '../../helpers/get-standardized-function-rule-from-function-list.helpers';
import { getStandardizedFunction } from '../../helpers/get-standardized-function.helper';
import { State } from '../reducers/function.reducer';
@Injectable()
export class FunctionEffects {
  @Effect({ dispatch: false })
  loadFunctions$: Observable<any> = this.actions$.pipe(
    ofType(FunctionActionTypes.LoadFunctions),
    withLatestFrom(this.functionStore.select(getFunctionInitiatedStatus)),
    tap(([action, functionInitiated]: [LoadFunctions, boolean]) => {
      if (!functionInitiated) {
        this.functionStore.dispatch(new LoadFunctionsInitiated());
        this.functionService.loadAll(action.currentUser).subscribe(
          (functions: FunctionObject[]) => {
            const standardizedFunctions = getStandardizedFunctions(
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
              new AddFunctions(
                standardizedFunctions,
                getStandardizedFunctionRulesFromFunctionList(
                  functions,
                  selectedRuleId
                )
              )
            );
          },
          (error: any) => {
            this.functionStore.dispatch(new LoadFunctionsFail(error));
          }
        );
      }
    })
  );

  @Effect()
  saveFunction$: Observable<any> = this.actions$.pipe(
    ofType(FunctionActionTypes.SaveFunction),
    mergeMap((action: SaveFunction) => {
      return this.functionStore
        .select(
          getFunctionById(action.functionObject ? action.functionObject.id : '')
        )
        .pipe(
          take(1),
          mergeMap((functionObject: FunctionObject) =>
            this.functionService.save(functionObject, action.currentUser).pipe(
              map(
                (savedFunctionObject: FunctionObject) =>
                  new SaveFunctionSuccess(
                    getStandardizedFunction(savedFunctionObject)
                  )
              ),
              catchError(error =>
                of(new SaveFunctionFails(functionObject, error))
              )
            )
          )
        );
    })
  );

  constructor(
    private actions$: Actions,
    private functionService: FunctionService,
    private functionStore: Store<State>
  ) {}
}
