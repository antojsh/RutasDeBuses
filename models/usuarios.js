var mongoose = require('mongoose'),
	Schema= mongoose.Schema;

var usuarios = new Schema({
	name: String,
	provider: String,
	provider_id: String,
	photo:String,
	createdAt:{type: Date, default: Date.now}

});

module.exports = mongoose.model('Usuarios',usuarios);
