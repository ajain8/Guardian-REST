// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var mongooseTypes = require('mongoose-types');
var userTimestamps = moongoseTypes.useTimestamps;
var bcrypt   = require('bcrypt-nodejs');

var sessionSchema = mongoose.Schema({

	session              : {
        uid          	 : String,
        password     	 : String,
        startDate	 	 : Date,
        endDate		 	 : Date,
        finalLocation    : {
        	latitude: Number,
        	longitude: Number
        },
        locationsArray   : [{
        	latitude: Number,
        	longitude: Number,
        	timeStamp: Number
        }]
    }
})

sessionSchema.plugin(useTimestamps);

//methods ========================
//generating a hash
sessionSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
sessionSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('Session', sessionSchema);

