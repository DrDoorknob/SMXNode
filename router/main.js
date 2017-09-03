schema = require('../schema');

function renderPromiseForm(res, p) {
	p.then(v => {
		res.render(v.html, v.model);
	}, err => {
		res.status(500).render('error.html', {error: err.toString()});
	});
}

function renderPromiseJson(res, p) {
	p.then(v => {
		if (v) {
			res.json(v);
		}
		else {
			res.status(201).end();
		}
	}, err => {
		res.status(500).json({error: err.toString()});
	});
}

module.exports = function(app, upload) {
	app.get('/sanity', (req, res) => {
		res.json({'you\'re': 'good'});
	});
	app.get('/', (req, res) => {
		renderPromiseForm(res, schema.models.WavFile.all({
			line: null
		}).then(unextracted => {
			
			console.log("There are " + unextracted.length + " unextracted wav files");
			return {
				html: 'forms.html',
				model: {
					unextracted: unextracted
				}
			};
		}));
	});
	app.post('/wav', upload.single('wav'), (req, res) => {
		console.log("Request is " + req);
		var file = req.file;
		var wav = new schema.models.WavFile({
			filename: file.originalname,
			uuid: file.filename,
			bitrate: 44000
		});
		renderPromiseJson(res, wav.save().then(s => {
			ok: true
		}));
	});
	app.post('/line', upload.none(), (req, res) => {
		var wavFileId = req.body.wavFileId;
		renderPromiseJson(res, schema.models.WavFile.find(wavFileId).then(wavFile => {
			
			var line = schema.models.Line({
				wavFile: req.body.wavFileId,
				grammaticalSentence: req.body.sentence
			});
			wavFile.line = line;
			return Promise.all([line.save(), wavFile.save()]);
		}).then(s => null));
	})
}