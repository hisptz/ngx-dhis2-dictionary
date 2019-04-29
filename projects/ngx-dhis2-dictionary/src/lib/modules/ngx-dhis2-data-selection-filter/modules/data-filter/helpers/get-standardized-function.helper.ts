import * as _ from 'lodash';

export function getStandardizedFunction(
  functionItem: any,
  isSelected?: boolean
) {
  return {
    ...functionItem,
    selected: isSelected,
    rules: _.filter(
      _.map(functionItem.rules || [], (rule: any) =>
        rule ? rule.id : undefined
      ),
      rule => rule
    )
  };
}
