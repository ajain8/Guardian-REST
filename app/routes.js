// load up the apikey and user model
var User       		= require('../app/models/user');
var Session       		= require('../app/models/session');
var twilio_helper = require('../config/twilio-helper');
var uuid = require('node-uuid');
var express = require('express');
var clients = [];
var pendingSessionQueue = {};
var activeSessions= {};
var twilio = require('twilio');
var schedule = require('node-schedule');
var nodemailer = require("nodemailer");

// var _ = require("underscore");

module.exports = function(app, passport, io) {
	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		console.log("About to load index page");
		res.render('index.ejs', { message1: req.flash('loginMessage'), message2: req.flash('signupMessage'), }); // load the index.ejs file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') }); 
	});

	// process the login form
	// app.post('/login', do all our passport stuff here);

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));


	// =====================================
	// PROFILE SECTION =====================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/api/logout', function(req, res) {
		req.logout();
		return res.json(true);
	});

	app.post('/api/login', function(req, res, next) {
	  passport.authenticate('local-login', function(err, user, info) {
	    if (err) { return next(err); }
	    if (!user) { return res.json(false); }
	    req.logIn(user, function(err) {
	      if (err) { return next(err); }
	      return res.json(true);
	    });
	  })(req, res, next);
	});

	app.post('/api/alertPanic/:id', isLoggedIn, function(req, res) {
		Session.findById(req.params.id, function (err, session) {
			if(session === null){
				return res.send(404);
			}
			if (!err) {
				io.sockets.emit("alertPanic",{sessionID: req.params.id});
				var guardianContactArray = session.session.guardianContactArray;
				for (var i=0; i<guardianContactArray.length; i++) {
				    	var guardian = guardianContactArray[i];
				    	message = session.session.name+" has alerted a Panic signal, please call him immediately!";
						twilio_helper.sendMessage(message, guardian);
				}
				return res.json(true);
			} else {
				return res.json(false);
			}
		});
	});


	// app.post('/api/login', userAuth, function(req, res){
	// 	return res.json(true);
	// });

	app.post('/api/createSession', isLoggedIn, function(req, res, next){
			// console.log(req.user.local);
			var userEmail = req.user.local.email;
			var userName = req.user.local.name;
			var newSession = new Session();
			// console.log(JSON.stringify(req.body));
			newSession.session.name = userName;
			newSession.session.email = userEmail;
			newSession.session.startDate = req.body.startDate;
			newSession.session.endDate = req.body.endDate;
			newSession.session.finalLocation = req.body.finalLocation;
			newSession.session.locationArray = req.body.locationArray;
			newSession.session.guardianContactArray = req.body.guardianContactArray;
			newSession.save(function(err) {
				if (!err) {	
					var guardianContactArray = newSession.session.guardianContactArray;
				    console.log("Session Created");
				    //console.log(guardianContactArray);
				    for (var i=0; i<guardianContactArray.length; i++) {
				    	var guardian = guardianContactArray[i];
				    	console.log(guardian.name+" : "+guardian.phone);
				    	var startDate=  newSession.session.startDate;
				    	var endDate = newSession.session.endDate;
				    	//console.log("Guardian: "+guardian);
				    	pendingSessionQueue[guardian.phone] = newSession._id; //ching code
				    	//console.log("Value of guardian.smsUpdates: "+guardian);
				    	 if(guardian.smsUpdates === true){
				    	 	//console.log("I reach here");
<<<<<<< HEAD
				    	 	var link = "https://guardian-11570.onmodulus.net/getSession/"+newSession._id;
				    	 	twilio_helper.sendGuardianRequest(guardian, userName, startDate, endDate, link);
				    	 	// if(req.user.local.e)
				    	 	sendEmail(link, req.user.local, guardian);
=======
				    	 	//twilio_helper.sendGuardianRequest(guardian, userName, startDate, endDate);
>>>>>>> 72ebf2ae193cbfd180fd0490a490456a6741f8db
				    	 }
				    }
				    var startDate = new Date(newSession.session.startDate);
				    var endDate = new Date(newSession.session.endDate);
				    var halfWay = new Date(newSession.session.startDate + ((newSession.session.endDate - newSession.session.startDate)/2));
				    var sessionId = newSession._id;
				    console.log("Start Time: " + startDate);
				    console.log("Half Time: " + halfWay);
				    console.log("End Time: " + endDate);
				    (function(sessionId){		
					    activeSessions[sessionId] = schedule.scheduleJob(endDate, function(){
					    	// var j = schedule.scheduleJob(date, function(){
					    	Session.findById(sessionId, function (err, session) {
<<<<<<< HEAD
					    		if(!err && session!=null){
						    		var finalLoc =session.session.finalLocation;
							    	var lastLoc =session.session.locationArray[session.session.locationArray.length -1];
							    	var dist = distance(finalLoc.latitude,
							    						finalLoc.longitude,
							    						lastLoc.latitude,
							    						lastLoc.longitude);

							    	var currtime = new Date();
								    var time1 = currtime.getTime();
								    var lastTime = new Date(lastLoc.timeStamp);
								    var time2 = lastTime.getTime();
								    var message='';

							    	if(dist > 0.1)
							    	{
								    	console.log(session.session.name + ' has not reached his final destination, call him!');
									    message += session.session.name + " has not reached his final destination, call him!";
									    	//twilio_helper.sendMessage(message, session.session.guardianContactArray[i]);
								    }
								    else
								    {
								    	console.log(session.session.name + ' has arrived at his final destination!');
									    message += session.session.name + ' has arrived at his final destination!';
									    	//twilio_helper.sendMessage(message, session.session.guardianContactArray[i]);
								    	//activeSessions[session._id].cancel;
								    	//console.log("Before | Active Sessions: "+activeSessions);
								    	//console.log("Session ID: "+session);

								    	delete activeSessions[session._id];
								    	//console.log("After | Active Sessions: "+activeSessions);
								    }
								    	//call delete session
								    for (var i=0; i<session.session.guardianContactArray.length; i++) {
								    	twilio_helper.sendMessage(message, session.session.guardianContactArray[i]);
									}
					    		}
					    		else{
					    			console.log("Session could not be found!");
					    		}
=======
					    	var finalLoc =session.session.finalLocation;
					    	var lastLoc =session.session.locationArray[session.session.locationArray.length -1];
					    	var dist = distance(finalLoc.latitude,
					    						finalLoc.longitude,
					    						lastLoc.latitude,
					    						lastLoc.longitude);

					    	var currtime = new Date();
						    var time1 = currtime.getTime();
						    var lastTime = new Date(lastLoc.timeStamp);
						    var time2 = lastTime.getTime();
						    var message;
						    console.log('endSession check: '+currtime + lastTime);
						    console.log("last updated: " + ((time1-time2)/(60*1000)) + "miutes ago" );

						    if((time1 - time2 ) > (5*60*1000) )
						    {
						    	console.log('last update from '+session.session.name + ' is more than 5 minutes ago. ');
						    	//for (var i=0; i<session.session.guardianContactArray.length; i++) {
							    	message += 'last update from '+session.session.name + ' is more than 5 minutes ago. ';
							    	//twilio_helper.sendMessage(message, session.session.guardianContactArray[i]);
						    	//}
						    }
						    else
						    {
						    	console.log(session.session.name + ' just updated recently');
						    }

					    	if(dist > 0.1)
					    	{
						    	console.log(session.session.name + ' has not reached home, call him');
						    	
							    message += session.session.name + " has not reached home, call him";
							    	//twilio_helper.sendMessage(message, session.session.guardianContactArray[i]);
						    }
						    else
						    {
						    	console.log(session.session.name + ' has arrived home!');
							    message += session.session.name + " has arrived home!";
							    	//twilio_helper.sendMessage(message, session.session.guardianContactArray[i]);
						    	//activeSessions[session._id].cancel;
						    	delete activeSessions[session._id];
						    }
						    	//call delete session
						    //for (var i=0; i<session.session.guardianContactArray.length; i++) {
						    	//twilio_helper.sendMessage(message, session.session.guardianContactArray[i]);
							//}
					    	});
				    	});
				    })(sessionId);

				    (function(sessionId){		
					    var j = schedule.scheduleJob(halfWay, function(){
					    	// var j = schedule.scheduleJob(date, function(){
					    	Session.findById(sessionId, function (err, session) {
					    	var lastLoc =session.session.locationArray[session.session.locationArray.length -1];
					    	// var currtime = new Date();


					    	var time1 = halfWay.getTime();
					    	var lastTime = new Date(lastLoc.timeStamp);
					    	var time2 = lastTime.getTime();
					    	console.log('halfway check: ' +halfWay + lastTime);
					    	console.log("last updated: " + ((time1-time2)/(60*1000)) + "miutes ago" );
					    	if((time1 - time2 > (5*60*1000) ) || session.session.locationArray.length == 0)
					    	{
						    	console.log(session.session.name + ' has not updated his location for 5 minutes, call him');
						    	//for (var i=0; i<session.session.guardianContactArray.length; i++) {
							    	//var message = session.session.name + " has not updated his location for 15 minutes, call him";
							    	//twilio_helper.sendMessage(message, session.session.guardianContactArray[i]);
						    	//}
						    }
						    else
						    {
						    	console.log(session.session.name + ' is updating');
						    	//j.cancel;
						    }
						    	//call delete session
>>>>>>> 72ebf2ae193cbfd180fd0490a490456a6741f8db
					    	});
				    	});
				    })(sessionId);
					//console.log("Outside | Active Sessions: "+activeSessions);
				    // (function(sessionId){		
					   //  var j = schedule.scheduleJob(halfWay, function(){
					   //  	// var j = schedule.scheduleJob(date, function(){
					   //  	Session.findById(sessionId, function (err, session) {
					   //  	var lastLoc =session.session.locationArray[session.session.locationArray.length -1];
					   //  	// var currtime = new Date();


					   //  	var time1 = halfWay.getTime();
					   //  	var lastTime = new Date(lastLoc.timeStamp);
					   //  	var time2 = lastTime.getTime();
					   //  	console.log('halfway check: ' +halfWay + lastTime);
					   //  	if((time1 - time2 > (15*60*1000) ) || session.session.locationArray.length == 0)
					   //  	{
						  //   	console.log(session.session.name + ' has not updated his location for 15 minutes, call him');
						  //   	for (var i=0; i<session.session.guardianContactArray.length; i++) {
							 //    	var message = session.session.name + " has not updated his location for 15 minutes, call him";
							 //    	twilio_helper.sendMessage(message, session.session.guardianContactArray[i]);
						  //   	}
						  //   }
						  //   else
						  //   {
						  //   	console.log(session.session.name + ' is updating');
						  //   	//j.cancel;
						  //   }
						  //   	//call delete session
					   //  	});
				    // 	});
				    // })(sessionId);
					
				    //console.log("BOOYEAH: "+newSession._id);
				    //console.log("Session Information: "+newSession);
					return res.send(newSession);
				    } else {
				      return res.send(401);
				    }
			});
		}
	 );

	function distance(lat1, lon1, lat2, lon2) {
	    var radlat1 = Math.PI * lat1/180;
	    var radlat2 = Math.PI * lat2/180;
	    var radlon1 = Math.PI * lon1/180;
	    var radlon2 = Math.PI * lon2/180;
	    var theta = lon1-lon2;
	    var radtheta = Math.PI * theta/180;
	    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	    dist = Math.acos(dist);
	    dist = dist * 180/Math.PI;
	    dist = dist * 60 * 1.1515;
	    return dist * 1.609344;
	}

	app.get('/api/getSessionIdsForUser', function(req, res){
		console.log(req.query.email);
		Session.find({email:req.params.id}, function (err, sessions){
			if(!err)
			{
				var sessionIdArray=[];
				for(var i=0;i<sessions.length-1;i++){
					sessionIdArray.push(sessions[i]._id);
				}
				return res.json(sessionIdArray);
			}
			else 
				return res.send(401);
		});
	});

	app.post('/api/messageRecieved', function(req,res){
		//console.log(req);
		// if (twilio.validateExpressRequest(req, '833aaa052df7531546d020157ddc52fb')) {
	        console.log("Message recieved via Twilio");
			var resp = new twilio.TwimlResponse();

			var request_body = req.body.Body;
			var request_from = req.body.From;
			console.log(req.body);
			//console.log(pendingSessionQueue);

			if(request_from in pendingSessionQueue){
				console.log("I REACH HERE");
				var targetSession = pendingSessionQueue[request_from];
				console.log("Contents of message: "+request_body);
				if(request_body.match(/yes/gi) && request_body.length == 3)
				{
					var link = "https://guardian-11570.onmodulus.net/getSession?id="+targetSession;
					resp.message('Thank you! Session Link: '+link);
					Session.findById(targetSession, function (err, session) {
						if(session === null){
							return res.send(404);
						}
						else if (!err && session != null) {
							var guardianContactArray = session.session.guardianContactArray;
							for(var i=0;i<guardianContactArray.length;i++)
							{
								var guardian = guardianContactArray[i];
								if(guardian.phone === request_from)
									guardian.status = "active";
								break;
							}

						}
					});
					delete pendingSessionQueue[request_from];
				}

				else if(request_body.match(/no/gi) && request_body.length == 2)
				{
					resp.message('Thank you for your response!');
					Session.findById(targetSession, function (err, session) {
						if(session === null){
							return res.send(404);
						}
						else if (!err && session != null) {
							var guardianContactArray = session.session.guardianContactArray;
							for(var i=0;i<guardianContactArray.length;i++)
							{
								var guardian = guardianContactArray[i];
								if(guardian.phone === request_from)
									guardian.status = "inactive";
								break;
							}
						}
					});
					delete pendingSessionQueue[request_from];
				}
				else
				{
					resp.message('Incorrect Response.');
				}


				
				 //Render the TwiML document using "toString"
		    	// res.writeHead(200, {
		     // 	   'Content-Type':'text/xml'
		   		//  });
				console.log(resp.toString());
			    res.type('text/xml');
		    	res.send(resp.toString());
	    	}
		    //}
		    else {
		        res.send('you are not twilio.  Buzz off.');
		    }
		
	});

	// app.post('/api/messageRecieved', function(req, res){
	// 	console.log("Message recieved via Twilio");
	// 	var resp = new twilio.TwimlResponse();

	// 	//resp.say('express sez - hello twilio!');
	// 	resp.message('Thank you for your response!');
	// 	 //Render the TwiML document using "toString"
 //    	//res.writeHead(200, {'Content-Type':'text/xml'});
	//     res.type('text/xml');
	//     console.log(resp.toString());
 //    	res.end(resp.toString());
	// });

	// app.post('/api/createSession', userAuth, function(req, res){
	// 	var email = requestEmail(req);
	// 	var newSession = new Session();
	// 	console.log(JSON.stringify(req.body.startDate));
	// 	newSession.session.email = email;
	// 	newSession.session.startDate = req.body.startDate;
	// 	newSession.session.endDate = req.body.endDate;
	// 	newSession.session.finalLocation = req.body.finalLocation;
	// 	newSession.session.locationsArray = req.body.locationArray;
	// 	newSession.session.guardianContact = req.body.guardianContact;
	// 	newSession.save(function(err) {
	// 		if (!err) {
	// 		      return console.log("session created");
	// 		    } else {
	// 		      return console.log(err);
	// 		    }
	// 	});
	// 	return res.send(newSession);
	// });

	app.get('/api/getSession/:id', isLoggedIn, function(req, res){
		Session.findById(req.params.id, function (err, session) {
			if (!err && session !=null) {
				return res.json(session);
			} else {
				return res.send(404);
			}
		});
	});


	app.get('/getSession/:id', function(req, res){
		Session.findById(req.params.id, function (err, session) {
			if (!err && session != null) {
				console.log("sessionid: "+session._id);
				io.sockets.on('connection', function (socket) {
  					clients[session._id] = socket;
				});
				//console.log("Client Socket ID: "+clients[session._id].id);
				res.render('session.ejs', {
					session : session,
					contactArray: session.session.guardianContactArray					
				});
			} else {

				return res.send(404);
			}
		});
	});

	app.get('/getSession', function(req, res){
		var session_id = req.query.id;
		Session.findById(session_id, function (err, session) {
			if (!err && session != null) {
				console.log("sessionid: "+session._id);
				io.sockets.on('connection', function (socket) {
  					clients[session._id] = socket;
				});
				//console.log("Client Socket ID: "+clients[session._id].id);
				res.render('session.ejs', {
					session : session,
					contactArray: session.session.guardianContactArray
				});
			} else {
				return res.send(404);
			}
		});
	});


	app.get('/getLocationsArrayForSession/:id', function(req, res){
		Session.findById(req.params.id, function (err, session) {
			if(session === null){
				return res.send(404);
			}
			if (!err) {
				return res.json(session.session.locationArray);
			} else {
				return res.send(404);
			}
		});
	});



	app.post('/api/updateLocationsArrayForSession/:id', isLoggedIn, function(req, res){
			var email = req.user.local.email;
		return Session.findById(req.params.id, function (err, session) {
			if(session === null){
				return res.send(404);
			}
			else if(!err && session.session.email === email && typeof req.body.location != 'undefined'){
				//console.log("Headers: ", req.headers);
				console.log(req.body.location);
				var newLocation = req.body.location;
				session.session.locationArray.push(newLocation);
				//console.log("Session ID: "+session._id);
				//console.log("socket id: "+socket.id);
				//var socket = clients[session._id];
				session.save(function(err) {
					if (!err) {
				      console.log("updated");
				      return res.json(true);
				    } else {
				      console.log(err);
				      return res.json(false);
				    }
				});

				io.sockets.emit("updatedLocationArray");
				// console.log("Client Socket Array: "+clients);
				//return res.json(session);
			}
			else {
				console.log(err)
				return res.send(401);
			}
		});
	});

	app.post('/api/deleteSession/:id', isLoggedIn, function(req, res){
		var email = req.user.local.email;
		return Session.findById(req.params.id, function (err, session) {
			if(session === null){
				return res.send(404);
			}
			if(!err && session.session.email === email){
				//console.log(session);
				io.sockets.emit("deletedSession", {session_id: session._id});
				var guardianContactArray = session.session.guardianContactArray;
				for(var i=0;i<guardianContactArray.length;i++){
					var guardian=guardianContactArray[i];
					delete pendingSessionQueue[guardian.phone];
				}
				return session.remove(function(err){
					if(!err){
						console.log("Session Removed");
						return res.json(true);
					}
					else {
						console.log(err);
						return res.json(false);
					}
				});
			}
			else {
				console.log(err)
				return res.send(401);
			}
		});
	});

	// io.on("connection", function(socket){
	// 	socket.on("connect", function(data) {
	// 		clients[session._id] = socket;
	// 	});

 //  		socket.on("disconnect", function() {
  			
 //  		});
	// });
	// io.sockets.on('disconnect', function (socket) {

	// 		clients[session._id] = socket;
	// });
};

