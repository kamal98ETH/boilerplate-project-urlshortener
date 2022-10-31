require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

//myApp
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
const fs = require('fs');
const dns = require('dns');
let valid_url = /^(https|http):\/\/(www\.|)[\w-\.]+/;

//get url short form
app.post("/api/shorturl", (req, res) => {
  let input = req.body.url;
  //check if the url is valid
  if (!valid_url.test(input)) {
    res.json({
      error: 'invalid url'
    });
    return;
  }

  //verify the url with dns lookup
  let url = input.match(valid_url)[0]
  let dns_url = url.replace(/https:\/\/|http:\/\//, "")
  dns.lookup(dns_url, function (error, address, family) {
    if (error) {
      res.json({
        error: "Invalid Hostname"
      });
      return;
    }
  });

  //shorten the url
  let rawdata = fs.readFileSync('urls.json');
  let urls = JSON.parse(rawdata);
  let short_url;
  for (let key in urls) {
    if (input == urls[key]) {
      short_url = parseInt(key);
      break;
    }
  }

  //add new website to json file
  if (!short_url) {
    console.log("updating json file...");
    short_url = (Object.keys(urls).length + 1).toString();
    urls[short_url] = input;
    fs.writeFileSync('urls.json', JSON.stringify(urls));
    console.log('Updated!');
  }

  res.json({
    original_url: input,
    short_url: short_url
  })
})

//use short url to go to the website
app.get("/api/shorturl/:url_number", (req, res) => {
  let rawdata = fs.readFileSync('urls.json');
  let urls = JSON.parse(rawdata);
  let url = urls[req.params.url_number]
  res.redirect(url);
}) 
