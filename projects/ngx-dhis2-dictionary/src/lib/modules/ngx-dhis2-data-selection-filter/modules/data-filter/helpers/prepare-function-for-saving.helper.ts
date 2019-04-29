import { FunctionObject, FunctionRule } from '../models';
import * as _ from 'lodash';
import { getInitialFunctionStructure } from './get-initial-function-structure.helper';

export function prepareFunctionForSaving(
  functionObject: FunctionObject,
  contextPath: string,
  currentUser: any
) {
  if (!functionObject) {
    return null;
  }

  const initialFunctionObjectForSaving = getInitialFunctionStructure(
    functionObject,
    contextPath
  );

  return _.omit(
    initialFunctionObjectForSaving.isNew
      ? {
          ...initialFunctionObjectForSaving,
          created: initialFunctionObjectForSaving.lastUpdated,
          user: currentUser
            ? {
                id: currentUser.id
              }
            : null
        }
      : initialFunctionObjectForSaving,
    ['selected', 'active', 'isNew', 'simulating', 'saving']
  );
}
