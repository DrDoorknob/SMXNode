var Schema = require('jugglingdb').Schema;
var schema = new Schema('mysql', {
	host: 'localhost',
	port: 3306,
	username: 'root',
	database: 'sentencemix'
});

var WavFile = schema.define('WavFile', {
	filename: {type: String, limit: 255},
	uuid: {type: String, limit: 37}, // 37 when counting dashes
	bitrate: {type: Number}
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
	end: {type: Number, dataType: 'float', precision: 20}
});

var CompoundWord = schema.define('CompoundWord', {
	txt: {type: String, limit: 20}
});

var MixSegment = schema.define('MixSegment', {
	begin: {type: Number, dataType: 'float', precision: 20},
	end: {type: Number, dataType: 'float', precision: 20}
});

WavFile.belongsTo(Line);

LineGroup.hasMany(Line);

Line.hasMany(Word);

MixSegment.belongsTo(WavFile);
WavFile.belongsTo(MixSegment);

CompoundWord.hasMany(MixSegment);

schema.autoupdate(err => {
	if (!err) {
		console.log("Automigration successful");
	}
	else {
		console.error("Automigration failed - " + err);
	}
});

module.exports = schema;