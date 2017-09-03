schema = require('../schema');

module.exports = function(app, upload) {
	app.get('/', (req, res) => {
		res.render('forms.html')
	});
	app.post('/line', upload.single('wav'), (req, res) => {
		console.log("Request is " + req);
		var file = req.file;
		console.log(file);
		res.json({fack: 'yoo'});
		var wav = new schema.models.WavFile({
			filename: file.originalname,
			uuid: file.filename,
			bitrate: 44000
		});
		wav.save();
	})
}