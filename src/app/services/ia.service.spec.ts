import { TestBed } from '@angular/core/testing';

import { IAService } from './ia.service';

describe('IAService', () => {
  let service: IAService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IAService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
