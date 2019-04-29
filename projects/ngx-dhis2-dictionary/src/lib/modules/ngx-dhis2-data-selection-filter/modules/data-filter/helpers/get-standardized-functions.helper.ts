import * as _ from 'lodash';
import { FunctionObject } from '../models/function.model';
import { getStandardizedFunction } from './get-standardized-function.helper';

export function getStandardizedFunctions(
  functionList,
  selectedFunctionId: string = ''
): FunctionObject[] {
  const selectedFunction =
    _.find(functionList || [], ['id', selectedFunctionId]) ||
    (functionList || [])[0];

  return _.filter(
    _.map(
      functionList || [],
      (functionItem: any, functionItemIndex: number) => {
        if (!functionItem) {
          return null;
        }

        return getStandardizedFunction(
          functionItem,
          selectedFunction && selectedFunction.id === functionItem.id
        );
      }
    )
  );
}
