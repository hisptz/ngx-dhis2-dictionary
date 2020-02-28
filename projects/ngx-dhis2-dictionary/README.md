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
          (dictionaryItemId)="dictionaryItemId($event)"
          (metadataInfo)="metadataInfo($event)"
          (metadataGroupsInfo)="metadataGroupsInfo($event)"
        ></ngx-dhis2-dictionary-list>
</div>
```

Where metadataIdentifiers are DHIS2 metadata ids you want to ge.

Selected item can be passed or not, if passed should be one of the metadata ids you want to be selected by default

dictionaryItem outputs the url with format "ids/selected/selectedId"

metadataInfo is an output object with the format below

```{
        type: "indicator",
        data: [array of loaded metadata]
   }
```

      for type 'indicator' you get indicator and for type 'programIndicator' you get program indicators

metadataGroupsInfo is an out put for indicator or programIndicator groups.

````[
        {
                id: "groupIdentifier",
                name: "Name",
                metadataTypeKey: "[{"id": "indentifier"}]"
        }

  ]```
  metadataTypeKey can be "indicators" or "programIndicators"

Currently supported ones are indicators, program indicators, data sets, data elements and functions
````
