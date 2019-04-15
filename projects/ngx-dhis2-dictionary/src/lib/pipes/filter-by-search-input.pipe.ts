import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterBySearchInput',
  pure: false
})
export class FilterBySearchInputPipe implements PipeTransform {

  transform(indicators: any[], searchingText: any): any {
    const splittedName = searchingText ? searchingText.split(/[\.\-_,; ]/) : [];
    return splittedName.length > 0
      ? indicators.filter((item: any) =>
          splittedName.some(
            (nameString: string) =>
              item.name.toLowerCase().indexOf(nameString.toLowerCase()) !== -1
          )
        )
      : indicators;
  }

}
