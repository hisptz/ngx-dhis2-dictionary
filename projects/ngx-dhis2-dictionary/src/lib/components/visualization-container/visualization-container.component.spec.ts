import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizationContainerComponent } from './visualization-container.component';

describe('VisualizationContainerComponent', () => {
  let component: VisualizationContainerComponent;
  let fixture: ComponentFixture<VisualizationContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisualizationContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizationContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
