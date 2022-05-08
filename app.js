
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session =require('express-session');
const passport = require('passport');
const passportLocalMongooose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({
	extended : true
}));

//use express session
app.use(session({
	secret: "Our little secret",
	resave: false,
	saveUninitialized : false
}));

//use passport to manage the session
// use passport and initialize it and start its session
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true})

const userSchema = new mongoose.Schema({
	email:String,
	password: String
});

userSchema.plugin(passportLocalMongooose)

const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
	res.render("home");
});
app.route("/login")
	.get(function(req,res){
		res.render("login");
	})
	.post(function(req,res){
		
		const user = User({
			username:req.body.username,
			password: req.body.password
		});
		
		req.login(user,function(err){
			if (err)
				console.log(err);
			else{
				passport.authenticate("local")(req,res,function(){
						res.redirect("/secrets")
				});
			}
		});
		
	});
app.route("/register")
	.get(function(req,res){
		res.render("register");
	})
	.post(function(req,res){
		
		User.register({username:req.body.username},
			req.body.password, function(err, user){
				if (err)
				{
					console.log(err);
					res.redirect('/register');
				}
				else
				{
					passport.authenticate("local")(req,res,function(){
						res.redirect("/secrets")
					});
				}
			});
	});

app.get('/logout',function(req,res){
	req.logout();
	res.redirect("/");
});


app.get("/secrets",function(req,res){
	if (req.isAuthenticated())
		res.render("secrets");
	else
		res.redirect('/login');
});

app.listen(3000, function(){
	console.log("Server started on port 3000");
});