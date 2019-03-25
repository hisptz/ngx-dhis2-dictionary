import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';

import * as _ from 'lodash';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { Observable, from, forkJoin, of } from 'rxjs';

import { NgxDhis2HttpClientService } from '@hisptz/ngx-dhis2-http-client';
import { DictionaryState } from '../reducers/dictionary.reducer';

import {
  DictionaryActionTypes,
  InitializeDictionaryMetadataAction,
  AddDictionaryMetadataListAction,
  UpdateDictionaryMetadataAction
} from '../actions/dictionary.actions';
import { getDictionaryList } from '../selectors/dictionary.selectors';

@Injectable()
export class DictionaryEffects {
    identifierIds = [];
  constructor(
    private actions$: Actions,
    private store: Store<DictionaryState>,
    private httpClient: NgxDhis2HttpClientService,
    private datePipe: DatePipe
  ) {}

  @Effect({ dispatch: false })
  initializeDictionary$: Observable<any> = this.actions$.pipe(
    ofType(DictionaryActionTypes.InitializeDictionaryMetadata),
    mergeMap((action: InitializeDictionaryMetadataAction) =>
      this.store
        .select(getDictionaryList(action.dictionaryMetadataIdentifiers))
        .pipe(
          map((dictionaryList: any[]) =>
            _.filter(
              action.dictionaryMetadataIdentifiers,
              metadataId => !_.find(dictionaryList, ['id', metadataId])
            )
          )
        )
    ),
    tap((identifiers: any) => {
      /**
       * Add incoming items to the dictionary list
       */
      this.store.dispatch(
        new AddDictionaryMetadataListAction(
          _.map(identifiers, id => {
            return {
              id,
              name: '',
              description: '',
              progress: {
                loading: true,
                loadingSucceeded: false,
                loadingFailed: false
              }
            };
          })
        )
      );
      /**
       * Identify corresponding dictionary items
       */
      from(identifiers)
        .pipe(
          mergeMap((identifier: any) => {
                return this.httpClient.get(`identifiableObjects/${identifier}.json`, true).pipe(catchError((err) => of(identifier)))
            }
          )
        )
        .subscribe((metadata: any) => {
            if(metadata.href) {
                this.store.dispatch(
                new UpdateDictionaryMetadataAction(metadata.id, {
                    name: metadata.name,
                    progress: {
                    loading: true,
                    loadingSucceeded: true,
                    loadingFailed: false
                    }
                })
                );
                if (metadata.href && metadata.href.indexOf('indicator') !== -1) {
                const indicatorUrl =
                    'indicators/' +
                    metadata.id +
                    '.json?fields=:all,user[name,email,phoneNumber],displayName,lastUpdatedBy[id,name,phoneNumber,email],id,name,numeratorDescription,' +
                    'denominatorDescription,denominator,numerator,annualized,decimals,indicatorType[name],user[name],' +
                    'attributeValues[value,attribute[name]],indicatorGroups[name,indicators~size],legendSet[name,symbolizer,' +
                    'legends~size],dataSets[name]';
                this.getIndicatorInfo(indicatorUrl, metadata.id);
                } else if (
                metadata.href &&
                metadata.href.indexOf('dataElement') !== -1
                ) {
                const dataElementUrl =
                    'dataElements/' +
                    metadata.id +
                    '.json?fields=:all,id,name,aggregationType,displayName,' +
                    'categoryCombo[id,name,categories[id,name,categoryOptions[id,name]]],dataSets[:all,!compulsoryDataElementOperands]';
                this.getDataElementInfo(dataElementUrl, metadata.id);
                } else if (metadata.href && metadata.href.indexOf('dataSet') !== -1) {
                const dataSetUrl =
                    'dataSets/' +
                    metadata.id +
                    '.json?fields=:all,user[:all],id,name,periodType,shortName,' +
                    'categoryCombo[id,name,categories[id,name,categoryOptions[id,name]]]';
                this.getDataSetInfo(dataSetUrl, metadata.id);
                }
            } else {
                // get from functions
                this.httpClient.get('dataStore/functions/' + metadata + '.json?').pipe(catchError((err) => of(metadata))).subscribe((functionInfo) => {
                    if (functionInfo.id) {
                        this.store.dispatch(
                            new UpdateDictionaryMetadataAction(functionInfo.id, {
                                name: functionInfo.name,
                                progress: {
                                loading: true,
                                loadingSucceeded: true,
                                loadingFailed: false
                                }
                            })
                        );
                        this.displayFunctionsInfo(functionInfo);
                    } else {
                        this.store.dispatch(
                            new UpdateDictionaryMetadataAction(functionInfo, {
                                name: 'Metadata with id ' + functionInfo + ' not found in the system',
                                progress: {
                                loading: true,
                                loadingSucceeded: true,
                                loadingFailed: false
                                }
                            })
                        );
                    }
                })
            }
        },
        (err)=>{
            if (err.status == 404) {
                console.log(err)
            }
        })
    })
  );

//   http.get(`api/path/here`)
//     .map(res => res.json())
//     .catch(
//         err => {
//           // handle errors
//         })
//     .subscribe(
//         data => console.log(data)
//     );

