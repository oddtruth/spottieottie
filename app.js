/**
 * This is an basic node script that serves up top track user data from spotify after log in.
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = process.env.CLIENT_ID; // Your client id
var client_secret = process.env.CLIENT_SECRET; // Your secret
var redirect_uri = 'https://spotifynine.cyclic.app/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-top-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {
  var code = req.query.code || null;
  // GET AUTH ATTRIBUTES TOGETHER FOR THE REQUEST
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
    },
    json: true
  };
  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token,
          refresh_token = body.refresh_token;

      res.cookie('access_token', access_token, {
          httpOnly: true,
      });

      res.redirect('/#' +
        querystring.stringify({
        logged_in: true,
      }));

    } else {
         res.redirect('/#' +
           querystring.stringify({
             error: 'invalid_token'
           }));
       }
  });
  
});

app.get('/getalbums', function(req, res){
  var access_token = req.cookies.access_token;
  var options = {
    url: 'https://api.spotify.com/v1/me/top/tracks?time_range=short_term',
    headers: { 'Authorization': 'Bearer ' + access_token},
    json: true
  };

  request.get(options, function(error, response, body) {
    res.send(response);
  });
  
});

app.listen(process.env.PORT);
