var polyfills = require('./util/polyfills');
var SmxSchema = require('./schema');
var Express = require('express');
var multer = require('multer');
var uuid4 = require('uuid/v4');
var app = Express();

SmxSchema.autoupdate(err => {
	if (!err) {
		console.log("Automigration successful");
	}
	else {
		console.error("Automigration failed - " + err);
	}
});

// html rendering (Old multi-form view for base testing)
//app.set('views',__dirname + '/views');
//app.set('view engine', 'ejs');
//app.engine('html', require('ejs').renderFile);
app.use(Express.static('client/dist'));

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
var server = app.listen(81, () => {
	console.log("We have started SMXNode on port 81");
})