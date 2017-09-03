import {WavFile} from '../schema';

export = function(app, upload) {
	app.get('/', (req, res) => {
		res.render('forms.html')
	});
	app.post('/line', upload.single('wav'), (req, res) => {
		var file = req.file;
		res.json({fack: 'yoo'});
		var wav = new WavFile({
			filename: file.originalname,
			uuid: file.filename,
			bitrate: 44000
		});
		wav.save();
	})
}