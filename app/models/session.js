// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
// var mongooseTypes = require('mongoose-types');
// var userTimestamps = moongoseTypes.useTimestamps;
var bcrypt   = require('bcrypt-nodejs');

var sessionSchema = mongoose.Schema({

	session              : {
        email          	 : String,
        pin     	     : String,
        startDate	 	 : Date,
        endDate		 	 : Date,
        finalLocation    : {
        	latitude: Number,
        	longitude: Number
        },
        locationsArray   : [{
        	latitude: Number,
        	longitude: Number,
        	timeStamp: Date
        }],
        guardianContact    : {
            phone : Number,
            email : String
        }
    }
})

// sessionSchema.plugin(useTimestamps);

//methods ========================
//generating a hash
sessionSchema.methods.generateHash = function(pin) {
    return bcrypt.hashSync(pin, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
sessionSchema.methods.validPin = function(pin) {
    return bcrypt.compareSync(pin, this.local.pin);
};

module.exports = mongoose.model('Session', sessionSchema);

