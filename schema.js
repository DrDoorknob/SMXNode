var Schema = require('jugglingdb').Schema;
var schema = new Schema('mysql', {
	host: '127.0.0.1',
	port: 3306,
	username: 'root',
	database: 'sentencemix'
});

var WavFile = schema.define('WavFile', {
	filename: {type: String, limit: 255},
	uuid: {type: String, limit: 37}, // 37 when counting dashes
	bitrate: {type: Number},
	length: {type: Number}
});

var LineGroup = schema.define('LineGroup', {
	name: {type: String, limit: 255}
});

var Line = schema.define('Line', {
	grammaticalSentence: {type: String, limit: 4096}
});

Line.prototype.wav = function() {
	return WavFile.findOne({where: {lineId: this.id}});
}


var Word = schema.define('Word', {
	txt: {type: String, limit: 20},
	type: {type: String, limit: 10}
});

Line.prototype.wordsView = function() {
	return this.linewords().then(linewords => {
		var ids = linewords.map(lw => lw.wordId);
		if (ids.length == 0) {
			return [];
		}
		return Word.all({
			where: {id: ids}
		}).then(words => {
			var wDict = {};
			for (var word of words) {
				wDict[word.id] = word;
			}
			return linewords.map(lw => {
				return Object.assign({}, wDict[lw.wordId].toObject(), lw.toObject());
			});
		});
	})
}

// Doesn't work anymore now that begin/end have moved - won't return in order
/*
Line.prototype.words = function() {
	return this.linewords().then(linewords => {
		var ids = linewords.map(lw => lw.wordId);
		if (ids.length == 0) {
			return [];
		}
		return Word.all({
			where: {id: ids}
		});
	});
}*/
var LineWord = schema.define('LineWord', {
	begin: {type: Number, dataType: 'float', precision: 20},
	end: {type: Number, dataType: 'float', precision: 20},
});

var CompoundWord = schema.define('CompoundWord', {
	
});

Word.prototype.wavSegmentsView = function() {
	if (this.type === 'LineWord') {
		return LineWord.findOne({
			where: {wordId: this.id}
		}).then(lw => {
			return Line.find(lw.lineId).then(line => {
				return WavFile.findOne({
					where: {lineId: lw.lineId}
				}).then(wav => [{
					wav: wav.toObject(),
					line: line.toObject(),
					begin: lw.begin,
					end: lw.end
				}]);
			});
		});
	}
	else {
		throw new Error("Not implemented!");
	}
}

var MixSegment = schema.define('MixSegment', {
	begin: {type: Number, dataType: 'float', precision: 20},
	end: {type: Number, dataType: 'float', precision: 20}
});

WavFile.belongsTo(Line);

LineGroup.hasMany(Line);
LineGroup.hasMany(Word); // This is kind of a necessary evil for easy word searches...I think? I don't like data duplication though.
// At any rate, it's the only reference back that the CompoundWords have.

Line.hasMany(LineWord);

LineWord.belongsTo(Word);
CompoundWord.belongsTo(Word);

MixSegment.belongsTo(WavFile);

CompoundWord.hasMany(MixSegment);

module.exports = schema;