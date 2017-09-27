import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { AppComponent } from './app.component';
import { WaveformComponent } from './components/waveform/waveform.component';
import { QueryService } from './services/query.service';
import { CreationService } from './services/creation.service';
import { HttpModule } from '@angular/http';
import { WavUploaderComponent } from './components/wav-uploader/wav-uploader.component';
import 'rxjs/operator/map';
import 'rxjs/operator/toPromise';

@NgModule({
  declarations: [
    AppComponent,
    WaveformComponent,
    WavUploaderComponent
  ],
  imports: [
    BrowserModule, HttpModule, FormsModule
  ],
  providers: [QueryService, CreationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
