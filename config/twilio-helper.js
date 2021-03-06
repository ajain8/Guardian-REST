// Load the twilio module
var twilio = require('twilio');
var moment = require('moment');

// Create a new REST API client to make authenticated requests against the
// twilio back end
var client = new twilio.RestClient('AC0b9e9c8a50f9acb63de3571d79f42a91', '833aaa052df7531546d020157ddc52fb');
 
// Pass in parameters to the REST API using an object literal notation. The
// REST client will handle authentication and response serialzation for you.
exports.sendGuardianRequest = function (guardianContact, requesterName, requestStartDate, requestEndDate, link){
        var guardianName = guardianContact.name;
        var requestStartTime = moment(requestStartDate).format("h A");
        var requestEndTime = moment(requestEndDate).format("hh A");

        var messageBody = 'Hello '+guardianName;
        messageBody += '! Would you like to be '+requesterName;
        messageBody += '\'s Guardian from '+requestStartTime;
        messageBody += ' onwards, please respond with a YES or NO?';
        //var messageBody = 'Hello '+guardianName+'! ';
        // messageBody += requesterName+' would like  you to be their';
        // messageBody += ' Guardian from '+requestStartTime;
        //messageBody += ' Session Link: '+link;
        //console.log(messageBody);
        //console.log("Twilio Helper with "+guardianContact.phone+" "+email);
        client.sendSms({
        to: guardianContact.phone,
        from:'+16788827697',
        body: messageBody
    }, function(error, message) {
        // The HTTP request to Twilio will run asynchronously. This callback
        // function will be called when a response is received from Twilio
        // The "error" variable will contain error information, if any.
        // If the request was successful, this value will be "falsy"
        if (!error) {
            // The second argument to the callback will contain the information
            // sent back by Twilio for the request. In this case, it is the
            // information about the text messsage you just sent:
            console.log('Success! The SMS was sent to '+guardianContact.name+' ('+guardianContact.phone+')');
            //console.log(message);

        } else {
            console.log(error);
            console.log('Oops! The SMS could not be sent to '+guardianContact.name+' ('+guardianContact.phone+')');
        }
    });
}

exports.sendMessage = function (message, guardianContact){
        client.sendSms({
        to: guardianContact.phone,
        from:'+16788827697',
        body: message
    }, function(error, message) {
        // The HTTP request to Twilio will run asynchronously. This callback
        // function will be called when a response is received from Twilio
        // The "error" variable will contain error information, if any.
        // If the request was successful, this value will be "falsy"
        if (!error) {
            // The second argument to the callback will contain the information
            // sent back by Twilio for the request. In this case, it is the
            // information about the text messsage you just sent:
            console.log('Success! The SMS was sent to '+guardianContact.name+' ('+guardianContact.phone+')');
        } else {
            console.log(error);
            console.log('Oops! The SMS could not be sent to '+guardianContact.name+' ('+guardianContact.phone+')');
        }
    });
}
