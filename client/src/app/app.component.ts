import { Component } from '@angular/core';
import {QueryService} from './services/query.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	sentence = 'how embarrassing';

	constructor(private queryService:QueryService) {}

	mix() {
		this.queryService.querySentence(this.sentence, 'dispentryporter').subscribe(result => {
			if (!result.success) {
				alert('Couldn\'t extract the sentence');
				return;
			}
			window['theresult'] = result.wordOptions;
			console.log(result.wordOptions);
		});
	}
}
