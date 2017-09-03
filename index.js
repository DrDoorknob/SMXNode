var SmxSchema = require('./schema');
var Express = require('express');
var multer = require('multer');
var uuid4 = require('uuid/v4');
var app = Express();

// html rendering
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// file upload handling
var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, './uploads')
	},
	filename: (req, file, cb) => {
		
		cb(null, uuid4());
	}
})
var upload = multer({storage: storage});

require('./router/main')(app, upload);

// startup
var server = app.listen(80, () => {
	console.log("We have stated our saver on port 9999999");
})