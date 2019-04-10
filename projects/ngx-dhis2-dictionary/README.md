# NgxDhis2DictionaryModule

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.6.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Using the library

To use the library, put this in your component
```
<div class="dictionary-block">
        <ngx-dhis2-dictionary-list 
        [metadataIdentifiers]="metadataIdentifiers" 
        [selectedItem]="selectedItem"
        (dictionaryItemId)="dictionaryItemId($event)"></ngx-dhis2-dictionary-list>
</div>
```

Where metadataIdentifiers are metadata ids you want to get.

Selected item can be passed or not, if passed should be one of the metadata ids you want to be selected by default

dictionaryItem outputs the url with format "ids/selected/selectedId"

Currently supported ones are indicators, program indicators, data sets and data elements

