import { Injectable } from '@angular/core';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  userGroups;
  user;
  constructor(private httpClient: NgxDhis2HttpClientService) {}

  /**
   * Load current user information
   */
  loadCurrentUser(): Observable<any> {
    return this.httpClient
      .get(`me.json?fields=id,name,displayName,created,lastUpdated,email,
    dataViewOrganisationUnits[id,name,level],organisationUnits[id,name,level],userCredentials[username]`);
  }

  getUserGroups() {
    return new Observable(observable => {
      if (this.userGroups) {
        observable.next(this.userGroups);
        observable.complete();
      } else {
        this.httpClient.get('userGroups').subscribe(
          (results: any) => {
            this.userGroups = results.userGroups;
            observable.next(this.userGroups);
            observable.complete();
          },
          error => {
            observable.error(error.json());
            observable.complete();
          }
        );
      }
    });
  }
  getCurrentUser() {
    return new Observable(observable => {
      if (this.user) {
        observable.next(this.user);
        observable.complete();
      } else {
        this.loadCurrentUser().subscribe(
          results => {
            this.user = results;
            observable.next(this.user);
            observable.complete();
          },
          error => {
            observable.error(error);
            observable.complete();
          }
        );
      }
    });
  }
}
