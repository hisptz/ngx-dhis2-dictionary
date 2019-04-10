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
                if (metadata.href && metadata.href.indexOf('indicator') !== -1) {
                  this.store.dispatch(
                    new UpdateDictionaryMetadataAction(metadata.id, {
                        name: metadata.name,
                        category: 'in',
                        progress: {
                        loading: true,
                        loadingSucceeded: true,
                        loadingFailed: false
                        }
                    })
                    );
                  const indicatorUrl =
                      'indicators/' +
                      metadata.id +
                      '.json?fields=:all,user[name,email,phoneNumber],displayName,lastUpdatedBy[id,name,phoneNumber,email],id,name,numeratorDescription,' +
                      'denominatorDescription,denominator,numerator,annualized,decimals,indicatorType[name],user[name],' +
                      'attributeValues[value,attribute[name]],indicatorGroups[name,indicators~size],legendSet[name,symbolizer,' +
                      'legends~size],dataSets[name]';
                  this.getIndicatorInfo(indicatorUrl, metadata.id);
                } else if (metadata.href && metadata.href.indexOf('programIndicator') !== -1) {
                  // program Indicators
                  this.store.dispatch(
                    new UpdateDictionaryMetadataAction(metadata.id, {
                        name: metadata.name,
                        category: 'pi',
                        progress: {
                        loading: true,
                        loadingSucceeded: true,
                        loadingFailed: false
                        }
                    })
                    );
                  const programIndicatorUrl = 'programIndicators/' + metadata.id + '.json?fields=id,name,lastUpdated,created,aggregationType,expression,filter,expiryDays' +
                  ',user[id,name,phoneNumber],lastUpdatedBy[id,name,phoneNumber],program[id,name,programIndicators[id,name]]';
                  this.getProgramIndicatorInfo(programIndicatorUrl, metadata.id);
                } else if (
                metadata.href &&
                metadata.href.indexOf('dataElement') !== -1
                ) {
                  this.store.dispatch(
                    new UpdateDictionaryMetadataAction(metadata.id, {
                        name: metadata.name,
                        category: 'de',
                        progress: {
                        loading: true,
                        loadingSucceeded: true,
                        loadingFailed: false
                        }
                    })
                    );
                const dataElementUrl =
                    'dataElements/' +
                    metadata.id +
                    '.json?fields=:all,id,name,aggregationType,displayName,' +
                    'categoryCombo[id,name,categories[id,name,categoryOptions[id,name]]],dataSets[:all,!compulsoryDataElementOperands]';
                this.getDataElementInfo(dataElementUrl, metadata.id);
                } else if (metadata.href && metadata.href.indexOf('dataSet') !== -1) {
                  this.store.dispatch(
                    new UpdateDictionaryMetadataAction(metadata.id, {
                        name: metadata.name,
                        category: 'ds',
                        progress: {
                        loading: true,
                        loadingSucceeded: true,
                        loadingFailed: false
                        }
                    })
                    );
                const dataSetUrl =
                    'dataSets/' +
                    metadata.id +
                    '.json?fields=:all,user[:all],id,name,periodType,shortName,' +
                    'categoryCombo[id,name,categories[id,name,categoryOptions[id,name]]]';
                this.getDataSetInfo(dataSetUrl, metadata.id);
                }
            } else {
                // get from functions
                let ruleId = '';
                let functionIdentifier = '';
                if (metadata.indexOf('.') > 0) {
                  functionIdentifier = metadata.split('.')[0];
                  ruleId = metadata.split('.')[1];
                } else {
                  functionIdentifier = metadata;
                }
                
                this.httpClient.get('dataStore/functions/' + functionIdentifier + '.json?').pipe(catchError((err) => of(functionIdentifier))).subscribe((functionInfo) => {
                    if (functionInfo.id) {
                        this.store.dispatch(
                            new UpdateDictionaryMetadataAction(metadata, {
                                name: functionInfo.name,
                                category: 'fn',
                                progress: {
                                loading: true,
                                loadingSucceeded: true,
                                loadingFailed: false
                                }
                            })
                        );
                        this.displayFunctionsInfo(functionInfo, ruleId, metadata);
                    } else {
                        this.store.dispatch(
                            new UpdateDictionaryMetadataAction(functionInfo, {
                                name: functionInfo + ' not found',
                                category: 'error',
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
    let dataLoaded = {};
    let indicatorDescription = ''
    dataLoaded['type'] = "indicator";
    this.httpClient.get(`${indicatorUrl}`, true).subscribe((indicator: any) => {
      dataLoaded['metadata'] = indicator;

      this.store.dispatch(
        new UpdateDictionaryMetadataAction(indicatorId, {
          description: indicatorDescription,
          data: dataLoaded,
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
          dataLoaded['numeratorExpression'] = numeratorResults[0];
        }

        if (numeratorResults[1] && numeratorResults[1].dataSets) {
          dataLoaded['numeratorDatasets'] = numeratorResults[1].dataSets;
        }

        this.store.dispatch(
          new UpdateDictionaryMetadataAction(indicatorId, {
            description: indicatorDescription,
            data: dataLoaded,
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
            dataLoaded['denominatorExpression'] = denominatorResults[0];
          }

          if (denominatorResults[1] && denominatorResults[1].dataSets) {
            dataLoaded['denominatorDatasets'] = denominatorResults[1].dataSets;
          }

          this.store.dispatch(
            new UpdateDictionaryMetadataAction(indicatorId, {
              description: indicatorDescription,
              data: dataLoaded,
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
              dataLoaded['legendSetsInformation'] = legendSetsInformation;
            }

            this.store.dispatch(
              new UpdateDictionaryMetadataAction(indicatorId, {
                description: indicatorDescription,
                data: dataLoaded,
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
              dataLoaded['dataElements'] = dataElements[0].dataElements;
              
              this.store.dispatch(
                new UpdateDictionaryMetadataAction(indicatorId, {
                  description: indicatorDescription,
                  data: dataLoaded,
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

  getProgramIndicatorInfo(programIndicatorUrl, programIndicatorId) {
    this.httpClient.get(`${programIndicatorUrl}`, true).subscribe((programIndicator: any) => {
        let indicatorDescription = ''; let filterDescription = '';
        // get expression and filter then describe it
        let programIndicatorDescriptionExpression = programIndicator.expression;
        let allDataElements = []; let programStages = [];
        if (programIndicator.filter) {
          filterDescription = programIndicator.filter;
          const filterDataElements = this.getAvailableDataElements(programIndicator.filter, 'programStage');
          filterDataElements.split(',').forEach((element) => {
            if (element.length ==11) {
              allDataElements.push(element)
            }
          });
          const programStagesList = this.getAvailableDataElements(programIndicator.filter);
          programStagesList.split(',').forEach((programStage) => {
            if (programStage.length == 11) {
              programStages.push(programStage);
            }
          })
        }
        const expressionDataElements = this.getAvailableDataElements(programIndicator.expression, 'programStage');
        expressionDataElements.split(',').forEach((element) => {
          if (element.length ==11) {
            allDataElements.push(element)
          }
        });
        const programStagesList = this.getAvailableDataElements(programIndicator.expression);
        programStagesList.split(',').forEach((programStage) => {
          if (programStage.length == 11) {
            programStages.push(programStage);
          }
        })

        forkJoin(
          this.httpClient.get('programStages.json?filter=id:in:[' + programStages.join(',') + ']&fields=id,name,user,created,description,formType,programStageDataElements~size', true),
          this.httpClient.get('dataElements.json?filter=id:in:[' + allDataElements.join(',') +']&paging=false&fields=id,name,valueType,aggregationType,domainType',true)
        ).subscribe((results: any) => {
          results[0]['programStages'].forEach((stage) => {
            programIndicatorDescriptionExpression = programIndicatorDescriptionExpression.split(stage.id + '.').join(stage.name);
            if (programIndicatorDescriptionExpression.indexOf(stage.name) < 0) {
              programIndicatorDescriptionExpression = stage.name;
            }
            filterDescription = filterDescription.split(stage.id + '.').join(' ')
        })

          results[1]['dataElements'].forEach((dataElement) => {
            programIndicatorDescriptionExpression = programIndicatorDescriptionExpression.split(dataElement.id).join(dataElement.name);
            filterDescription = filterDescription.split(dataElement.id).join(' ' + dataElement.name)
          });
          indicatorDescription += '<h3 style="color: #355E7F; margin-bottom: 1.5rem">' + programIndicator.name + '</h3>';
          indicatorDescription +=
          '<h4 style="color: #464646;">Introduction</h4>'+
          '<p class="indicator"><span style="color: #325E80;">' +programIndicator.name
          if(programIndicator.description) {
            indicatorDescription += '</span> described as <span style="color: #325E80;">' + programIndicator.description + '</span></span> and <br>';
          }
          indicatorDescription += '</span> whose expression is <span style="color: #325E80;">';
          let overallExpression = ''
          if (programIndicator.filter) {
            overallExpression = programIndicatorDescriptionExpression + ' <b>where by</b> ' + filterDescription
          } else {
            overallExpression = programIndicatorDescriptionExpression;
          }
          
          indicatorDescription += this.formatProgramIndicatorExpression(overallExpression);
          indicatorDescription +=
          ' </span>'+
          '</span></span></p>';
          /**
           * Data sources
           */
          indicatorDescription +=
          '<h4 style="color: #464646;">Data source(Programs) associations</h4>' +
          '<h6>It is captured from <span style="color: #325E80;">' + programIndicator.program.name + '</span> through the following stages/steps</h6>';
          indicatorDescription += '<ul>';
          results[0]['programStages'].forEach((programStage) => {
            indicatorDescription += '<li> <span style="color: #325E80;">' + programStage.name + '</span> submitting records on every event(case or individual) by <span style="color: #325E80;">' + programStage.formType.toLowerCase() +' form</span></li>';
          })
          indicatorDescription += '</ul>';
          /**
           * Facts
           */
          indicatorDescription += 
          '<br><h4 style="color: #464646;">Indicator facts</h4>';
          indicatorDescription += '<ul>';
          if (programIndicator.program.programIndicators.length > 1) {
            indicatorDescription += '<li> Has <span style="color: #325E80;">' + (programIndicator.program.programIndicators.length -1) + '</span> related indicators ' +
            'such as ' + this.listRelatedIndicators(programIndicator.program.programIndicators, programIndicator.id) +' </li>';
          }
            indicatorDescription += '</ul>'
            indicatorDescription += this.displayUserInformation(programIndicator);

            this.store.dispatch(
              new UpdateDictionaryMetadataAction(programIndicatorId, {
                description: indicatorDescription,
                progress: {
                  loading: false,
                  loadingSucceeded: true,
                  loadingFailed: false
                }
              })
            );
        })
    })
  }

  getAvailableDataElements(data, condition?) {
    let dataElementUids = [];
    data = data.split('sum(d2:condition(')
    .join('').split("'").join('').split(",").join('')
    .split('d2:daysBetween').join('')
    .split('d2:zing(x)').join('').split('d2:oizp(x)').join('');
    const separators = [' ', '\\+', '-', '\\(', '\\)', '\\*', '/', ':', '\\?','\\>='];
    const metadataElements = data.split(
      new RegExp(separators.join('|'), 'g')
    );
    if (!condition) {
      metadataElements.forEach(dataElement => {
        if (dataElement != "") {
          dataElementUids.push(this.dataElementWithCategoryOptionCheck(dataElement)[0]);
        }
      });
    } else {
      metadataElements.forEach(dataElement => {
        if (dataElement != "") {
          dataElementUids.push(this.dataElementWithCategoryOptionCheck(dataElement, 'comboOrStage')[0]);
        }
      });
    }
    return _.uniq(dataElementUids).join(',');
  }

  dataElementWithCategoryOptionCheck(dataElement: any, condition?) {
    const uid = [];
    if (dataElement.indexOf('.') >= 1 && !condition) {
      uid.push(
        dataElement
          .replace(/#/g, '')
          .replace(/{/g, '')
          .replace(/}/g, '')
          .split('.')[0]
      );
    } else if (dataElement.indexOf('.') >= 1 && condition) {
      uid.push(
        dataElement
          .replace(/#/g, '')
          .replace(/{/g, '')
          .replace(/}/g, '')
          .split('.')[1]
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

  displayUserInformation(programIndicator) {
    let indicatorDescription = '';
    if (programIndicator.user) {
      indicatorDescription +='<br><div style="float: right"><p><i>Created in the system on <strong>' +
        this.datePipe.transform(programIndicator.created) +
        '</strong> by <strong>';
        if (programIndicator.user.phoneNumber) {
          indicatorDescription += '<span  title="Phone: ' + programIndicator.user.phoneNumber + ', Email: ' + programIndicator.user.email +'">';
        }
        
        indicatorDescription +=
        programIndicator.user.name +
        '</span></strong>';
        if (programIndicator.lastUpdatedBy) {
          indicatorDescription +=
          ' and last updated on <strong>' +
          this.datePipe.transform(programIndicator.lastUpdated)
          + '</strong> by ';
          if (programIndicator.lastUpdatedBy.phoneNumber) {
            indicatorDescription += '<span  title="Phone: ' + programIndicator.lastUpdatedBy.phoneNumber + ', Email: ' + programIndicator.lastUpdatedBy.email +'">';
          }
  
        indicatorDescription +=
          '<strong>' +programIndicator.lastUpdatedBy.name + '</strong>'
        }
        indicatorDescription +=
        '</span></i></p></div>';
    }
    return indicatorDescription;
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
      groupsHtml = '<li style="margin: 3px;">' + group.name + ' (with other <strong>' + (group.dataElements - 1) + '</strong>) data elements </li>';
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

  displayFunctionsInfo(functionInfo, ruleId, metadataId) {
    let indicatorDescription = '<h3 style="color: #355E7F; margin-bottom: 1.5rem">' + functionInfo.name + '</h3>';
    indicatorDescription += '<h4 style="color: #464646;">Introduction</h4><p><strong>' + functionInfo.name + '</strong> is a function for calculating ';
    indicatorDescription += '<strong>' + functionInfo.description + '</strong>';
    indicatorDescription += '</p>';
    indicatorDescription += '<h4 style="color: #464646;">Function`s rules</h6>';
    if (ruleId !='') {
      indicatorDescription += '<span style="background-color: #c1f2ec; height: 30px; width: 30px; margin-right: 40%; float: right;"></span><span style="font-size: 1em;float: right;">Used rule</span>';
    }
    indicatorDescription +=
    '<div style="width: 60%; overflow: auto;">' +
    '<table class="table table-bordered">' +
      '<thead>'+
        '<tr style="background-color: #d6d6d6; color: #464646;">'+
          '<th style="padding: 0.45em;">Name</th>'+
          '<th style="padding: 0.45em;">Description</th>'+
        '</tr>' +
       '</thead><tbody>';

       if (functionInfo.rules) {
           let rulesHtml = '';
           functionInfo.rules.forEach((rule) => {
             if (rule.id == ruleId) {
               rulesHtml += '<tr><td style="background-color: #c1f2ec;">' + rule.name + '</td><td style="background-color: #c1f2ec;">' + rule.description + '</td></tr>';
             } else {
              rulesHtml += '<tr><td>' + rule.name + '</td><td>' + rule.description + '</td></tr>';
             }
           });
           indicatorDescription += rulesHtml;
       }

        indicatorDescription += '</tbody></table></div>';
        this.store.dispatch(
            new UpdateDictionaryMetadataAction(metadataId, {
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
          indicatorDescription += '<br><div style="float: right;"><p><i> Created by ' + this.displayUserInfo(userInfo[0]) +' on <strong>' + this.datePipe.transform(functionInfo.created) + '</strong>';
        }

        if (functionInfo.lastUpdated) {
            indicatorDescription += ' and last upated on <strong>' + this.datePipe.transform(functionInfo.lastUpdated) + '</strong>';
        }

      indicatorDescription += '</i></p></div>';
      this.store.dispatch(
        new UpdateDictionaryMetadataAction(metadataId, {
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

  formatProgramIndicatorExpression(expression) {
    return expression
    .replace(/V{event_count}/g, '')
    .replace(/#/g, '')
    .replace(/{/g, '')
    .replace(/}/g, '')
    
  }

  listRelatedIndicators(programIndicators, programIndicatorId) {
    let listOfRelatedIndicators = ''
    programIndicators.forEach((programIndicator, index) => {
      if (programIndicator.id != programIndicatorId && index <3) {
        if (programIndicators.length ==1) {
          listOfRelatedIndicators += '<span style="color: #325E80;">' +programIndicator.name + '</span>';
        } else if (programIndicators.length ==2) {
          if (index == 0) {
            listOfRelatedIndicators += '<span style="color: #325E80;">' + programIndicator.name + '</span>';
          } else {
            listOfRelatedIndicators += ' and <span style="color: #325E80;">' + programIndicator.name + '</span>';
          }
        } else {
          if (index == 0) {
            listOfRelatedIndicators += '<span style="color: #325E80;">' + programIndicator.name + '</span>,';
          } else if (index ==1) {
            listOfRelatedIndicators += '<span style="color: #325E80;">'+ programIndicator.name + '</span>';
          } else {
            listOfRelatedIndicators += ' and <span style="color: #325E80;">' + programIndicator.name + '</span>';
          }
        }
      }
    })
    return listOfRelatedIndicators;
  }

  formatTextToSentenceFormat(text) {
    text.split('_').map(function(stringSection) {
      return stringSection.slice(0,1).toUpperCase() + stringSection.slice(1).toLowerCase();
    }).join(' ')
    return text.split('_').join(' ').slice(0,1).toUpperCase() + text.split('_').join(' ').slice(1).toLowerCase();
  }
}