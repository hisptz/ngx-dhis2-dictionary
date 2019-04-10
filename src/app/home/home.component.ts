import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

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
      // dictionary/:ids/:option/:selected
      if(params['selected'] && params['selected'] !== 'all') {
        this.selectedItem = params['selected'];
        let identifiers = [];
        params['ids'].split(',').forEach((param) => {
          identifiers.push(param);
        })
        this.metadataIdentifiers = identifiers;
      } else {
        this.metadataIdentifiers = this.metadataIdentifiersArr;
        this.selectedItem = 'all';
        let identifiers = [];
        params['ids'].split(',').forEach((param) => {
          identifiers.push(param);
        })
        this.metadataIdentifiers = identifiers;
        this.router.navigate(['dictionary/' + identifiers.join(',') + '/selected/all'])
      }
    })
  }

  dictionaryItemId(event) {
    if (event.indexOf('all') < 0) {
      this.router.navigate(['dictionary/' + event])
    } else {
      let identifiers = [];
      event.split('/')[2].split(',').forEach((id) => {
        identifiers.push(id);
      })
      this.metadataIdentifiers = identifiers;
      this.router.navigate(['dictionary/' + event])
    }
  }

}
