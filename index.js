var Schema = require('jugglingdb').Schema;
var schema = new Schema('mysql', {
	host: 'localhost',
	port: 3306,
	username: 'root',
	database: 'sentencemix'
});

var Wav_File = schema.define('Wav_File', {
	filename: {type: String, limit: 255},
	uuid: {type: String, limit: 24}
}, {
	table: 'wav_file'
});

schema.automigrate();