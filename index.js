const express = require('express');
const handlebars = require('express3-handlebars')
  .create({defaultLayout: 'main'});

const fortunes = [
  "Conquer your fears or they will conquer you.",
  "Rivers need springs.",
  "Do not fear what you don't know.",
  "You will have a pleasant surprise.",
  "Whenever possible, keep it simple.",
];
const app = express();
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 4000);

app.use(express.static(__dirname + '/public'))
app.get('/', function(req, res){
  res.render('home');
});

app.get('/about', function(req, res) {
  const randomFortune = 
    fortunes[Math.floor(Math.random() * fortunes.length)];
  res.render('about', {fortune: randomFortune});
})
//Custom 404 page
app.use(function(req, res){
  res.status(404);
  res.render('404');
});

// Custom 500 page
app.use(function(err, req, res, next){
  console.log(err.stack);
  res.status(500);
  res.render('500')
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + 
    app.get('port') + '; press Ctrl-C to terminate');
})