  getDataSetInfo(dataSetUrl: string, dataSetId: string) {
    this.httpClient.get(`${dataSetUrl}`, true).subscribe((dataSet: any) => {
      let dataSetDescription =
        '<p>' +
        dataSet.name +
        ' of the <strong>' +
        dataSet.formType +
        '</strong> Form created ' +
        'at <strong>' +
        this.datePipe.transform(dataSet.created) +
        ' by ' +
        dataSet.user.name +
        '</strong>';

      if (dataSet.categoryCombo && dataSet.categoryCombo.name !== 'default') {
        dataSetDescription +=
          '<span> With <strong>' +
          dataSet.categoryCombo.name +
          '</strong> Dimension which is divided' +
          ' into ';

        dataSet.categoryCombo.categories.forEach((category, categoryIndex) => {
          if (
            categoryIndex !== 0 &&
            categoryIndex !== dataSet.categoryCombo.categories.length - 1
          ) {
            dataSetDescription += ', ';
          }

          if (
            categoryIndex === dataSet.categoryCombo.categories.length - 1 &&
            dataSet.categoryCombo.categories.length > 1
          ) {
            dataSetDescription += ' and ';
          }

          dataSetDescription += '<strong>';

          category.categoryOptions.forEach(
            (categoryOption, categoryOptionIndex) => {
              if (
                categoryOptionIndex !== 0 &&
                categoryOptionIndex !== category.categoryOptions.length - 1
              ) {
                dataSetDescription += ', ';
              }

              if (
                categoryOptionIndex === category.categoryOptions.length - 1 &&
                category.categoryOptions.length > 1
              ) {
                dataSetDescription += ' and ';
              }

              dataSetDescription += '<span>' + categoryOption.name + '</span>';
            }
          );

          dataSetDescription += '</strong>';
        });

        dataSetDescription += '</span>';
      }

      dataSetDescription += '</p>';

      this.store.dispatch(
        new UpdateDictionaryMetadataAction(dataSetId, {
          description: dataSetDescription,
          progress: {
            loading: false,
            loadingSucceeded: true,
            loadingFailed: false
          }
        })
      );
    });
  }

