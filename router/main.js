schema = require('../schema');
fs = require('fs');
path = require('path');
exceptions = require('../util/exceptions');
SentenceExtractException = exceptions.SentenceExtractException;


models = schema.models;

function genericError(res, err) {
	console.error(err.stack);
	res.status(500).json({error: err.toString()});
}

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
		genericError(res, err);
	});
}

function normalizeWordTxt(word) {
	word = word.toLowerCase();
	word = word.replace(/[\.\!\?\']/g, '');
	return word;
}

function findAllIndicesInArray(haystack, needle) {
	var indices = [];
	var startIndex = 0;
	var findIndex;
	while ((findIndex = haystack.indexOf(needle, startIndex)) !== -1) {
		indices.push(findIndex);
		startIndex = findIndex + 1;
	}
	return indices;
}

function makeLineWord(word, lineId, begin, end) {
	word = normalizeWordTxt(word);
	var word = models.Word({
		txt: word,
		type: 'LineWord'
	});
	return word.save().then(savedWord => {
		var lineWord = models.LineWord({
			wordId: savedWord.id,
			lineId: lineId,
			begin: begin,
			end: end,
		});
		return lineWord.save().then(savedLineWord => { return {
			word: savedWord,
			lineWord: savedLineWord
		}});
	});
}

module.exports = function(app, upload) {
	app.get('/sanity', (req, res) => {
		res.json({'you\'re': 'good'});
	});

	// Return the main form that shows all data and presents some forms
	app.get('/', (req, res) => {
		var pUnextracted = models.WavFile.all({
			where: {lineId: null}
		});
		var pLines = models.Line.all();
		renderPromiseForm(res,
			Promise.all([pUnextracted, pLines])
			.then(results => {
			var unextracted = results[0];
			var lines = results[1];
			console.log("There are " + unextracted.length + " unextracted wav files");
			console.log("There are " + lines.length + " extracted lines");
			return Promise.all(lines.map(line => line.wordsView())).then(lineWords => {
				return Promise.all(lines.map(line => line.wav())).then(wavs => {
					return {
						html: 'forms.html',
						model: {
							unextracted: unextracted,
							lines: lines,
							lineWords: lineWords,
							wavs: wavs
						}
					};
				});
			});
		}));
	});

	// Upload a new, unmarked WAV file
	// TODO: This could be done in large batches. It should also check bitrate using nodejs' "wav" library.
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

	// Download a single WAV file by its ID
	app.get('/wav/:wavid', (req, res) => {
		let wavId = req.params.wavid;
		let query;
		let numReg = /^\d+$/;
		if (numReg.test(wavId)) {
			query = {id: wavId};
		}
		else {
			query = {uuid: wavId};
		}
		models.WavFile.all({
			where: query
		}).then(wavs => {
			var wav = wavs[0];
			var filePath = path.join(__dirname, '..', 'uploads', wav.uuid);
			var stat = fs.statSync(filePath);
			res.writeHead(200, {
				'Content-Type': 'audio/wav',
				'Content-Length': stat.size
			});
			var readStream = fs.createReadStream(filePath);
			readStream.pipe(res);
		}, err => {
			genericError(res, err);
		});
	});

	// Extract a new line based on a WAV file (give it a grammatical sentence, and have
	// the words be automatically split out)
	app.post('/line', upload.none(), (req, res) => {
		var wavFileId = req.body.wavFileId;
		renderPromiseJson(res, models.WavFile.find(wavFileId).then(wavFile => {

			return models.LineGroup.findOrCreate({
				where: {name: req.body.lineGroupName}
			}, {
				name: req.body.lineGroupName
			}).then(lineGroup => {
			
				var line = models.Line({
					wavFile: req.body.wavFileId,
					grammaticalSentence: req.body.sentence,
					linegroupId: lineGroup.id
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
			});
		}).then(s => null));
	});

	// Edit Line, assign new timings to each word. Does NOT allow you to add new words.
	// TODO: Should use PUT, but not possible in a basic HTML view
	app.post('/line/:lineId', upload.none(), (req, res) => {
		var lineId = req.params.lineId;
		renderPromiseJson(res, models.Line.find(lineId).then(line => {
			return line.linewords().then(words => {
				var promises = words.map(word => {
					var beginId = 'wordbegin_' + word.id;
					if (beginId in req.body) {
						word.begin = req.body[beginId];
						word.end = req.body['wordend_' + word.id];
						return word.save();
					}
					return null;
				});
				// remove nulls
				promises = promises.filter(p => p);
				return Promise.all(promises).then(res => null);
			});
		}));
	});

	// Query for words based on a given sentence
	app.get('/wordquery', upload.none(), (req, res) => {
		var sentence = req.query.sentence;
		var lineGroupName = req.query.lineGroupName;
		var lgPromise = models.LineGroup.find({
			where: {name: lineGroupName}
		});
		
		renderPromiseJson(res, lgPromise.then(lineGroup => {
			var words = [];
			var sentencePart;
			var wordPattern = /\S+/g;
			while (sentencePart = wordPattern.exec(sentence)) {
				var normalized = normalizeWordTxt(sentencePart[0]);
				if (normalized) {
					words.push(normalized);
				}
			}
			return models.Word.all({
				where: {txt: words}
			}).then(foundWords => {
				var expectedWordsSet = new Set(words);
				var foundWordsSet = new Set(foundWords.map(fw => fw.txt));
				var missingWords = expectedWordsSet.difference(foundWordsSet);
				if (missingWords.size != 0) {
					throw new SentenceExtractException("Could not find the following words: \"" + Array.from(missingWords).join(', ') + "\"");
				}
				var wordPromises = new Array(words.length);
				for (var i = 0; i < wordPromises.length; i++) {
					wordPromises[i] = [];
				}
				for (var fWord of foundWords) {
					var wordIndices = findAllIndicesInArray(words, fWord.txt);
					for (var wordIdx of wordIndices) {
						wordPromises[wordIdx].push(fWord.wavSegmentsView());
					}
				}
				return Promise.all(wordPromises.map(wordResults => {
					return Promise.all(wordResults);
				})).then(wordViewArray => {
					return wordViewArray.map((wordOptions, i) => {
						return {
							word: words[i],
							options: wordOptions
						};
					});
				});
				/*return Promise.all(words.map(word => {
					return foundWords.filter(fWord => fWord.txt === )
				}));*/
			})
		}));
	});

	// Delete a line extraction, AND all words associated with it for cleanup.
	// Maybe this could use SQL "cascade delete" however that works?
	app.delete('/line/:lineId', (req, res) => {
		res.status(500).json({err: "This method has not been implemented yet"});
	})
}