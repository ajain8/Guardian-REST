// app/models/apikey.js
// load the things we need
var mongoose = require('mongoose');
// var mongooseTypes = require('mongoose-types');
// var userTimestamps = moongoseTypes.useTimestamps;

var apikeySchema = mongoose.Schema({

	session              : {
        email          	 : String,
        apikey           : String,
        createdAt        : Date
    }
})

module.exports = mongoose.model('APIKey', apikeySchema);