  getDataElementInfo(dataElementUrl: string, dataElementId: string) {
    this.httpClient
      .get(`${dataElementUrl}`, true)
      .subscribe((dataElement: any) => {
        let dataElementDescription =
          '<p>This ' +
          dataElement.name +
          ' of this method of data aggregation <strong>' +
          dataElement.aggregationType +
          '</strong> created at <strong>' +
          this.datePipe.transform(dataElement.created) +
          '</strong> is only taking <strong>' +
          dataElement.domainType +
          '</strong> data. As the culture of helping user ' +
          'not entering unrecognized data, therefore its only taking <strong>' +
          dataElement.valueType +
          '</strong> values ' +
          'from the user input</p>';

        if (dataElement.categoryCombo.name !== 'default') {
          dataElementDescription +=
            '<p><strong>' +
            dataElement.name +
            '</strong> consists of <strong>' +
            dataElement.categoryCombo.name +
            '</strong> category combinations of ';

          dataElement.categoryCombo.categories.forEach((category, index) => {
            if (
              index !== 0 &&
              index !== dataElement.categoryCombo.categories.length - 1
            ) {
              dataElementDescription += ', ';
            }

            if (
              index === dataElement.categoryCombo.categories.length - 1 &&
              dataElement.categoryCombo.categories.length > 1
            ) {
              dataElementDescription += ' and ';
            }

            dataElementDescription += '<strong>(';
            category.categoryOptions.forEach(
              (categoryOption, categoryOptionIndex) => {
                if (
                  categoryOptionIndex !== 0 &&
                  categoryOptionIndex !== category.categoryOptions.length - 1
                ) {
                  dataElementDescription += ', ';
                }

                if (
                  categoryOptionIndex === category.categoryOptions.length - 1 &&
                  category.categoryOptions.length > 1
                ) {
                  dataElementDescription += ' and ';
                }

                dataElementDescription +=
                  '<span>' + categoryOption.name + '</span>';
              }
            );

            dataElementDescription +=
              ')</strong> of the <strong>' +
              category.name +
              '</strong> category';
          });

          dataElementDescription += '</strong></p>';

          // TODO deal with different version of dhis
          if (dataElement.dataSets && dataElement.dataSets.length > 0) {
            dataElementDescription +=
              '<h5>' + dataElement.name + ' Sources</h5>';

            dataElementDescription +=
              '<p>More than <strong>' +
              dataElement.dataSets.length +
              '</strong> dataset ie ';

            dataElement.dataSets.forEach(
              (dataSet: any, dataSetIndex: number) => {
                if (
                  dataSetIndex !== 0 &&
                  dataSetIndex !== dataElement.dataSets.length - 1
                ) {
                  dataElementDescription += ', ';
                }

                if (
                  dataSetIndex === dataElement.dataSets.length - 1 &&
                  dataElement.dataSets.length > 1
                ) {
                  dataElementDescription += ' and ';
                }
                dataElementDescription +=
                  '<strong>' + dataSet.name + '</strong>';
              }
            );

            dataElementDescription +=
              ' use this ' + dataElement.name + ' data element';

            if (
              dataElement.dataElementGroups &&
              dataElement.dataElementGroups.length > 0
            ) {
              dataElementDescription += ' and it belongs to ';

              dataElement.dataElementGroups.forEach(
                (dataElementGroup, dataElementGroupIndex) => {
                  if (
                    dataElementGroupIndex !== 0 &&
                    dataElementGroupIndex !==
                      dataElement.dataElementGroups.length - 1
                  ) {
                    dataElementDescription += ', ';
                  }

                  if (
                    dataElementGroupIndex ===
                      dataElement.dataElementGroups.length - 1 &&
                    dataElement.dataElementGroups.length > 1
                  ) {
                    dataElementDescription += ' and ';
                  }
                  dataElementDescription +=
                    '<strong>' + dataElementGroup.name + ' Group</strong>';
                }
              );
            }

            dataElementDescription += '</p>';
          }

          this.store.dispatch(
            new UpdateDictionaryMetadataAction(dataElementId, {
              description: dataElementDescription,
              progress: {
                loading: false,
                loadingSucceeded: true,
                loadingFailed: false
              }
            })
          );
        }
      });
  }

