import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'wav-uploader',
  templateUrl: './wav-uploader.component.html',
  styleUrls: ['./wav-uploader.component.css']
})
export class WavUploaderComponent implements OnInit {

  files:File[] = [];

  constructor() { }

  ngOnInit() {
  }

}
