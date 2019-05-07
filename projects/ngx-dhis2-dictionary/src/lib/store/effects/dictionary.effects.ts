import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';

import * as _ from 'lodash';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { Observable, from, forkJoin, of } from 'rxjs';

import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
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
            return this.httpClient
              .get(`identifiableObjects/${identifier}.json`)
              .pipe(catchError(err => of(identifier)));
          })
        )
        .subscribe(
          (metadata: any) => {
            if (metadata.href) {
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
                  'denominatorDescription,denominator,numerator,annualized,decimals,indicatorType[name],user[name],userGroupAccesses[*],userAccesses[*],' +
                  'attributeValues[value,attribute[name]],indicatorGroups[id,name,code,indicators[id,name]],legendSet[name,symbolizer,' +
                  'legends~size],dataSets[name]';
                this.getIndicatorInfo(indicatorUrl, metadata.id);
              } else if (
                metadata.href &&
                metadata.href.indexOf('programIndicator') !== -1
              ) {
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
                const programIndicatorUrl =
                  'programIndicators/' +
                  metadata.id +
                  '.json?fields=id,name,shortName,lastUpdated,analyticsPeriodBoundaries,created,userGroupAccesses[*],userAccesses[*],aggregationType,expression,filter,expiryDays' +
                  ',user[id,name,phoneNumber],lastUpdatedBy[id,name,phoneNumber],program[id,name,programIndicators[id,name]]';
                this.getProgramIndicatorInfo(programIndicatorUrl, metadata.id);
              } else if (
                metadata.href &&
                metadata.href.indexOf('dataElements/') !== -1
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
                  '.json?fields=:all,id,name,aggregationType,user[id,name],lastUpdatedBy[id,name],displayName,legendSets,userGroupAccesses[*],userAccesses[*],optionSetValue,aggregationLevels,dataElementGroups[id],' +
                  'categoryCombo[id,name,categories[id,name,categoryOptions[id,name]]],dataSetElements[dataSet[id,name,formType,periodType,timelyDays,expiryDays,legendSet]]';
                this.getDataElementInfo(dataElementUrl, metadata.id);
              } else if (
                metadata.href &&
                metadata.href.indexOf('dataElementGroups') !== -1
              ) {
                this.store.dispatch(
                  new UpdateDictionaryMetadataAction(metadata.id, {
                    name: metadata.name,
                    category: 'dg',
                    progress: {
                      loading: true,
                      loadingSucceeded: true,
                      loadingFailed: false
                    }
                  })
                );
                const dataElementGroupUrl =
                  'dataElementGroups/' +
                  metadata.id +
                  '.json?fields=:all,description,user[id,name],lastUpdatedBy[id,name],dataElements[id,name,dataSetElements[id,name,dataSet[id,name,periodType,timelyDays,formType,created,userGroupAccesses[*],userAccesses[*],expiryDays,categoryCombo[id,name,categories[id,name,categoryOptions[id,name]]],dataElements[id,name]]]],user[id,name]';
                this.getDataElementGroupInfo(dataElementGroupUrl, metadata.id);
              } else if (
                metadata.href &&
                metadata.href.indexOf('dataSet') !== -1
              ) {
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
                  '.json?fields=id,name,created,periodType,code,user[id,name],sections[id,name],lastUpdated,lastUpdatedBy[id,name],legendSets,formType,periodType,timelyDays,shortName,validCompleteOnly,dataSetElements[dataElement[id,name]],compulsoryFieldsCompleteOnly,userGroupAccesses[*],userAccesses[*],compulsoryDataElementOperands[id,name,dataElement]' +
                  ',categoryCombo[id,name,categories[id,name,categoryOptions[id,name]]]';
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

              this.httpClient
                .get('dataStore/functions/' + functionIdentifier + '/metaData')
                .pipe(catchError(err => of(functionIdentifier)))
                .subscribe(functionInfo => {
                  if (functionInfo.key) {
                    let functionInfos = this.formatFunctionsObject(
                      functionInfo
                    );
                    this.store.dispatch(
                      new UpdateDictionaryMetadataAction(metadata, {
                        name: functionInfos.name,
                        category: 'fn',
                        progress: {
                          loading: true,
                          loadingSucceeded: true,
                          loadingFailed: false
                        }
                      })
                    );
                    console.log('functionInfos', functionInfos);
                    this.displayFunctionsInfo(functionInfos, ruleId, metadata);
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
                });
            }
          },
          err => {
            if (err.status === 404) {
              console.log(err);
            }
          }
        );
    })
  );

  getDataSetInfo(dataSetUrl: string, dataSetId: string) {
    let metadataInfoLoaded = {
      type: 'dataSet',
      metadata: {},
      legendSetsInformation: [],
      dataElements: []
    };
    const dataSetDescription = '';
    this.httpClient.get(`${dataSetUrl}`).subscribe((dataSet: any) => {
      metadataInfoLoaded = { ...metadataInfoLoaded, metadata: dataSet };
      this.store.dispatch(
        new UpdateDictionaryMetadataAction(dataSetId, {
          description: dataSetDescription,
          data: metadataInfoLoaded,
          progress: {
            loading: true,
            loadingSucceeded: true,
            loadingFailed: false
          }
        })
      );
      /**
       * Data elements informnation
       */
      const dataElementsArr = [];
      dataSet['dataSetElements'].forEach(element => {
        dataElementsArr.push(element.dataElement.id);
      });
      forkJoin(
        this.httpClient.get(
          'dataElements.json?fields=id,name,code,zeroIsSignificant,user[id,name],dataSetElements[dataSet[id,name]],categoryCombo[id,name,dataDimensionType,categories[id,name]],shortName,valueType,aggregationType,dataElementGroups[id,name]&filter=id:in:[' +
            dataElementsArr.join(',') +
            ']'
        )
      ).subscribe(dataElements => {
        metadataInfoLoaded = {
          ...metadataInfoLoaded,
          dataElements: dataElements[0]['dataElements']
        };
        this.store.dispatch(
          new UpdateDictionaryMetadataAction(dataSetId, {
            description: dataSetDescription,
            data: metadataInfoLoaded,
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
        const legendSetsIds = [];
        if (dataSet.legendSets) {
          dataSet.legendSets.forEach(legendSet => {
            legendSetsIds.push(legendSet.id);
          });
        }
        forkJoin(
          this.httpClient.get(
            'legendSets.json?fields=id,name,legends[id,name,startValue,endValue,color]&paging=false&filter=id:in:[' +
              legendSetsIds.join(',') +
              ']'
          )
        ).subscribe(legendSetsInformation => {
          if (legendSetsInformation && legendSetsInformation[0].legendSets[0]) {
            metadataInfoLoaded = {
              ...metadataInfoLoaded,
              legendSetsInformation: legendSetsInformation
            };
          }
          this.store.dispatch(
            new UpdateDictionaryMetadataAction(dataSetId, {
              description: dataSetDescription,
              data: metadataInfoLoaded,
              progress: {
                loading: false,
                loadingSucceeded: true,
                loadingFailed: false
              }
            })
          );
        });
      });
    });
  }

  getDataElementGroupInfo(dataElementGroupUrl, groupId) {
    let metadataInfoLoaded = {
      type: 'dataElementGroup',
      metadata: {},
      dataElements: []
    };
    this.httpClient
      .get(`${dataElementGroupUrl}`)
      .subscribe((dataElementGroup: any) => {
        metadataInfoLoaded = {
          ...metadataInfoLoaded,
          metadata: dataElementGroup
        };
        const dataElementDescription = '';
        this.store.dispatch(
          new UpdateDictionaryMetadataAction(groupId, {
            description: dataElementDescription,
            data: metadataInfoLoaded,
            progress: {
              loading: true,
              loadingSucceeded: true,
              loadingFailed: false
            }
          })
        );

        /**
         * Data elements informnation
         */
        const dataElementsArr = [];
        dataElementGroup['dataElements'].forEach(element => {
          dataElementsArr.push(element.id);
        });
        forkJoin(
          this.httpClient.get(
            'dataElements.json?fields=id,name,code,zeroIsSignificant,user[id,name],dataSetElements[dataSet[id,name]],categoryCombo[id,name,dataDimensionType,categories[id,name]],shortName,valueType,aggregationType,dataElementGroups[id,name]&filter=id:in:[' +
              dataElementsArr.join(',') +
              ']'
          )
        ).subscribe(dataElements => {
          metadataInfoLoaded = {
            ...metadataInfoLoaded,
            dataElements: dataElements[0]['dataElements']
          };
          this.store.dispatch(
            new UpdateDictionaryMetadataAction(groupId, {
              description: dataElementDescription,
              data: metadataInfoLoaded,
              progress: {
                loading: false,
                loadingSucceeded: true,
                loadingFailed: false
              }
            })
          );
        });
      });
  }

  getDataElementInfo(dataElementUrl: string, dataElementId: string) {
    let metadataInfoLoaded = {
      type: 'dataElement',
      metadata: {},
      dataElementGroups: [],
      legendSetsInformation: {}
    };
    this.httpClient.get(`${dataElementUrl}`).subscribe((dataElement: any) => {
      metadataInfoLoaded = { ...metadataInfoLoaded, metadata: dataElement };
      const dataElementDescription = '';

      this.store.dispatch(
        new UpdateDictionaryMetadataAction(dataElementId, {
          description: dataElementDescription,
          data: metadataInfoLoaded,
          progress: {
            loading: true,
            loadingSucceeded: true,
            loadingFailed: false
          }
        })
      );

      /**
       * Data element groups
       */
      const dataElementGroupsArr = [];
      dataElement.dataElementGroups.forEach(group => {
        dataElementGroupsArr.push(group.id);
      });
      forkJoin(
        this.httpClient.get(
          'dataElementGroups.json?paging=false&fields=id,name,dataElements[id,name]&filter=id:in:[' +
            dataElementGroupsArr.join(',') +
            ']'
        )
      ).subscribe(dataElementGroups => {
        metadataInfoLoaded = {
          ...metadataInfoLoaded,
          dataElementGroups: dataElementGroups[0]['dataElementGroups']
        };
        this.store.dispatch(
          new UpdateDictionaryMetadataAction(dataElementId, {
            description: dataElementDescription,
            data: metadataInfoLoaded,
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
        const legendSetsIds = [];
        if (dataElement.legendSets) {
          dataElement.legendSets.forEach(legendSet => {
            legendSetsIds.push(legendSet.id);
          });
        }
        forkJoin(
          this.httpClient.get(
            'legendSets.json?fields=id,name,legends[id,name,startValue,endValue,color]&paging=false&filter=id:in:[' +
              legendSetsIds.join(',') +
              ']'
          )
        ).subscribe(legendSetsInformation => {
          if (legendSetsInformation && legendSetsInformation[0].legendSets[0]) {
            metadataInfoLoaded = {
              ...metadataInfoLoaded,
              legendSetsInformation: legendSetsInformation
            };
          }

          this.store.dispatch(
            new UpdateDictionaryMetadataAction(dataElementId, {
              description: dataElementDescription,
              data: metadataInfoLoaded,
              progress: {
                loading: false,
                loadingSucceeded: true,
                loadingFailed: false
              }
            })
          );
        });
      });
    });
  }

  getIndicatorInfo(indicatorUrl: string, indicatorId: string) {
    const indicatorDescription = '';
    const dataLoaded = {};
    let metadataInfoLoaded = {
      type: '',
      metadata: {},
      numeratorExpression: {},
      numeratorDatasets: [],
      denominatorExpression: {},
      denominatorDatasets: [],
      legendSetsInformation: [],
      dataElements: []
    };
    metadataInfoLoaded.type = 'indicator';
    this.httpClient.get(`${indicatorUrl}`).subscribe((indicator: any) => {
      metadataInfoLoaded.metadata = indicator;

      this.store.dispatch(
        new UpdateDictionaryMetadataAction(indicatorId, {
          description: indicatorDescription,
          data: metadataInfoLoaded,
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
            encodeURIComponent(indicator.numerator)
        ),
        this.httpClient.get(
          'dataSets.json?fields=periodType,id,name,timelyDays,formType,created,expiryDays&' +
            'filter=dataSetElements.dataElement.id:in:[' +
            this.getAvailableDataElements(indicator.numerator) +
            ']&paging=false'
        )
      ).subscribe((numeratorResults: any[]) => {
        if (numeratorResults[0]) {
          metadataInfoLoaded = {
            ...metadataInfoLoaded,
            numeratorExpression: numeratorResults[0]
          };
        }

        if (numeratorResults[1] && numeratorResults[1].dataSets) {
          metadataInfoLoaded = {
            ...metadataInfoLoaded,
            numeratorDatasets: numeratorResults[1].dataSets
          };
        }

        this.store.dispatch(
          new UpdateDictionaryMetadataAction(indicatorId, {
            description: indicatorDescription,
            data: metadataInfoLoaded,
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
              encodeURIComponent(indicator.denominator)
          ),
          this.httpClient.get(
            'dataSets.json?fields=periodType,id,name,timelyDays,formType,created,expiryDays&' +
              'filter=dataSetElements.dataElement.id:in:[' +
              this.getAvailableDataElements(indicator.denominator) +
              ']&paging=false'
          )
        ).subscribe((denominatorResults: any[]) => {
          if (denominatorResults[0]) {
            metadataInfoLoaded = {
              ...metadataInfoLoaded,
              denominatorExpression: denominatorResults[0]
            };
          }

          if (denominatorResults[1] && denominatorResults[1].dataSets) {
            metadataInfoLoaded = {
              ...metadataInfoLoaded,
              denominatorDatasets: denominatorResults[1].dataSets
            };
          }

          this.store.dispatch(
            new UpdateDictionaryMetadataAction(indicatorId, {
              description: indicatorDescription,
              data: metadataInfoLoaded,
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
          const legendSetsIds = [];
          indicator.legendSets.forEach(legendSet => {
            legendSetsIds.push(legendSet.id);
          });
          forkJoin(
            this.httpClient.get(
              'legendSets.json?fields=id,name,legends[id,name,startValue,endValue,color]&paging=false&filter=id:in:[' +
                legendSetsIds.join(';') +
                ']'
            )
          ).subscribe(legendSetsInformation => {
            if (
              legendSetsInformation &&
              legendSetsInformation[0].legendSets[0]
            ) {
              metadataInfoLoaded = {
                ...metadataInfoLoaded,
                legendSetsInformation: legendSetsInformation
              };
            }

            this.store.dispatch(
              new UpdateDictionaryMetadataAction(indicatorId, {
                description: indicatorDescription,
                data: metadataInfoLoaded,
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
              this.httpClient.get(
                'dataElements.json?filter=id:in:[' +
                  this.getAvailableDataElements(
                    indicator.numerator + ' + ' + indicator.denominator
                  ) +
                  ']&paging=false&fields=id,name,zeroIsSignificant,aggregationType,domainType,valueType,categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name,categories[id,name]]]],dataSetElements[dataSet[id,name,periodType]],dataElementGroups[id,name,dataElements~size]'
              )
            ).subscribe(dataElements => {
              metadataInfoLoaded = {
                ...metadataInfoLoaded,
                dataElements: dataElements[0].dataElements
              };

              this.store.dispatch(
                new UpdateDictionaryMetadataAction(indicatorId, {
                  description: indicatorDescription,
                  data: metadataInfoLoaded,
                  progress: {
                    loading: false,
                    loadingSucceeded: true,
                    loadingFailed: false
                  }
                })
              );
            });
          });
        });
      });
    });
  }

  getProgramIndicatorInfo(programIndicatorUrl, programIndicatorId) {
    let metadataInfoLoaded = {
      type: 'programIndicator',
      metadata: {},
      programStages: {},
      dataElements: {},
      filter: {},
      programIndicatorDescriptionExpression: {},
      legendSetsInformation: []
    };
    this.httpClient
      .get(`${programIndicatorUrl}`)
      .subscribe((programIndicator: any) => {
        const indicatorDescription = '';
        let filterDescription = '';
        // get expression and filter then describe it
        let programIndicatorDescriptionExpression = programIndicator.expression;
        const allDataElements = [];
        const programStages = [];
        if (programIndicator.filter) {
          filterDescription = programIndicator.filter;
          const filterDataElements = this.getAvailableDataElements(
            programIndicator.filter,
            'programStage'
          );
          filterDataElements.split(',').forEach(element => {
            if (element.length === 11) {
              allDataElements.push(element);
            }
          });
          const programStagesList = this.getAvailableDataElements(
            programIndicator.filter
          );
          programStagesList.split(',').forEach(programStage => {
            if (programStage.length === 11) {
              programStages.push(programStage);
            }
          });
        }
        const expressionDataElements = this.getAvailableDataElements(
          programIndicator.expression,
          'programStage'
        );
        expressionDataElements.split(',').forEach(element => {
          if (element.length === 11) {
            allDataElements.push(element);
          }
        });
        const programStagesList = this.getAvailableDataElements(
          programIndicator.expression
        );
        programStagesList.split(',').forEach(programStage => {
          if (programStage.length === 11) {
            programStages.push(programStage);
          }
        });

        forkJoin(
          this.httpClient.get(
            'programStages.json?filter=id:in:[' +
              programStages.join(',') +
              ']&fields=id,name,user,created,description,formType,programStageDataElements~size'
          ),
          this.httpClient.get(
            'dataElements.json?filter=id:in:[' +
              allDataElements.join(',') +
              ']&paging=false&fields=id,name,valueType,aggregationType,domainType'
          )
        ).subscribe((results: any) => {
          metadataInfoLoaded = {
            ...metadataInfoLoaded,
            programStages: results[0]['programStages']
          };
          results[0]['programStages'].forEach(stage => {
            programIndicatorDescriptionExpression = programIndicatorDescriptionExpression
              .split(stage.id + '.')
              .join(stage.name);
            if (programIndicatorDescriptionExpression.indexOf(stage.name) < 0) {
              programIndicatorDescriptionExpression = stage.name;
            }
            filterDescription = filterDescription
              .split(stage.id + '.')
              .join(' ');
          });

          metadataInfoLoaded = {
            ...metadataInfoLoaded,
            dataElements: results[1]['dataElements']
          };
          results[1]['dataElements'].forEach(dataElement => {
            programIndicatorDescriptionExpression = programIndicatorDescriptionExpression
              .split(dataElement.id)
              .join(dataElement.name);
            filterDescription = filterDescription
              .split(dataElement.id)
              .join(' ' + dataElement.name);
          });
          metadataInfoLoaded = {
            ...metadataInfoLoaded,
            metadata: programIndicator
          };

          metadataInfoLoaded = {
            ...metadataInfoLoaded,
            filter: this.formatProgramIndicatorExpression(filterDescription)
          };
          metadataInfoLoaded = {
            ...metadataInfoLoaded,
            programIndicatorDescriptionExpression: this.formatProgramIndicatorExpression(
              programIndicatorDescriptionExpression
            )
          };
          this.store.dispatch(
            new UpdateDictionaryMetadataAction(programIndicatorId, {
              description: indicatorDescription,
              data: metadataInfoLoaded,
              progress: {
                loading: true,
                loadingSucceeded: true,
                loadingFailed: false
              }
            })
          );

          /**
           * Legend sets
           */
          const legendSetsIds = [];
          if (programIndicator.legendSets) {
            programIndicator.legendSets.forEach(legendSet => {
              legendSetsIds.push(legendSet.id);
            });
          }
          forkJoin(
            this.httpClient.get(
              'legendSets.json?fields=id,name,legends[id,name,startValue,endValue,color]&paging=false&filter=id:in:[' +
                legendSetsIds.join(';') +
                ']'
            )
          ).subscribe(legendSetsInformation => {
            if (
              legendSetsInformation &&
              legendSetsInformation[0].legendSets[0]
            ) {
              metadataInfoLoaded = {
                ...metadataInfoLoaded,
                legendSetsInformation: legendSetsInformation
              };
            }

            this.store.dispatch(
              new UpdateDictionaryMetadataAction(programIndicatorId, {
                description: indicatorDescription,
                data: metadataInfoLoaded,
                progress: {
                  loading: false,
                  loadingSucceeded: true,
                  loadingFailed: false
                }
              })
            );
          });
        });
      });
  }

  getAvailableDataElements(data, condition?) {
    const dataElementUids = [];
    data = data
      .split('sum(d2:condition(')
      .join('')
      .split("'")
      .join('')
      .split(',')
      .join('')
      .split('d2:daysBetween')
      .join('')
      .split('d2:zing(x)')
      .join('')
      .split('d2:oizp(x)')
      .join('');
    const separators = [
      ' ',
      '\\+',
      '-',
      '\\(',
      '\\)',
      '\\*',
      '/',
      ':',
      '\\?',
      '\\>='
    ];
    const metadataElements = data.split(new RegExp(separators.join('|'), 'g'));
    if (!condition) {
      metadataElements.forEach(dataElement => {
        if (dataElement !== '') {
          dataElementUids.push(
            this.dataElementWithCategoryOptionCheck(dataElement)[0]
          );
        }
      });
    } else {
      metadataElements.forEach(dataElement => {
        if (dataElement !== '') {
          dataElementUids.push(
            this.dataElementWithCategoryOptionCheck(
              dataElement,
              'comboOrStage'
            )[0]
          );
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
      indicatorDescription +=
        '<br><div style="float: right"><p style="font-size: 0.8em;"><i>Created in the system on <strong>' +
        this.datePipe.transform(programIndicator.created) +
        '</strong> by <strong>';
      if (programIndicator.user.phoneNumber) {
        indicatorDescription +=
          '<span  title="Phone: ' +
          programIndicator.user.phoneNumber +
          ', Email: ' +
          programIndicator.user.email +
          '">';
      }

      indicatorDescription += programIndicator.user.name + '</span></strong>';
      if (programIndicator.lastUpdatedBy) {
        indicatorDescription +=
          ' and last updated on <strong>' +
          this.datePipe.transform(programIndicator.lastUpdated) +
          '</strong> by ';
        if (programIndicator.lastUpdatedBy.phoneNumber) {
          indicatorDescription +=
            '<span  title="Phone: ' +
            programIndicator.lastUpdatedBy.phoneNumber +
            ', Email: ' +
            programIndicator.lastUpdatedBy.email +
            '">';
        }

        indicatorDescription +=
          '<strong>' + programIndicator.lastUpdatedBy.name + '</strong>';
      }
      indicatorDescription += '</span></i></p></div>';
    }
    return indicatorDescription;
  }

  getDataSetFromDataElement(dataSets) {
    let listOfElements = '';
    dataSets.forEach(dataSet => {
      listOfElements += '<li>' + dataSet['dataSet'].name + '</li>';
    });
    return listOfElements;
  }

  getCategories(categoryCombos) {
    const categories = [];
    let categoriesHtml = '';
    categoryCombos.forEach(categoryCombo => {
      categoryCombo['categoryOptions'].forEach(option => {
        _.map(option['categories'], (category: any) => {
          categories.push(category);
        });
      });
    });
    _.uniqBy(categories, 'id').forEach(category => {
      if (category.name.toLowerCase() === 'default') {
        categoriesHtml += '<li> None </li>';
      } else {
        categoriesHtml += '<li>' + category.name + '</li>';
      }
    });

    return categoriesHtml;
  }

  getDataElementsGroups(groups) {
    let groupsHtml = '';
    _.map(groups, group => {
      groupsHtml =
        '<li style="margin: 3px;">' +
        group.name +
        ' (with other <strong>' +
        (group.dataElements - 1) +
        '</strong>) data elements </li>';
    });
    return groupsHtml;
  }

  listAllDataSets(dataSets) {
    let listOfDataSets = '';
    dataSets.forEach(dataset => {
      listOfDataSets +=
        '<li><span><strong>' +
        dataset.name +
        ',</strong> that is collected <strong>' +
        dataset.periodType +
        '</strong> with deadline for submission after <strong>' +
        dataset.timelyDays +
        ' days </strong></span></li>';
    });
    return listOfDataSets;
  }

  displayFunctionsInfo(functionInfo, ruleId, metadataId) {
    let metadataInfoLoaded = {
      type: 'functions',
      metadata: {},
      metadataWithinFunctionDetails: []
    };
    let functionDescription = '';
    metadataInfoLoaded = { ...metadataInfoLoaded, metadata: functionInfo };
    this.store.dispatch(
      new UpdateDictionaryMetadataAction(metadataId, {
        description: functionDescription,
        data: metadataInfoLoaded,
        progress: {
          loading: true,
          loadingSucceeded: true,
          loadingFailed: false
        }
      })
    );

    /**
     * Identifiables from rules
     */
    let metadataInFunctions = [];
    functionInfo.rules.forEach(rule => {
      if (rule.json.data && rule.json.data.length === 11) {
        metadataInFunctions.push(rule.json.data);
      } else {
        const identifiedUids = this.getItemsFromRule(rule.json);
        identifiedUids.split(',').forEach(uid => {
          metadataInFunctions.push(uid);
        });
      }
    });
    console.log('metadataInFunctions', metadataInFunctions);
    let metadataWithinFunctionDetails = [];
    _.uniq(metadataInFunctions).forEach(identifier => {
      this.httpClient
        .get('identifiableObjects/' + identifier + '.json')
        .subscribe(metadata => {
          if (metadata.href.indexOf('dataSets/') > -1) {
            this.httpClient
              .get(
                'dataSets/' +
                  metadata.id +
                  '.json?fields=id,name,description,shortName,code,formType,timelyDays,periodType'
              )
              .subscribe(dataSet => {
                const metadataInfo = {
                  type: 'dataSet',
                  info: dataSet
                };
                metadataWithinFunctionDetails = [
                  ...metadataWithinFunctionDetails,
                  metadataInfo
                ];
                metadataInfoLoaded = {
                  ...metadataInfoLoaded,
                  metadataWithinFunctionDetails: metadataWithinFunctionDetails
                };

                metadataInfoLoaded = {
                  ...metadataInfoLoaded,
                  metadataWithinFunctionDetails: metadataWithinFunctionDetails
                };
                this.store.dispatch(
                  new UpdateDictionaryMetadataAction(metadataId, {
                    description: functionDescription,
                    data: metadataInfoLoaded,
                    progress: {
                      loading: false,
                      loadingSucceeded: true,
                      loadingFailed: false
                    }
                  })
                );
              });
          } else if (metadata.href.indexOf('indicators/') > -1) {
            this.httpClient
              .get(
                'indicators/' +
                  metadata.id +
                  '.json?fields=id,name,description,shortName,code,indicatorGroups[id,name],numerator,denominator'
              )
              .subscribe(indicator => {
                const metadataInfo = {
                  type: 'indicator',
                  info: indicator
                };
                metadataWithinFunctionDetails = [
                  ...metadataWithinFunctionDetails,
                  metadataInfo
                ];
                metadataInfoLoaded = {
                  ...metadataInfoLoaded,
                  metadataWithinFunctionDetails: metadataWithinFunctionDetails
                };

                metadataInfoLoaded = {
                  ...metadataInfoLoaded,
                  metadataWithinFunctionDetails: metadataWithinFunctionDetails
                };
                this.store.dispatch(
                  new UpdateDictionaryMetadataAction(metadataId, {
                    description: functionDescription,
                    data: metadataInfoLoaded,
                    progress: {
                      loading: false,
                      loadingSucceeded: true,
                      loadingFailed: false
                    }
                  })
                );
              });
          } else if (metadata.href.indexOf('dataElements/') > -1) {
            this.httpClient
              .get(
                'dataElements/' +
                  metadata.id +
                  '.json?fields=id,name,description,shortName,code,dataElementGroups[id,name],dataSetElements[id,name,dataSet]'
              )
              .subscribe(dataElement => {
                const metadataInfo = {
                  type: 'dataElement',
                  info: dataElement
                };
                metadataWithinFunctionDetails = [
                  ...metadataWithinFunctionDetails,
                  metadataInfo
                ];
                metadataInfoLoaded = {
                  ...metadataInfoLoaded,
                  metadataWithinFunctionDetails: metadataWithinFunctionDetails
                };

                metadataInfoLoaded = {
                  ...metadataInfoLoaded,
                  metadataWithinFunctionDetails: metadataWithinFunctionDetails
                };
                this.store.dispatch(
                  new UpdateDictionaryMetadataAction(metadataId, {
                    description: functionDescription,
                    data: metadataInfoLoaded,
                    progress: {
                      loading: false,
                      loadingSucceeded: true,
                      loadingFailed: false
                    }
                  })
                );
              });
          } else if (metadata.href.indexOf('categoryOptionCombos/') > -1) {
            this.httpClient
              .get(
                'categoryOptionCombos/' +
                  metadata.id +
                  '.json?fields=id,name,description,shortName,code,categoryOptions'
              )
              .subscribe(categoryOptionCombo => {
                const metadataInfo = {
                  type: 'category option combination',
                  info: categoryOptionCombo
                };
                metadataWithinFunctionDetails = [
                  ...metadataWithinFunctionDetails,
                  metadataInfo
                ];
                metadataInfoLoaded = {
                  ...metadataInfoLoaded,
                  metadataWithinFunctionDetails: metadataWithinFunctionDetails
                };

                metadataInfoLoaded = {
                  ...metadataInfoLoaded,
                  metadataWithinFunctionDetails: metadataWithinFunctionDetails
                };
                this.store.dispatch(
                  new UpdateDictionaryMetadataAction(metadataId, {
                    description: functionDescription,
                    data: metadataInfoLoaded,
                    progress: {
                      loading: false,
                      loadingSucceeded: true,
                      loadingFailed: false
                    }
                  })
                );
              });
          }
          console.log('metadataInfoLoaded', metadataInfoLoaded);
        });
    });
  }

  getItemsFromRule(ruleDefinition) {
    if (
      JSON.parse(ruleDefinition).data &&
      JSON.parse(ruleDefinition).data.length === 11
    ) {
      return JSON.parse(ruleDefinition).data;
    } else {
      console.log(
        'JSON.parse(ruleDefinition).data',
        JSON.parse(ruleDefinition)
          .data.split(';')
          .join('.')
          .split('.')
          .join(',')
      );
      return JSON.parse(ruleDefinition)
        .data.split(';')
        .join('.')
        .split('.')
        .join(',');
    }
  }

  formatFunctionsObject(functionInfo) {
    const newMetadataTemplate = {
      created: functionInfo.created,
      lastUpdated: functionInfo.lastUpdated,
      lastUpdatedBy: functionInfo.lastUpdatedBy,
      user: functionInfo.user,
      id: functionInfo.key,
      name: JSON.parse(functionInfo.value).name,
      description: JSON.parse(functionInfo.value).description,
      rules: JSON.parse(functionInfo.value).rules,
      publicAccess: functionInfo.publicAccess,
      externalAccess: functionInfo.externalAccess,
      function: JSON.parse(functionInfo.value).function
    };

    return newMetadataTemplate;
  }

  displayUserInfo(userInfo) {
    let user = '';
    user +=
      '<strong><span  title="Phone: ' +
      userInfo.phoneNumber +
      ', Email: ' +
      userInfo.email +
      '">' +
      userInfo.name +
      '</span></strong>';
    return user;
  }

  formatProgramIndicatorExpression(expression) {
    return expression
      .replace(/V{event_count}/g, '')
      .replace(/#/g, '')
      .replace(/{/g, '')
      .replace(/}/g, '');
  }

  listRelatedIndicators(programIndicators, programIndicatorId) {
    let listOfRelatedIndicators = '';
    programIndicators.forEach((programIndicator, index) => {
      if (programIndicator.id !== programIndicatorId && index < 3) {
        if (programIndicators.length === 1) {
          listOfRelatedIndicators +=
            '<span style="color: #325E80;">' +
            programIndicator.name +
            '</span>';
        } else if (programIndicators.length === 2) {
          if (index === 0) {
            listOfRelatedIndicators +=
              '<span style="color: #325E80;">' +
              programIndicator.name +
              '</span>';
          } else {
            listOfRelatedIndicators +=
              ' and <span style="color: #325E80;">' +
              programIndicator.name +
              '</span>';
          }
        } else {
          if (index === 0) {
            listOfRelatedIndicators +=
              '<span style="color: #325E80;">' +
              programIndicator.name +
              '</span>,';
          } else if (index === 1) {
            listOfRelatedIndicators +=
              '<span style="color: #325E80;">' +
              programIndicator.name +
              '</span>';
          } else {
            listOfRelatedIndicators +=
              ' and <span style="color: #325E80;">' +
              programIndicator.name +
              '</span>';
          }
        }
      }
    });
    return listOfRelatedIndicators;
  }

  formatTextToSentenceFormat(text) {
    text
      .split('_')
      .map(function(stringSection) {
        return (
          stringSection.slice(0, 1).toUpperCase() +
          stringSection.slice(1).toLowerCase()
        );
      })
      .join(' ');
    return (
      text
        .split('_')
        .join(' ')
        .slice(0, 1)
        .toUpperCase() +
      text
        .split('_')
        .join(' ')
        .slice(1)
        .toLowerCase()
    );
  }
}
