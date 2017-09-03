schema = require('./schema');

schema.automigrate(err => {
	if (!err) {
		console.log("Automigration successful");
	}
	else {
		console.error("Automigration failed - " + err);
	}
});