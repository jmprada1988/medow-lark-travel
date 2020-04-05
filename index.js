const express = require("express");
const handlebars = require("express3-handlebars").create({
  defaultLayout: "main",
  helpers: {
    section: function (name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    },
  },
});
const formidable = require("formidable");
const jqupload = require("jquery-file-upload-middleware");
const { getFortune, getWeatherData } = require("./lib/fortune.js");
const { cookieSecret } = require("./credentials");
const session = require('express-session');
const app = express();
app.use(require("body-parser")());
app.use(require("cookie-parser")(cookieSecret));
app.use(session({
  secret: 'my secret',
  cookie: {}
}));
app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

app.set("port", process.env.PORT || 4000);

app.use(express.static(__dirname + "/public"));

app.use(function (req, res, next) {
  res.locals.showTests =
    app.get("env") !== "production" && req.query.test === "1";
  next();
});

app.use(function (req, res, next) {
  if (!res.locals.partials) res.locals.partials = {};
  res.locals.partials.weather = getWeatherData();
  next();
});

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/about", function (req, res) {
  res.render("about", {
    fortune: getFortune(),
    pageTestScript: "/qa/tests-about.js",
  });
});

app.get("/tours/hood-river", function (req, res) {
  res.render("tours/hood-river");
});
app.get("/tours/oregon-coast", function (req, res) {
  res.render("tours/oregon-coast");
});
app.get("/tours/request-group-rate", function (req, res) {
  res.render("tours/request-group-rate");
});
app.get("/newsletter", function (req, res) {
  res.render("newsletter", { csrf: "CSRF token here..." });
});
app.post("/newsletter", function (req, res) {
  let name = req.body.name || "",
    email = req.body.email || "";
  //input validation
  if (!email.match(VALID_EMAIL_REGEXP)) {
    if (req.xhr) return res.json({ error: "Invalid name email addres." });
    req.session.flash = {
      type: "danger",
      intro: "Validation error!",
      message: "The email address you entered was not valid",
    };
    return res.redirect(303, "/newsletter/archive");
  }
  new NewsletterSignup({ name: name, email: email }).save(function (err) {
    if (err) {
      if (req.xhr) return res.json({ error: "Database error." });
      req.session.flash = {
        type: "danger",
        intro: "Database error!",
        message: "There was a database error; please try again later.",
      };
      return res.redirect(303, "/newsletter/archive");
    }
    if (req.xhr) return res.json({ success: true });
    req.session.flash = {
      type: "success",
      intro: "Thank you!",
      message: "You have now been signed up for the newsletter.",
    };
    return res.redirect(303, "/newsletter/archive");
  });
});
app.post("/process", function (req, res) {
  if (req.xhr || req.accepts("json,html") === "json") {
    res.send({ success: true });
  } else {
    res.redirect(303, "/thank-you");
  }
});

app.post("/contest/vacation-photo/:year/:month", function (req, res) {
  let form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    if (err) return res.redirect(303, "/error");
    console.log("received fields:");
    console.log(fields);
    console.log("received files:");
    console.log(files);
    res.redirect(303, "/thank-you");
  });
});
app.get("/contest/vacation-photo", function (req, res) {
  let now = new Date();
  res.render("contest/vacation-photo", {
    year: now.getFullYear(),
    month: now.getMonth(),
  });
});
app.get("/thank-you", function (req, res) {
  res.render("thank-you");
});

app.use("/upload", function (req, res, next) {
  let now = Date.now();
  jqupload.fileHandler({
    uploadDir: function () {
      return __dirname + "/public/uploads/" + now;
    },
    uploadUrl: function () {
      return "/uploads/" + now;
    },
  })(req, res, next);
});

//Custom 404 page
app.use(function (req, res) {
  res.status(404);
  res.render("404");
});

// Custom 500 page
app.use(function (err, req, res, next) {
  console.log(err.stack);
  res.status(500);
  res.render("500");
});

app.listen(app.get("port"), function () {
  console.log('mode ' + app.get('env'))
  console.log(
    "Express started on http://localhost:" +
      app.get("port") +
      "; press Ctrl-C to terminate"
  );
});
