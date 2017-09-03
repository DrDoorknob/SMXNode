"use strict";
var schema_1 = require("../schema");
module.exports = function (app, upload) {
    app.get('/', function (req, res) {
        res.render('forms.html');
    });
    app.post('/line', upload.single('wav'), function (req, res) {
        var file = req.file;
        res.json({ fack: 'yoo' });
        var wav = new schema_1.WavFile({
            filename: file.originalname,
            uuid: file.filename,
            bitrate: 44000
        });
        wav.save();
    });
};
