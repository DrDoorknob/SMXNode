import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptionsArgs } from '@angular/http';
import {ReplaySubject, Observable} from 'rxjs';
import {WavFile} from '../models/wav';

@Injectable()
export class CreationService {

  constructor(private http:Http) { }

  uploadWavs(wavFiles:WavFile[]):Observable<any> {
    var headers = new Headers({
      'Encoding-Type': 'multipart/form-data'
    });
    var options = {
      headers: headers
    };
    var req = this.http.post('/wav', {
      wav: wavFiles.map(wf => wf.file)
    }, options);
    var rs = new ReplaySubject();
    req.subscribe(rs);
    return rs;
  }

}
