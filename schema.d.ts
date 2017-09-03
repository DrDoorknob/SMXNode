declare class JugglingModel {
	constructor(values:{[key:string]:any});
	save();
}
export class WavFile extends JugglingModel{
	filename:string;
	uuid:string;
	bitrate:number;
}