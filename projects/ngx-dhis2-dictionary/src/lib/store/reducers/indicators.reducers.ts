import { EntityState, EntityAdapter, createEntityAdapter } from "@ngrx/entity";

import {
  IndicatorsState,
  AllIndicatorsState,
  IndicatorGroupsState,
  programIndicatorGroupsState
} from "../state/indicators.state";
import {
  IndicatorsAction,
  IndicatorsActions
} from "../actions/indicators.actions";
import { ActionReducerMap } from "@ngrx/store";

export interface State extends EntityState<AllIndicatorsState> {
  indicators: any;
  programIndicators: any;
  progressLoadingValue: number;
}

export const adapter: EntityAdapter<AllIndicatorsState> = createEntityAdapter<
  AllIndicatorsState
>();

export const INITIAL_STATE_LOADED_INDICATORS: State = adapter.getInitialState({
  indicators: null,
  programIndicators: null,
  progressLoadingValue: 0
});

export function indicatorsListReducer(
  state: IndicatorsState = null,
  action: IndicatorsAction
) {
  switch (action.type) {
    case IndicatorsActions.LoadIndicatorsSuccess:
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
}

export function programIndicatorsListReducer(
  state: any = null,
  action: IndicatorsAction
) {
  switch (action.type) {
    case IndicatorsActions.LoadProgramIndicatorsSuccess:
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
}

export function allIndicatorsRedcuer(
  state: AllIndicatorsState = INITIAL_STATE_LOADED_INDICATORS,
  action: IndicatorsAction
) {
  switch (action.type) {
    case IndicatorsActions.LoadIndicatorsByPagesSuccess:
      return {
        ...state,
        indicators: action.payload
      };
    case IndicatorsActions.LoadProgramIndicatorsByPagesSuccess:
      return {
        ...state,
        programIndicators: action.payload
      };
    default:
      return state;
  }
}

export function indicatorGroupsReducer(
  state: IndicatorGroupsState = null,
  action: IndicatorsAction
) {
  switch (action.type) {
    case IndicatorsActions.LoadIndicatorGroupsSuccess:
      return {
        ...action.payload
      };
    default:
      return state;
  }
}

export function programIndicatorGroupsReducer(
  state: programIndicatorGroupsState = null,
  action: IndicatorsAction
) {
  switch (action.type) {
    case IndicatorsActions.LoadProgramIndicatorGroupsSuccess:
      return {
        ...action.payload
      };
    default:
      return state;
  }
}

export interface AppState {
  indicatorsList: IndicatorsState;
  programIndicatorsList: any;
  allIndicators: AllIndicatorsState;
  indicatorGroups: IndicatorGroupsState;
  programIndicatorGroups: programIndicatorGroupsState;
}

export const indicatorsReducers: ActionReducerMap<AppState> = {
  indicatorsList: indicatorsListReducer,
  programIndicatorsList: programIndicatorsListReducer,
  allIndicators: allIndicatorsRedcuer,
  indicatorGroups: indicatorGroupsReducer,
  programIndicatorGroups: programIndicatorGroupsReducer
};