var requestEmail = function(req){
		var auth = req.headers['authorization'];  // auth is in base64(username:password)  so we need to decode the base64
        var tmp = auth.split(' ');   // Split on a space, the original auth looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part
        var buf = new Buffer(tmp[1], 'base64'); // create a buffer and tell it the data coming in is base64
        var plain_auth = buf.toString();        // read it back out as a string
        var creds = plain_auth.split(':');      // split on a ':'
        var email = creds[0];
        return email;
};

var userAuth = express.basicAuth(function(user, pass, callback) {
        User.findOne({ 'local.email' :  user }, function(err, user) {
        console.log("Searched user database!");
        // if there are any errors, return the error before anything else
        if (err)
            return callback(null, false);

        // if no user is found, return the message
        if (!user)
            return callback(null, false) // req.flash is the way to set flashdata using connect-flash

        // if the user is found but the password is wrong
        if (!user.validPassword(pass))
            return callback(null, false); // create the loginMessage and save it to session as flashdata

        // all is well, return successful user
        return callback(null, user);
    });
});

function sendEmail(link, requester, guardian){
	// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "guardian.fh.gatech@gmail.com",
        pass: "guardian2014"
    }
});

// setup e-mail data with unicode symbols
var mailOptions = {
    from: "guardian.fh.gatech@gmail.com", // sender address
    to: guardian.email, // list of receivers
    subject: "Guardian Session", // Subject line
    text: "", // plaintext body
    html: "<p>Hello "+guardian.name+",</p><p>You can keep track of "+requester.name+" by using the following link,</p><p><b><a href=\""+link+"\">Session Link</a></b></p><p>Thank You</p>" // html body
}

// send mail with defined transport object
	smtpTransport.sendMail(mailOptions, function(error, response){
	if(error){
	    console.log(error);
	}else{
	    console.log("Message sent: " + response.message);
	}

    // if you don't want to use this transport object anymore, uncomment following line
    //smtpTransport.close(); // shut down the connection pool, no more messages
});

}
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
