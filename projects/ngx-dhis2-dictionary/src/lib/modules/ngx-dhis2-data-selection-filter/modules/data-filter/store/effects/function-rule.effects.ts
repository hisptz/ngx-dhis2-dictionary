import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FunctionActionTypes, AddFunctions } from '../actions/function.actions';
import { AddFunctionRules } from '../actions/function-rule.actions';

@Injectable()
export class FunctionRuleEffects {
  @Effect()
  addFunctions$: Observable<any> = this.actions$.pipe(
    ofType(FunctionActionTypes.AddFunctions),
    map((action: AddFunctions) => new AddFunctionRules(action.functionRules))
  );
  constructor(private actions$: Actions) {}
}
