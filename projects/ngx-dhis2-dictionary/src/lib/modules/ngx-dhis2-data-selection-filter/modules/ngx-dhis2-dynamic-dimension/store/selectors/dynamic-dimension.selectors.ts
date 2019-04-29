import * as fromDynamicDimension from '../reducers/dynamic-dimension.reducer';
import * as _ from 'lodash';
import { createSelector } from '@ngrx/store';
import { DynamicDimension } from '../models/dynamic-dimension.model';

export const getDynamicDimensionInitiatedStatus = createSelector(
  fromDynamicDimension.getDynamicDimensionState,
  (state: fromDynamicDimension.State) => state.loadInitiated
);

export const getAllowedDynamicDimensions = createSelector(
  fromDynamicDimension.getDynamicDimensionState,
  (state: fromDynamicDimension.State) => state.allowedDimensions
);

export const getDynamicDimensionLoadingStatus = createSelector(
  fromDynamicDimension.getDynamicDimensionState,
  (state: fromDynamicDimension.State) => state.loading
);

export const getDynamicDimensions = (allowedDimensions?: string[]) =>
  createSelector(
    fromDynamicDimension.getAllDynamicDimensions,
    (dynamicDimensions: DynamicDimension[]) =>
      allowedDimensions && allowedDimensions.length > 0
        ? _.filter(
            dynamicDimensions,
            (dynamicDimension: any) =>
              allowedDimensions.indexOf(dynamicDimension.id) !== -1
          )
        : dynamicDimensions
  );
