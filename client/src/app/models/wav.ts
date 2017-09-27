var context = new AudioContext();

export class WavFile {
	file:File;
	buffer:AudioBuffer;
	lineStr:string;

	audioSegment(begin = 0, end = this.buffer.duration):AudioSegment {
		return new AudioSegment(this, begin, end);
	}

}

export class SentenceQueryResults {
	constructor(public success:boolean, public wordOptions:WordExtractionOption[][] ) {}
}

export class WordExtractionOptions {
	constructor(public word:string, public options:WordExtractionOption[]) {}
}

export class WordExtractionOption {
	constructor(public segments:AudioSegmentData[], public priority = 200) {
		
	}
}

export class AudioSegmentData {
	constructor(public wavUuid:string, public length:number, public grammaticalSentence:string, public lineId:number) {}
}

export class AudioSegment {

	constructor(public wavFile:WavFile,
		public begin:number,
		public end:number) {
		
	}
}

function trimToTime(buffer, startTime, endTime) {
	var newBuffer = context.createBuffer(buffer.numberOfChannels, (endTime - startTime) * buffer.sampleRate, buffer.sampleRate);
	var array = buffer.getChannelData(0).slice(
		Math.floor(startTime * buffer.sampleRate), 
		Math.floor(endTime * buffer.sampleRate));
	newBuffer.copyToChannel(array, 0);
	return newBuffer;
}

function concatenate(buff1, buff2) {
	if (buff1.numberOfChannels != buff2.numberOfChannels || buff1.sampleRate != buff2.sampleRate) {
		throw 'Fuck you.';
	}
	var newBuffer = context.createBuffer(buff1.numberOfChannels, buff1.length + buff2.length, buff1.sampleRate);
	var audio = new Float32Array(newBuffer.length);
	audio.set(buff1.getChannelData(0), 0);
	audio.set(buff2.getChannelData(0), buff1.length);
	newBuffer.copyToChannel(audio, 0);
	return newBuffer;
}

/*
$('#execute').click(() => {
	var files = $('input[type=file]').map((x,i) => i.files[0]);
	var audios = files.map((x,f) => {
		var reader = new FileReader();
		return new Promise((s,fail) => {
			reader.onload = x => {
				var result = reader.result;
				context.decodeAudioData(result).then(s,fail);
			};
			reader.readAsArrayBuffer(f);
		});
	});
	Promise.all(audios).then(buffers => {
		var finalSeconds = 4.170;
		var final =context.createBuffer(1, context.sampleRate * finalSeconds, context.sampleRate);

		var b1 = trimToTime(buffers[0], 0, 3.22);
		var final = concatenate(b1, buffers[1]);
		var source = context.createBufferSource();
		source.buffer = final;
		source.connect(context.destination);
		source.start();
	})
});*/