  getIndicatorInfo(indicatorUrl: string, indicatorId: string) {
    this.httpClient.get(`${indicatorUrl}`, true).subscribe((indicator: any) => {
      let indicatorDescription =
        '<p class="indicator"><strong>' +
        indicator.name +
        '</strong> is a <strong>' +
        indicator.indicatorType.name +
        ' </strong> indicator';

      if (indicator.numeratorDescription) {
        indicatorDescription +=
          '<span>, measured by <strong>' +
          indicator.numeratorDescription +
          '</strong></span>';
      }

      if (indicator.denominatorDescription) {
        indicatorDescription +=
          '<span> to <strong>' +
          indicator.denominatorDescription +
          '</strong></span></p>';
      } 

      if (indicator.description) {
        indicatorDescription += `<p>It's described as ` + indicator.description + `</p>`;
      }

          /**
           * Indicator group
           */

          if (
            indicator.indicatorGroups &&
            indicator.indicatorGroups.length > 0
          ) {

          indicatorDescription += 
          '<div><h6><strong>Facts about the indicator</strong></h6>' +
          '<h6>The indicator belongs to :-</h6><ul>';

            indicator.indicatorGroups.forEach((indicatorGroup, index) => {
              indicatorDescription +=
                '<li><span><strong>' +
                indicatorGroup.name +
                '</strong> with <strong>' +
                indicatorGroup.indicators +
                '</strong> other related indicators</span></li>';
            });

            indicatorDescription += '</ul></div>';
          }

      if (indicator.annualized) {
        indicatorDescription +=
          '<br><p><span>It’s figure is annualized to support analysis in less than year period ' +
          '(monthly,quarterly,semi-annually)</span></p>';
      }

      this.store.dispatch(
        new UpdateDictionaryMetadataAction(indicatorId, {
          description: indicatorDescription,
          progress: {
            loading: true,
            loadingSucceeded: true,
            loadingFailed: false
          }
        })
      );

      /**
       * Get numerator expression
       */
      forkJoin(
        this.httpClient.get(
          'expressions/description?expression=' +
            encodeURIComponent(indicator.numerator),
          true
        ),
        this.httpClient.get(
          'dataSets.json?fields=periodType,id,name,timelyDays,formType,created,expiryDays&' +
            'filter=dataSetElements.dataElement.id:in:[' +
            this.getAvailableDataElements(indicator.numerator) +
            ']&paging=false',
          true
        )
      ).subscribe((numeratorResults: any[]) => {
        if (numeratorResults[0]) {
          indicatorDescription +=
          '<h6><strong>Calculation details</strong></h6>'+
          '<div style="width: 100%; overflow: auto;">'+
              '<table class="table table-bordered">'+
                '<thead>'+
                  '<tr>'+
                    '<th></th>'+
                    '<th>Formula </th>'+
                    '<th>Sources</th>'+
                  '</tr>'+
                '</thead>'+
                '<tbody>'+
                '<tr>'+
                '<td>Numerator</td>' +
                '<td>' +numeratorResults[0].description + '</td>';
        }

        if (numeratorResults[1] && numeratorResults[1].dataSets) {
          const dataSets: any[] = numeratorResults[1].dataSets;

          indicatorDescription +='<td>';
          if (dataSets.length > 0) {
            indicatorDescription += this.listAllDataSets(dataSets)
          }
          indicatorDescription += '</td></tr>';
        }

        this.store.dispatch(
          new UpdateDictionaryMetadataAction(indicatorId, {
            description: indicatorDescription,
            progress: {
              loading: true,
              loadingSucceeded: true,
              loadingFailed: false
            }
          })
        );

        /**
         * Get denominator expression
         */
        forkJoin(
          this.httpClient.get(
            'expressions/description?expression=' +
              encodeURIComponent(indicator.denominator),
            true
          ),
          this.httpClient.get(
            'dataSets.json?fields=periodType,id,name,timelyDays,formType,created,expiryDays&' +
              'filter=dataSetElements.dataElement.id:in:[' +
              this.getAvailableDataElements(indicator.denominator) +
              ']&paging=false',
            true
          )
        ).subscribe((denominatorResults: any[]) => {
          if (denominatorResults[0]) {
            indicatorDescription +=
              '<tr><td>' + 
              'Denominator' +
              '</td><td>'+
              denominatorResults[0].description +
              '</td>';
          }

          if (denominatorResults[1] && denominatorResults[1].dataSets) {
            const dataSets: any[] = denominatorResults[1].dataSets;

            indicatorDescription +='<td>';
            if (dataSets.length > 0) {
                indicatorDescription += this.listAllDataSets(dataSets)
            }
            indicatorDescription += '</td></tr></tbody></table></div>';
            }

          /**
           * Attribute values
           */
          if (
            indicator.attributeValues &&
            indicator.attributeValues.length > 0
          ) {
            indicatorDescription +=
              '<div><p>Other related details associated with this indicators includes: ';

            indicator.attributeValues.forEach(attr => {
              indicatorDescription +=
                '<span><strong>' +
                attr.attribute.name +
                ': ' +
                attr.value +
                '</strong></span>';
            });

            indicatorDescription += '</p></div>';
          }

          this.store.dispatch(
            new UpdateDictionaryMetadataAction(indicatorId, {
              description: indicatorDescription,
              progress: {
                loading: true,
                loadingSucceeded: true,
                loadingFailed: false
              }
            })
          );

          /**
           * Legend set
           */
          let legendSetsIds = [];
          indicator.legendSets.forEach((legendSet) => {
            legendSetsIds.push(legendSet.id);
          })
          forkJoin(
            this.httpClient.get('legendSets.json?fields=id,name,legends[id,name,startValue,endValue,color]&paging=false&filter=id:in:[' + legendSetsIds.join(';') +']')
          ).subscribe((legendSetsInformation) => {
            if (legendSetsInformation && legendSetsInformation[0].legendSets[0]) {
              let legendSetTable = '';
              let legendRows = '';
              legendSetTable +=
              '<h6><strong>Legend for analysis</strong></h6>'
              if (legendSetsInformation[0].legendSets[0]) {
                legendSetTable += '<h6>Uses <strong>' + legendSetsInformation[0].legendSets[0].name +'</strong> for analysis, spread accross <strong>' +legendSetsInformation[0].legendSets[0].legends.length +'</strong> classes for analysis.</h6>'
              }
              if (legendSetsInformation[0].legendSets[0].legends.length > 0) {
                legendSetTable += '<div style="width: 50%; overflow: auto;">' +
                  '<table class="table table-bordered">' +
                    '<thead>'+
                      '<tr>'+
                        '<th style="padding: 0.45em;">Class</th>'+
                        '<th style="padding: 0.45em;">Lower</th>'+
                        '<th style="padding: 0.45em;">Upper</th>'+
                        '<th style="padding: 0.45em;">Color</th>'+
                      '</tr>'+
                    '</thead>'+
                    '<tbody class="legends-list">';
                    _.reverse(_.sortBy(legendSetsInformation[0].legendSets[0].legends, ['startValue'])).forEach((legend) => {
                      legendRows +=
                      '<tr>'+
                        '<td style="padding: 0.45em;">'+ legend.name + '</td>'+
                        '<td style="padding: 0.45em;">' + legend.startValue + '</td>' +
                        '<td style="padding: 0.45em;">'+ legend.endValue + '</legend.colortd>'+
                        '<td style="padding: 0.45em;background-color: '+ legend.color +'"></td>'+
                      '</tr>'
                    });
                    
                    legendSetTable += legendRows;
                    legendSetTable +=
                    '</tbody>'+
                  '</table>'+
                '</div>';
              }

                indicatorDescription += legendSetTable;
            }

            this.store.dispatch(
              new UpdateDictionaryMetadataAction(indicatorId, {
                description: indicatorDescription,
                progress: {
                  loading: true,
                  loadingSucceeded: true,
                  loadingFailed: false
                }
              })
            );

            /**
             * Data elements in the indicators
             */

             forkJoin(
               this.httpClient.get('dataElements.json?filter=id:in:[' + this.getAvailableDataElements(indicator.numerator + ' + ' + indicator.denominator) +']&paging=false&fields=id,name,zeroIsSignificant,aggregationType,domainType,valueType,categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name,categories[id,name]]]],dataSetElements[dataSet[id,name,periodType]],dataElementGroups[id,name,dataElements~size]',true)
             ).subscribe((dataElements) => {
               let dataElementsTable = ''; let dataElementsListBody = '';
               dataElementsTable +=
               '<br><h6><strong>Data elements in indicator</strong></h6>'+
              '<h6>The following is the summary of the data elements used in the calculations</h6>' +
              '<div style="width: 100%; overflow: auto;">' +
                  '<table class="table table-bordered">' +
                    '<thead>'+
                      '<tr>'+
                        '<th style="padding: 0.45em;">Data element</th>'+
                        '<th style="padding: 0.45em;">Aggregation</th>'+
                        '<th style="padding: 0.45em;">Value Type</th>'+
                        '<th style="padding: 0.45em;">Zero Signifcance</th>'+
                        '<th style="padding: 0.45em;">Categories</th>'+
                        '<th style="padding: 0.45em;">Data Sets/ Programs</th>'+
                        '<th style="padding: 0.45em;">Groups</th>'+
                      '</tr>'+
                    '</thead>'+
                    '<tbody class="dataelements-list">';
              dataElements[0]['dataElements'].forEach((element) => {
                dataElementsListBody += 
                '<tr><td>' + element.name + '</td>'+
                '<td>' + this.formatTextToSentenceFormat(element.aggregationType) + '</td>'+
                '<td>' + this.formatTextToSentenceFormat(element.valueType) +'</td>'+
                '<td>' + element.zeroIsSignificant + '</td>'+
                '<td>' + this.getCategories(element.categoryCombo.categoryOptionCombos)+ '</td>'+
                '<td>' + this.getDataSetFromDataElement(element.dataSetElements) + '</td>'+
                '<td>' + this.getDataElementsGroups(element.dataElementGroups)+'</td></tr>';
              })
              dataElementsTable += dataElementsListBody;
              dataElementsTable += '</tbody></table></div>';

              indicatorDescription += dataElementsTable;
              
              this.store.dispatch(
                new UpdateDictionaryMetadataAction(indicatorId, {
                  description: indicatorDescription,
                  progress: {
                    loading: true,
                    loadingSucceeded: true,
                    loadingFailed: false
                  }
                })
              );

              /**
               * User info
               */
              if (indicator.user) {
                indicatorDescription +=
                  '<br><div><p>Created in the system on <strong>' +
                  this.datePipe.transform(indicator.created) +
                  '</strong> by <strong>';
                  if (indicator.user.phoneNumber) {
                    indicatorDescription += '<span  title="Phone: ' + indicator.user.phoneNumber + ', Email: ' + indicator.user.email +'">';
                  }
                  
                  indicatorDescription +=
                  indicator.user.name +
                  '</span></strong>';
                  if (indicator.lastUpdatedBy) {
                    indicatorDescription +=
                    ' and last updated on <strong>' +
                    this.datePipe.transform(indicator.lastUpdated)
                    + '</strong> by ';
                    if (indicator.lastUpdatedBy.phoneNumber) {
                      indicatorDescription += '<span  title="Phone: ' + indicator.lastUpdatedBy.phoneNumber + ', Email: ' + indicator.lastUpdatedBy.email +'">';
                    }

                  indicatorDescription +=
                    '<strong>' +indicator.lastUpdatedBy.name + '</strong>'
                  }
                  indicatorDescription +=
                  '</span></p></div>';
              }
    
              this.store.dispatch(
                new UpdateDictionaryMetadataAction(indicatorId, {
                  description: indicatorDescription,
                  progress: {
                    loading: false,
                    loadingSucceeded: true,
                    loadingFailed: false
                  }
                })
              );
             })
          });
        });
      });
    });
  }

