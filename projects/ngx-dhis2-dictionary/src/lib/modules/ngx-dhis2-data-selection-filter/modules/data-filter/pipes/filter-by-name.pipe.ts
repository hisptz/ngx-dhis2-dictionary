import { Pipe, PipeTransform } from '@angular/core';
import { filterByName } from '../helpers/filter-by-name.helper';

@Pipe({
  name: 'filterByName'
})
export class FilterByNamePipe implements PipeTransform {
  transform(list: any[], name: any): any {
    return filterByName(list, name);
  }
}
