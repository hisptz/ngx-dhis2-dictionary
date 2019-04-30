import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-visualization-container',
  templateUrl: './visualization-container.component.html',
  styleUrls: ['./visualization-container.component.css']
})
export class VisualizationContainerComponent implements OnInit {
  @Input() viewId: string;
  @Input() reportType: string;
  @Input() numeratorDataSets: any[];
  @Input() denominatorDataSets: any[];
  visualizationInput: any;
  constructor() {}

  ngOnInit() {
    const dataSets = _.uniqBy(
      [...this.numeratorDataSets, ...this.denominatorDataSets],
      'id'
    );

    if (dataSets.length > 0) {
      this.visualizationInput = {
        id: this.viewId,
        type: 'TABLE',
        isNonVisualizable: false,
        uiConfig: {
          shape: 'NORMAL',
          height: '450px',
          width: 'span 12',
          showBody: true,
          showFilters: false,
          hideFooter: true,
          hideHeader: false,
          hideManagementBlock: true,
          hideTypeButtons: false,
          showInterpretionBlock: true,
          hideResizeButtons: true,
          showTitleBlock: false
        },
        layers: [
          {
            id: `${this.viewId}_layer`,
            config: {
              name: 'Untitled',
              type: 'COLUMN'
            },
            dataSelections: [
              {
                dimension: 'dx',
                name: 'Data',
                layout: 'columns',
                items: dataSets.map((dataSet: any) => {
                  return {
                    id: `${dataSet.id}.${this.reportType}`,
                    name: dataSet.name
                  };
                })
              },
              {
                dimension: 'pe',
                name: 'Period',
                layout: 'rows',
                items: [
                  {
                    id: 'LAST_4_QUARTERS',
                    name: 'LAST_4_QUARTERS'
                  },
                  {
                    id: 'THIS_QUARTER',
                    name: 'THIS_QUARTER'
                  }
                ]
              },
              {
                dimension: 'ou',
                layout: 'filters',
                name: 'Organisation Unit',
                items: [
                  {
                    id: 'USER_ORGUNIT',
                    name: 'User OrgUnit'
                  }
                ]
              }
            ]
          }
        ]
      };
    }
  }
}
