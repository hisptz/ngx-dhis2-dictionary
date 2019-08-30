import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as _ from 'lodash';
import { Identifiers } from '@angular/compiler';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  selectedItem: string;
  metadataIdentifiers: any;
  systemSettings: any;
  metadataIdentifiersArr: any[] = ['e0Dca8sKCB0','Bcy5tKA08ar.U6iBxWNlWyx','W92vvsUDVfx.FmGzPdBtHaJ', 'BfMAe6Itzgt', 'ulgL07PF8rq','sB79w2hiLp8','vDdRoZYybP2', 'Kswd1r4qWLh', 'O8Kuzjsx2Zm','fbfJHSPpUD','xsRrGKBoLCm'];
  constructor(private router: Router, private route: ActivatedRoute, private httpClient: NgxDhis2HttpClientService) {}

  ngOnInit() {
    this.httpClient.get('system/info').subscribe((systemInfoSettings) => {
      this.systemSettings = systemInfoSettings;
    })
    this.route.params.forEach((params: Params) => {
      if (params['selected'] != undefined) {
        if (params['selected'] == 'all' && !params['ids']) {
          this.metadataIdentifiers = [];
          this.selectedItem = params['selected']
          this.router.navigate(['dictionary/all'])
        } else {
          this.selectedItem = params['selected'];
          let identifiers = [];
          params['ids'].split(',').forEach((param) => {
            identifiers.push(param);
          })
          if (this.selectedItem != 'all') {
            identifiers.push(this.selectedItem);
          }
          this.metadataIdentifiers = _.uniq(identifiers);
          this.router.navigate(['dictionary/' + _.uniq(identifiers).join(',') + '/selected/' + this.selectedItem])
        }
      } else {
        this.metadataIdentifiers = this.metadataIdentifiersArr;
        this.selectedItem = this.metadataIdentifiers[0];
        this.router.navigate(['dictionary/' + _.uniq(this.metadataIdentifiers).join(',') + '/selected/' + this.metadataIdentifiers[0]])
      }
    })
  }

  dictionaryItemId(listOfItemsObj) {
    if (listOfItemsObj.selected == 'all') {
      this.metadataIdentifiers = listOfItemsObj['otherSelectedIds'];
      if (this.metadataIdentifiers.length > 0) {
        let identifiers = [];
        _.map(this.metadataIdentifiers, (identifier) =>{
          if (identifier != 'all') {
            identifiers.push(identifier)
          }
        })
        this.metadataIdentifiers = identifiers;
        this.selectedItem = listOfItemsObj.selected;
        this.router.navigate(['dictionary/' + _.uniq(identifiers).join(',') + '/selected/' + listOfItemsObj.selected])
      } else {
        this.router.navigate(['dictionary/all'])
      }
    } else {
      let identifiers = [];
      listOfItemsObj['otherSelectedIds'].forEach((identifier) => {
        if (identifier != 'all') {
          identifiers.push(identifier);
        }
      })
      if (_.indexOf(listOfItemsObj.selected) < 0) {
        identifiers.push(listOfItemsObj.selected)
      }
      this.metadataIdentifiers = _.uniq(identifiers);
      this.selectedItem = listOfItemsObj.selected;
      this.router.navigate(['dictionary/' + _.uniq(identifiers).join(',') + '/selected/' + listOfItemsObj.selected])
    }
  }

  getSharedLink(identifiers) {
    if (this.systemSettings) {
      let selBox = document.createElement('textarea');
      selBox.style.position = 'fixed';
      selBox.style.left = '0';
      selBox.style.top = '0';
      selBox.style.opacity = '0';
      selBox.value = this.systemSettings.keyRemoteInstanceUrl + '/api/apps/Indicator-Dictionary/index.html#/dictionary/' + _.uniq(identifiers).join(',') + '/selected/' + this.selectedItem;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand('copy');
      document.body.removeChild(selBox);
      let messagePart = document.getElementById('copied-message')
      setTimeout(function(){ messagePart.style.display = 'inline-block'; messagePart.style.marginBottom = '-20px';}, 100);
      setTimeout(function(){ messagePart.style.display = 'none'; }, 1500);
    }
  }
}
