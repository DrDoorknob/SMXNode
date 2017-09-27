import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WavUploaderComponent } from './wav-uploader.component';

describe('WavUploaderComponent', () => {
  let component: WavUploaderComponent;
  let fixture: ComponentFixture<WavUploaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WavUploaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WavUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
