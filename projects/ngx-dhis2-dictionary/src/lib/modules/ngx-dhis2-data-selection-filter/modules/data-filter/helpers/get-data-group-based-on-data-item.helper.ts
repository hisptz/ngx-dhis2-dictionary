import { DataGroup } from '../models/data-group.model';
import * as _ from 'lodash';

export function getDataGroupBasedOnDataItem(
  dataGroups: DataGroup[],
  dataItem: any
) {
  if (!dataItem) {
    return null;
  }
  const dataItems = _.flatten(
    _.map(dataGroups || [], (dataGroup: DataGroup) => {
      return _.map(dataGroup.members || [], member => {
        return {
          ...member,
          groupId: dataGroup.id
        };
      });
    })
  );

  const dataItemWithGroup = _.find(dataItems, ['id', dataItem.id]);

  return _.find(dataGroups, [
    'id',
    dataItemWithGroup ? dataItemWithGroup.groupId : undefined
  ]);
}
