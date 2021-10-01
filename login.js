// 1.include the packages in our Node.js
var mysql = require("mysql");
var express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var path = require("path");

// 2.connect to our database
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "nodeloginX"
});

// 3.use Packages
var app = express();
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'ejs');

// 4.change the secret code for the sessions
// sessions package is what we'll use to determine 
// if the user is logged-in, 
// the bodyParser package will extract the form data 
// from our login.html
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());   

// 5.the client connects to the server
//  the login page will be displayed, 
// the server will send the login.html file.
app.get("/login", function(request, response) {
  response.sendFile(path.join(__dirname + "/login.html"));
});

//  6. handle the POST request,
// form data will be sent to the server, 
// and with that data our login script will check in our MySQL accounts table
app.post("/auth", function(request, response) {
  var username = request.body.username;
  var password = request.body.password;


  if (username && password) {
    connection.query(
      "SELECT * FROM accounts WHERE username = ? AND password = ?",
      [username, password],
      function(error, results, fields) {
          // console.log(username);
        if (results.length > 0) {
          request.session.loggedin = true;
          request.session.username = username;
          // response.redirect("/home");
          response.redirect("/webboard");
        } else {
          response.send("Incorrect Username and/or Password!");
        }
        response.end();
      }
    );
  } else {
    response.send("Please enter Username and Password!");
    response.end();
  }
});


// 7.The home page we can handle with another GET request:
app.get("/home", function(request, response) {
  if (request.session.loggedin) {
     response.send("Welcome back, " + request.session.username + "!");
    //response.redirect("/webboard");
  } else {
    response.send("Please login to view this page!");
  }
  response.end();
});

app.get("/signout", function(request, response) {
    request.session.destroy(function (err) {
          response.send("Signout ready!");
          response.end();
    });
});


// 7.The home page we can handle with another GET request:
app.get("/home", function(request, response) {
  if (request.session.loggedin) {
     response.send("Welcome back, " + request.session.username + "!");
    //response.redirect("/webboard");
  } else {
    response.send("Please login to view this page!");
  }
  response.end();
});

app.get("/signout", function(request, response) {
    request.session.destroy(function (err) {
          response.send("Signout ready!");
          response.end();
    });
});

app.get("/webboard", (req, res) => {
    if (req.session.loggedin)
      connection.query("SELECT * FROM accounts", (err, result) => {
        res.render("index.ejs", {
          posts: result
        });
      console.log(result);
      });
    else
      res.send("You must to login First!!!");
      console.log("You must to login First!!!");
      // res.end();
});

app.get("/add", (req, res) => {
  res.render("add.ejs");
});

app.post("/add", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const post = {
    username: username,
    password: password,
    email: email
  };
  if (req.session.loggedin)
    connection.query("INSERT INTO accounts SET ?", post, (err) => {
      console.log("Data Inserted");
      return res.redirect("/webboard");
    });
  else res.send("You must to login First!!!");
  console.log("You must to login First!!!");
  //   res.end();
});

//running port 9000
app.listen(9000);
console.log("running on port 9000...");
