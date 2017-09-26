import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { WaveformComponent } from './components/waveform/waveform.component';
import { QueryService } from './services/query.service';
import { CreationService } from './services/creation.service';
import { HttpModule } from '@angular/http';

@NgModule({
  declarations: [
    AppComponent,
    WaveformComponent
  ],
  imports: [
    BrowserModule, HttpModule
  ],
  providers: [QueryService, CreationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
