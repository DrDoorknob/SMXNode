import {Express} from 'express';
import {multer} from 'multer';
import {uuid4} from 'uuid/v4';
import {renderFile} from 'ejs';
var app = Express();

declare var __dirname:string;

// html rendering
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', renderFile);

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