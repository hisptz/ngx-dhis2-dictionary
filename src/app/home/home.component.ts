import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as _ from 'lodash';
import { Identifiers } from '@angular/compiler';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  selectedItem: string;
  metadataIdentifiers: any;
  metadataIdentifiersArr: any[] = ['ulgL07PF8rq','sB79w2hiLp8','vDdRoZYybP2', 'Kswd1r4qWLh', 'O8Kuzjsx2Zm','fbfJHSPpUD','xsRrGKBoLCm'];
  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      console.log(params['selected'])
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
          identifiers.push(this.selectedItem);
          this.metadataIdentifiers = _.uniq(identifiers);
          this.router.navigate(['dictionary/' + _.uniq(identifiers).join(',') + '/selected/' + this.selectedItem])
        }
      } else {
        this.metadataIdentifiers = this.metadataIdentifiersArr;
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
      this.router.navigate(['dictionary/' + _.uniq(identifiers).join(',') + '/selected/' + listOfItemsObj.selected])
    }
  }

}
