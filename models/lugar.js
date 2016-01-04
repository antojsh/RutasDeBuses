var mongoose = require('mongoose'),
	Schema= mongoose.Schema;

var lugares = new Schema({
	name: String,
	description: String,
	city: String,
	flota:String,
	image:String,
	loc:{
	 	type:[],
		index:'2d'
	 }
});

module.exports = mongoose.model('Lugares',lugares);