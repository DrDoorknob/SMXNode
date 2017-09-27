import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { SentenceQueryResults, WordExtractionOption, WordExtractionOptions, AudioSegmentData } from '../models/wav';

@Injectable()
export class QueryService {

  constructor(private http:Http) { }

  querySentence(sentence:string, lineGroup:string) {
    return this.http.get('/wordquery', {
      search: {
        lineGroupName: lineGroup,
        sentence: sentence
      }
    }).map((results:any) => {
      return new SentenceQueryResults(true, results.json().map(wordResults => {
        var wordOptions = wordResults.options.map(wordResult => 
          new WordExtractionOption(wordResult.map(segmentData => 
            new AudioSegmentData(segmentData.wav.uuid, segmentData.end - segmentData.begin, segmentData.line.grammaticalSentence, segmentData.line.id)
          )));
        return new WordExtractionOptions(wordResults.word, wordOptions);
      }))
      // Array one is the array of words
      // Array two is the different options you have for that word.
      // Array three is all of the audio segments that that word consists of. (Usually 1, but not always)

    });
  }

}
