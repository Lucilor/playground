import { TestBed } from '@angular/core/testing';

import { NeteaseMusicService } from './netease-music.service';

describe('NeteaseMusicService', () => {
  let service: NeteaseMusicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NeteaseMusicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
