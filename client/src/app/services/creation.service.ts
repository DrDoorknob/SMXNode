import { Injectable } from '@angular/core';
import {Http} from '@angular/http';
import {ReplaySubject, Observable} from 'rxjs';

@Injectable()
export class CreationService {

  constructor(private http:Http) { }

  uploadWavs(wavFiles:WavFile[]):Observable<any> {
    var req = this.http.post('/wav', {
      wav: wavFiles.map(wf => wf.file)
    });
    var rs = new ReplaySubject();
    req.subscribe(rs);
    return rs;
  }

}