  getAvailableDataElements(data) {
    let dataElementUids = [];
    const separators = [' ', '\\+', '-', '\\(', '\\)', '\\*', '/', ':', '\\?'];
    const metadataElements = data.split(
      new RegExp(separators.join('|'), 'g')
    );
    metadataElements.forEach(dataElement => {
      if (dataElement != "") {
        dataElementUids.push(this.dataElementWithCategoryOptionCheck(dataElement)[0]);
      }
    });
    return _.uniq(dataElementUids).join(',');
  }

  dataElementWithCategoryOptionCheck(dataElement: any) {
    const uid = [];
    if (dataElement.indexOf('.') >= 1) {
      uid.push(
        dataElement
          .replace(/#/g, '')
          .replace(/{/g, '')
          .replace(/}/g, '')
          .split('.')[0]
      );
    } else {
      uid.push(
        dataElement
          .replace(/#/g, '')
          .replace(/{/g, '')
          .replace(/}/g, '')
      );
    }

    return uid;
  }

  getDataSetFromDataElement(dataSets){
    let listOfElements = '';
    dataSets.forEach((dataSet) => {
      listOfElements += '<li>' + dataSet['dataSet'].name + '</li>'
    })
    return listOfElements;
  }

  getCategories(categoryCombos){
    let categories = []; let categoriesHtml = '';
    categoryCombos.forEach((categoryCombo) => {
      categoryCombo['categoryOptions'].forEach((option) => {
        _.map(option['categories'], (category: any) => {
          categories.push(category);
        })
      })
    })
    _.uniqBy(categories, 'id').forEach((category) => {
      if (category.name.toLowerCase() == 'default') {
        categoriesHtml += '<li> None </li>';
      } else {
        categoriesHtml += '<li>' + category.name + '</li>';
      }
    })

    return categoriesHtml;
  }

  getDataElementsGroups(groups) {
    let groupsHtml = '';
    _.map(groups, (group) => {
      groupsHtml = '<li>' + group.name + ' (with other <strong>' + group.dataElements + '</strong>) data elements </li>';
    })
    return groupsHtml;
  }

  listAllDataSets(dataSets) {
      let listOfDataSets = '';
      dataSets.forEach((dataset) => {
        listOfDataSets += '<li><span><strong>' +
        dataset.name +
        ',</strong> that is collected <strong>' +
        dataset.periodType +
        '</strong> with deadline for submission after <strong>' +
        dataset.timelyDays +
        ' days </strong></span></li>'
      });
      return listOfDataSets;
  }

  displayFunctionsInfo(functionInfo) {
    let indicatorDescription = '<p><strong>' + functionInfo.name + '</strong> is a function for calculating ';
    indicatorDescription += '<strong>' + functionInfo.description + '</strong>';
    indicatorDescription += '</p>';
    indicatorDescription += '<h6>Function`s rules</h6>' +
    '<div style="width: 60%; overflow: auto;">' +
    '<table class="table table-bordered">' +
      '<thead>'+
        '<tr>'+
          '<th style="padding: 0.45em;">Name</th>'+
          '<th style="padding: 0.45em;">Description</th>'+
        '</tr>' +
       '</thead><tbody>';

       if (functionInfo.rules) {
           let rulesHtml = '';
           functionInfo.rules.forEach((rule) => {
               rulesHtml += '<tr><td>' + rule.name + '</td><td>' + rule.description + '</td></tr>';
           });
           indicatorDescription += rulesHtml;
       }

       indicatorDescription += '</tbody></table></div>';

    this.store.dispatch(
        new UpdateDictionaryMetadataAction(functionInfo.id, {
          description: indicatorDescription,
          progress: {
            loading: false,
            loadingSucceeded: true,
            loadingFailed: false
          }
        })
      );
      /**
       * get user info
      **/
     forkJoin(
       this.httpClient.get('users/' + functionInfo.user.id + '.json?fields=id,name,phoneNumber,email',true)
     ).subscribe((userInfo) => {
       if (functionInfo.created) {
          indicatorDescription += '<br><div><p> Created by ' + this.displayUserInfo(userInfo[0]) +' on <strong>' + this.datePipe.transform(functionInfo.created) + '</strong>';
        }

        if (functionInfo.lastUpdated) {
            indicatorDescription += ' and last upated on <strong>' + this.datePipe.transform(functionInfo.lastUpdated) + '</strong>';
        }

      indicatorDescription += '</p></div>';
      this.store.dispatch(
        new UpdateDictionaryMetadataAction(functionInfo.id, {
          description: indicatorDescription,
          progress: {
            loading: false,
            loadingSucceeded: true,
            loadingFailed: false
          }
        })
      );
     });
  }

  displayUserInfo(userInfo) {
    let user = '';
    user += '<strong><span  title="Phone: ' + userInfo.phoneNumber + ', Email: ' + userInfo.email +'">' + userInfo.name + '</span></strong>';
    return user;
  }

  formatTextToSentenceFormat(text) {
    text.split('_').map(function(stringSection) {
      return stringSection.slice(0,1).toUpperCase() + stringSection.slice(1).toLowerCase();
    }).join(' ')
    return text.split('_').join(' ').slice(0,1).toUpperCase() + text.split('_').join(' ').slice(1).toLowerCase();
  }
}