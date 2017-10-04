import { TestBed, inject } from '@angular/core/testing';

import { WavService } from './wav.service';

describe('WavService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WavService]
    });
  });

  it('should be created', inject([WavService], (service: WavService) => {
    expect(service).toBeTruthy();
  }));
});
