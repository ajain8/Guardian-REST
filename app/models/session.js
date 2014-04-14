// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
// var mongooseTypes = require('mongoose-types');
// var userTimestamps = moongoseTypes.useTimestamps;
var bcrypt   = require('bcrypt-nodejs');

var sessionSchema = mongoose.Schema({

	session              : {
        name             : String,
        email          	 : String,
        pin     	     : String,
        startDate	 	 : Number,
        endDate		 	 : Number,
        finalLocation    : {
        	latitude: Number,
        	longitude: Number
        },
        locationArray   : [{
            timeStamp: Number,
        	latitude: Number,
        	longitude: Number
        }],
        guardianContactArray  : [{
            name  : String,
            phone : String,
            email : String,
            status: String,
            smsUpdates: Boolean
        }]
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

