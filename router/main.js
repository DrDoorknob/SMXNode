schema = require('../schema');

models = schema.models;

function renderPromiseForm(res, p) {
	p.then(v => {
		res.render(v.html, v.model);
	}, err => {
		console.error(err.stack);
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
		console.error(err.stack);
		res.status(500).json({error: err.toString()});
	});
}

function makeLineWord(word, lineId, begin, end) {
	var word = models.Word({
		txt: word,
		begin: begin,
		end: end,
		type: 'LineWord'
	});
	return word.save().then(savedWord => {
		var lineWord = models.LineWord({
			wordId: savedWord.id,
			lineId: lineId
		});
		return lineWord.save();
	});
}



module.exports = function(app, upload) {
	app.get('/sanity', (req, res) => {
		res.json({'you\'re': 'good'});
	});
	app.get('/', (req, res) => {
		var pUnextracted = models.WavFile.all({
			line: null
		});
		var pLines = models.Line.all();
		renderPromiseForm(res,
			Promise.all([pUnextracted, pLines])
			.then(results => {
			var unextracted = results[0];
			var lines = results[1];
			console.log("There are " + unextracted.length + " unextracted wav files");
			console.log("There are " + lines.length + " extracted lines");
			return {
				html: 'forms.html',
				model: {
					unextracted: unextracted,
					lines: lines
				}
			};
		}));
	});
	app.post('/wav', upload.single('wav'), (req, res) => {
		console.log("Request is " + req);
		var file = req.file;
		var wav = new models.WavFile({
			filename: file.originalname,
			uuid: file.filename,
			bitrate: 44000
		});
		renderPromiseJson(res, wav.save().then(s => {
			console.log(s);
			ok: true
		}));
	});
	app.post('/line', upload.none(), (req, res) => {
		var wavFileId = req.body.wavFileId;
		renderPromiseJson(res, models.WavFile.find(wavFileId).then(wavFile => {
			
			var line = models.Line({
				wavFile: req.body.wavFileId,
				grammaticalSentence: req.body.sentence
			});
			wavFile.line = line;
			var promises = [];
			return line.save().then(savedLine => {
				wavFile.lineId = savedLine.id;
				var splitLine = line.grammaticalSentence.split(' ');
				var promises = splitLine.map(
					(word, i) => makeLineWord(word, savedLine.id, i, i+ 1));
				promises.push(wavFile.save());
				return Promise.all(promises);
			});
		}).then(s => null));
	})
}