var express = require('express'),
  app = express(),
  path = process.cwd(),
  request = require('request'),
  cors = require('cors');


//mongoose connection
var mongoose = require('mongoose');

mongoose.connect('mongodb://admin:admin@ds047305.mongolab.com:47305/searches');
var Schema = mongoose.Schema;
mongoose.model('latest',
  new Schema({
    term: String,
    when: String
  }),
  'latest');

var search = mongoose.model('latest');

//app routes

app.get('/', function(req, res) {


  res.sendfile(path + '/client/index.html');

});


app.get('/api/imagesearch/', function(req, res) {

  res.send([]);
});
app.use(cors);

app.get('/api/imagesearch/:query', function(req, res) {



  var query = req.params.query,
    key = 'AIzaSyCp6I6hWvx7SYs2-osPp-G08-kb0mmmpa0',
    cx = '011159386812824583092%3A5ov2ilzo37e&key=AIzaSyCp6I6hWvx7SYs2-osPp-G08-kb0mmmpa0',
    start = "1";

  if (Object.prototype.hasOwnProperty.call(req.query, 'offset') && !isNaN(req.query.offset)) {

    start = Math.abs(parseInt(req.query.offset));
  }


  var url = "https://www.googleapis.com/customsearch/v1?q=" + query + "&cx=" + cx + "&key=" + key + "&start=" + start;


  request(url, function(err, response, body) {

    if (!err && response.statusCode === 200) {

      var info = JSON.parse(body).items.filter(function(el) {
        if (!el.pagemap) {
          return false;
        }
        else {
          return el.pagemap.cse_image !== undefined && el.pagemap.cse_thumbnail !== undefined;
        }
      }).map(function(el) {

        var obj = {};
        obj.url = el.pagemap.cse_image[0].src;
        obj.snippet = el.snippet;
        obj.thumbnail = el.pagemap.cse_thumbnail[0].src;
        obj.context = el.link;

        return obj;

      });

      var date = new Date().toString();
      var entry = new search({
        term: query,
        when: date
      });
      entry.save(function(err, entry) {
        if (err) {
          console.log(err)
        }
        res.send(info);
      });

    }
  });


});

app.get('/api/latest/imagesearch', function(req, res) {

  search.find({}, function(err, data) {
    if (err) {
      console.log(err);
    }
    else {
      
      var Arr = data.map(function(el){
        
        var obj = {};
        obj.term = el.term;
        obj.when = el.when;
        return obj;
      });

      res.json(Arr);
    }

  })

});




app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0");
