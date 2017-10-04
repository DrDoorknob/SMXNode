import { Component } from '@angular/core';
import {QueryService} from './services/query.service';
import { WavService } from './services/wav.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	sentence = 'how embarrassing';

	constructor(private queryService:QueryService, private wavService:WavService) {}

	mix() {
		this.queryService.querySentence(this.sentence, 'dispentryporter').subscribe(result => {
			if (!result.success) {
				alert('Couldn\'t extract the sentence');
				return;
			}
			Promise.all(result.wordOptions.map(options => {
				return Promise.all(options.options[0].segments.map(segmentData => {
					// TODO: It's likely that here, rather than load the entire 5-second wav, we should be loading just the data about the 1 second
					// that is being asked for.
					// In future we can implement some kind of wav cache by UUID that has a maximum memory limit.
					return this.wavService.loadWavSegment(segmentData);
				}));
			})).then(wavArrays => {
				var flatBufferArray:AudioBuffer[] = [].concat(...wavArrays);
				var finalbuffer = this.wavService.concatenateArray(flatBufferArray);
				this.wavService.preview(finalbuffer);
			});
		});
	}
}
