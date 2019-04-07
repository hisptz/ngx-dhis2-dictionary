import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  metadataIdentifiers: any[] = ['ulgL07PF8rq','sB79w2hiLp8','vDdRoZYybP2', 'Kswd1r4qWLh', 'O8Kuzjsx2Zm','fbfJHSPpUD','xsRrGKBoLCm'];
  routingConfiguration = {
    hasRouting: true
  }
  isFullScreen: boolean = true;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
  }
}
