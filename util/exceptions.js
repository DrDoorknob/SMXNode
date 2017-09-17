class ExtendableError extends Error {
	constructor(message) {
		super(message);
		Object.setPrototypeOf(this, ExtendableError.prototype);
		this.name = this.constructor.name;
	}

	dump() {
		return { message: this.message, stack: this.stack }
	}
}    
 

class SentenceExtractException extends ExtendableError {}

exports.ExtendableError = ExtendableError;
exports.SentenceExtractException = SentenceExtractException;