import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import * as _ from 'lodash';
import { FunctionObject } from '../../models/function.model';
import {
  FunctionActions,
  FunctionActionTypes
} from '../actions/function.actions';
import { createFeatureSelector } from '@ngrx/store';

export interface State extends EntityState<FunctionObject> {
  // additional entities state properties
  loading: boolean;
  loaded: boolean;
  hasError: boolean;
  error: any;
  loadInitiated: boolean;
  activeFunctionId: string;
}

export const adapter: EntityAdapter<FunctionObject> = createEntityAdapter<
  FunctionObject
>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
  loading: false,
  loaded: false,
  loadInitiated: false,
  hasError: false,
  error: null,
  activeFunctionId: ''
});

export function reducer(state = initialState, action: FunctionActions): State {
  switch (action.type) {
    case FunctionActionTypes.LoadFunctionsInitiated: {
      return { ...state, loadInitiated: true };
    }
    case FunctionActionTypes.AddFunction: {
      return adapter.addOne(action.payload.function, state);
    }

    case FunctionActionTypes.UpsertFunction: {
      return adapter.upsertOne(action.functionObject, state);
    }

    case FunctionActionTypes.AddFunctions: {
      const selectedFunction = _.find(action.functions, ['selected', true]);
      return adapter.addMany(action.functions, {
        ...state,
        loaded: true,
        loading: false,
        activeFunctionId: selectedFunction
          ? selectedFunction.id
          : action.functions && action.functions[0]
          ? action.functions[0].id
          : ''
      });
    }

    case FunctionActionTypes.UpsertFunctions: {
      return adapter.upsertMany(action.payload.functions, state);
    }

    case FunctionActionTypes.UpdateFunction: {
      return adapter.updateOne(
        { id: action.id, changes: action.changes },
        state
      );
    }

    case FunctionActionTypes.UpdateFunctions: {
      return adapter.updateMany(action.payload.functions, state);
    }

    case FunctionActionTypes.DeleteFunction: {
      return adapter.removeOne(action.payload.id, state);
    }

    case FunctionActionTypes.DeleteFunctions: {
      return adapter.removeMany(action.payload.ids, state);
    }

    case FunctionActionTypes.LoadFunctions: {
      return {
        ...state,
        loading: state.loaded ? false : true,
        loaded: state.loaded,
        hasError: false,
        error: null
      };
    }

    case FunctionActionTypes.ClearFunctions: {
      return adapter.removeAll(state);
    }

    case FunctionActionTypes.SetActiveFunction: {
      return action.functionObject
        ? {
            ...state,
            activeFunctionId: action.functionObject.id
          }
        : state;
    }

    case FunctionActionTypes.UpdateActiveFunction: {
      const activeFunctionId = state.activeFunctionId;
      return activeFunctionId !== ''
        ? adapter.updateOne(
            { id: activeFunctionId, changes: { simulating: false } },
            state
          )
        : state;
    }

    case FunctionActionTypes.SaveFunction: {
      return action.functionObject
        ? adapter.updateOne(
            {
              id: action.functionObject.id,
              changes: { ...action.functionObject, saving: true }
            },
            state
          )
        : state;
    }

    case FunctionActionTypes.SaveFunctionSuccess: {
      return action.functionObject
        ? adapter.updateOne(
            {
              id: action.functionObject.id,
              changes: { ...action.functionObject, saving: false }
            },
            state
          )
        : state;
    }
    default: {
      return state;
    }
  }
}

export const getFunctionState = createFeatureSelector<State>('function');

export const {
  selectEntities: getFunctionEntities,
  selectAll: getAllFunctions
} = adapter.getSelectors(getFunctionState);
