// load up the apikey and user model
var User       		= require('../app/models/user');
var Session       		= require('../app/models/session');
var uuid = require('node-uuid');
var express = require('express');

module.exports = function(app, passport) {
	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		console.log("About to load index page");
		res.render('index.ejs'); // load the index.ejs file
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
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
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
	app.post('/api/login', auth, function(req, res){
		return res.json(true);
	});

	app.post('/api/createSession', auth, function(req, res){
		var newSession = new Session();
		console.log(JSON.stringify(req.body.startDate));
		newSession.session.email = req.body.email;
		newSession.session.startDate = req.body.startDate;
		newSession.session.endDate = req.body.endDate;
		newSession.session.finalLocation = req.body.finalLocation;
		newSession.session.locationsArray = req.body.locationArray;
		newSession.session.guardianContact = req.body.guardianContact;
		newSession.save(function(err) {
			if (!err) {
			      return console.log("session created");
			    } else {
			      throw err;
			    }
		});
		return res.send(newSession);
	});

	app.get('/api/getSession/:id', function(req, res){
		return Session.findById(req.params.id, function (err, session) {
			if (!err) {
				return res.send(session);
			} else {
				return console.log(err);
			}
		});
	});


	app.get('/getSession/:id', function(req, res){
		return Session.findById(req.params.id, function (err, session) {
			if (!err) {
				res.render('session.ejs', {
					session : session
				});
			} else {
				return console.log(err);
			}
		});
	});

	// app.post('/api/updateSession/:id', function(req, res){
	// 	var newLocation = req.body.location;
	// 	io.sockets.emit("updatedLocationArray", {location:newLocation});
	// });
};

var auth = express.basicAuth(function(user, pass, callback) {
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
        return callback(null, true);
    });
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
