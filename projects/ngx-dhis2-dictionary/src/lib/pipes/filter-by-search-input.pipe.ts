import { Pipe, PipeTransform } from "@angular/core";
import * as _ from "lodash";

@Pipe({
  name: "filterBySearchInput",
  pure: false
})
export class FilterBySearchInputPipe implements PipeTransform {
  transform(indicators: any[], searchingText: any): any {
    if (searchingText !== undefined && indicators !== null) {
      if (indicators.length > 0 && searchingText != "") {
        let splittedText = searchingText;
        [",", "[", "]", "(", ")", ",", ".", "-", "_"].forEach(char => {
          splittedText = splittedText.split(char).join(" ");
        });
        let newIndicators = [];

        splittedText.split(" ").forEach(partOfSearchingText => {
          _.map(newIndicators, formattedIndicator => {
            if (
              formattedIndicator.name
                .toLowerCase()
                .indexOf(partOfSearchingText.toLowerCase()) > -1
            ) {
              newIndicators[
                _.findIndex(newIndicators, {
                  id: formattedIndicator.id
                })
              ]["priority"] += 1;
            }
          });

          _.map(indicators, indicator => {
            if (
              indicator.name
                .toLowerCase()
                .indexOf(partOfSearchingText.toLowerCase()) > -1 &&
              _.findIndex(newIndicators, {
                id: indicator.id
              }) == -1
            ) {
              indicator["priority"] = 1;
              newIndicators.push(indicator);
            }
          });
        });

        indicators = _.orderBy(newIndicators, ["priority"], ["desc"]);
        // return indicators.filter(indicator => {
        //   let foundIndicatorMatchingSearchingInput = true;
        //   splittedText.split(" ").forEach(partOfSearchingText => {
        //     if (
        //       indicator.name
        //         .toLowerCase()
        //         .indexOf(partOfSearchingText.toLowerCase()) === -1
        //     ) {
        //       foundIndicatorMatchingSearchingInput = false;
        //     }
        //   });
        //   return foundIndicatorMatchingSearchingInput;
        // });
      }
    }
    return indicators;
  }
}
