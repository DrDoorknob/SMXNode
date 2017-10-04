import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { SentenceQueryResults, WordExtractionOption, WordExtractionOptions, AudioSegmentData } from '../models/wav';
import { Observable } from 'rxjs';

@Injectable()
export class QueryService {

  constructor(private http:Http) { }

  querySentence(sentence:string, lineGroup:string):Observable<SentenceQueryResults> {
    return this.http.get('/wordquery', {
      search: {
        lineGroupName: lineGroup,
        sentence: sentence
      }
    }).map((results:Response) => {
      return new SentenceQueryResults(true, (<any[]>results.json()).map(wordResults => {
        var wordOptions = (<any[]>wordResults.options).map(wordResult => 
          new WordExtractionOption(wordResult.map(
            segmentData => AudioSegmentData.fromJson(segmentData)
          )));
        return new WordExtractionOptions(wordResults.word, wordOptions);
      }));
      // Array one is the array of words
      // Array two is the different options you have for that word.
      // Array three is all of the audio segments that that word consists of. (Usually 1, but not always)

    });
  }

}
