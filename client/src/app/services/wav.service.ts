import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AudioSegmentData, WavFile, AudioSegment } from '../models/wav';

@Injectable()
export class WavService {

  private audioContext = new AudioContext();

  constructor(private http:Http) {}

  loadWav(audioData:AudioSegmentData):Promise<WavFile> {
    var filepath = `/wav/${audioData.wavUuid}`;
    return new Promise<AudioBuffer>((success, fail) => {

      var x = new XMLHttpRequest();
      x.responseType = 'arraybuffer';
      x.onerror = fail;
      x.onload = () => {
        try {
          var file = new File([x.response], filepath, { type: x.getResponseHeader('Content-Type')});
          var contentLength = parseInt(x.getResponseHeader('Content-Length'));
          var reader = new FileReader();
          reader.onload = () => {
            var ab:ArrayBuffer = reader.result;
            this.audioContext.decodeAudioData(ab).then(success, fail);
          };
          reader.onerror = fail;
          // TODO: reader.onerror
          reader.readAsArrayBuffer(file);
        }
        catch(err) {
          fail(err);
        }
        
      };
      x.open('GET', filepath);
      x.send();
    }).then(ab => {
      return new WavFile(audioData.wavUuid, ab, audioData.grammaticalSentence);
    });
  }

  loadWavSegment(audioData:AudioSegmentData):Promise<AudioBuffer> {
    return this.loadWav(audioData).then(wav => {
      // TODO: Cache wav
      return this.trimToTime(wav.buffer, audioData.wavBegin, audioData.wavEnd);
    });
  }

  trimToTime(buffer:AudioBuffer, startTime:number, endTime:number):AudioBuffer {
    var newBuffer = this.audioContext.createBuffer(buffer.numberOfChannels, (endTime - startTime) * buffer.sampleRate, buffer.sampleRate);
    var array = buffer.getChannelData(0).slice(
      Math.floor(startTime * buffer.sampleRate), 
      Math.floor(endTime * buffer.sampleRate));
    newBuffer.copyToChannel(array, 0);
    return newBuffer;
  }

  concatenate(a:AudioBuffer, b:AudioBuffer):AudioBuffer {
    if (a.numberOfChannels !== b.numberOfChannels ||
    a.sampleRate !== b.sampleRate) {
      throw 'Could not concatenate buffers - mismatched type data';
    }
    var ab = this.audioContext.createBuffer(a.numberOfChannels, a.length + b.length, a.sampleRate);
    for (var i = 0; i < a.numberOfChannels; i++) {
      var audio = new Float32Array(ab.length);
      audio.set(a.getChannelData(i), 0);
      audio.set(b.getChannelData(i), a.length);
      ab.copyToChannel(audio, i);
    }
    return ab;
  }

  concatenateArray(buffers:AudioBuffer[]):AudioBuffer {
    if (buffers.length === 0) {
      throw 'Given empty array to concatenate';
    }
    const baseline = buffers[0];
    if (!buffers.every(b => b.numberOfChannels === buffers[0].numberOfChannels ||
      b.sampleRate === baseline.sampleRate)) {
        throw `Could not concatenate buffers - mismatched type data`;
    }
    var totalLength = buffers.reduce((countLen, buffer) => countLen + buffer.length, 0);
    var ab = this.audioContext.createBuffer(baseline.numberOfChannels, totalLength, baseline.sampleRate);
    for (var i = 0; i < baseline.numberOfChannels; i++) {
      var audio = new Float32Array(ab.length);
      let insertPos = 0;
      for (var buffer of buffers) {
        audio.set(buffer.getChannelData(i), insertPos);
        insertPos += buffer.length;
      }
      ab.copyToChannel(audio, i);
    }
    return ab;
  }

  preview(buffer:AudioBuffer) {
    let bs = this.audioContext.createBufferSource();
    bs.buffer = buffer;
    bs.connect(this.audioContext.destination);
    bs.start();
  }

}
