import { DataGroup } from '../models/data-group.model';
import * as _ from 'lodash';

export function removeAllMembersFromGroups(dataGroups: DataGroup[]) {
  return _.map(dataGroups || [], (dataGroup: DataGroup) => {
    return {
      ...dataGroup,
      members: []
    };
  });
}
