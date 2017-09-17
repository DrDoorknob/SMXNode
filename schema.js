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


var Word = schema.define('Word', {
	txt: {type: String, limit: 20},
	begin: {type: Number, dataType: 'float', precision: 20},
	end: {type: Number, dataType: 'float', precision: 20},
	type: {type: String, limit: 10}
});

Line.prototype.words = function() {
	return this.linewords().then(linewords => {
		var ids = linewords.map(lw => lw.wordId);
		return Word.all({
			where: {id: ids},
			order: 'begin'
		});
	});
}
var LineWord = schema.define('LineWord', {

});

var CompoundWord = schema.define('CompoundWord', {
	
});

var MixSegment = schema.define('MixSegment', {
	begin: {type: Number, dataType: 'float', precision: 20},
	end: {type: Number, dataType: 'float', precision: 20}
});

WavFile.belongsTo(Line);

LineGroup.hasMany(Line);

Line.hasMany(LineWord);

LineWord.belongsTo(Word);
CompoundWord.belongsTo(Word);

MixSegment.belongsTo(WavFile);
WavFile.belongsTo(MixSegment);

CompoundWord.hasMany(MixSegment);

module.exports = schema;