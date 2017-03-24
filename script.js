"use strict";
var passkeys = (require('./passkeys'))? require('./passkeys'):""; // Import your own passwords, keys, etc. in a separate file obviously 
var nytapikey = (passkeys['nytapikey'])? passkeys['nytapikey'] : process.env.nytapikey;
var gbapikey = (passkeys['gbapikey'])? passkeys['gbapikey'] : process.env.gbapikey;
var twitchclientid = (passkeys['twitchclientid'])? passkeys['twitchclientid'] : process.env.twitchclientid;
var fs = require("fs");
var http = require("http");
var path = require("path");
var request = require("request");
var express = require('express');
var app = express.createServer();
require("jsdom").env("", function(err, window) {
    if (err) {
        console.error(err);
        return; 
    }
    var $ = require("jquery")(window);


app.use(express.static(__dirname + '/public'));

// The Home Page
  app.get('/', function(req, res){
    res.render('index.ejs', {
      title: 'Castle Gaming - Home',
      body1: '',
      body2: '',
      body3: ''
    });
  });
  app.get('/index.html', function(req, res){
    res.render('index.ejs', {
      title: 'Castle Gaming - Home',
      body1: '',
      body2: '',
      body3: ''
    });
  });
  app.get('/index', function(req, res){
    res.render('index.ejs', {
      title: 'Castle Gaming - Home',
      body1: '',
      body2: '',
      body3: ''
    });
  });


// The Blog Page
  app.get('/blog', function(req, res){
    var totalBlogs = "", counter = 1, files = fs.readdirSync("./blog_posts");

    try {
      files.forEach(function(fileName) {
        var file = path.join(__dirname, "blog_posts", fileName);
        var stats = fs.statSync(file);
        if(stats.isFile() && fileName !== ".DS_Store") {
          totalBlogs += "<p class='entry'"+counter+">"+
                          "<strong>BLOG #"+counter+"</strong>"+
                          "<p>" + fs.readFileSync(file) + "</p>";
          counter++;
        }
      });
    } catch(err) {
      fs.open('error_log/errorlog_blog.txt', 'a+', (openerr, fd) => {
        if (openerr) {
          if (openerr.code === "EEXIST") {
            console.error('errorlog_blog.txt already exists');
            return;
          } else {
            throw openerr;
          }
        }
       
        fs.appendFileSync("error_log/errorlog_blog.txt", `Blog error: ${err}\n`);
      });
      console.log("Blog error: " + err);
    }

    res.render('blog.ejs', {
      title: 'Castle Gaming - Blog',
      body1: `<section class="container">
                  <div class="three columns greybg minheight alpha"> <!-- adspace -->
                      <p>SIDE PAGE ADS</p>
                      <p class="sidePageAds" >AD #1</p>
                      <p class="sidePageAds" >AD #2</p>
                      <p class="sidePageAds" >AD #3</p>
                  </div>

                  <div class="eight columns greybg minheight omega" id="blogContent">`,
      body2:  `     ${ totalBlogs }`,
      body3:  `   </div>
                <aside class="five columns">            
                    <div class="hex-row odd">
                        <div class="twitterhex">
                        <div class="top"></div><div class="middle">
                                 <iframe src="https://calendar.google.com/calendar/embed?title=CG%20Calendar&amp;showPrint=0&amp;showCalendars=0&amp;showTz=0&amp;height=270&amp;wkst=1&amp;bgcolor=%23d1d2d4&amp;src=castlegaming006%40gmail.com&amp;color=%2329527A&amp;ctz=America%2FNew_York" width="300" height="270" frameborder="0" scrolling="no"></iframe>    
                            </div><div class="bottom"></div>
                      </div>
                    </div>
                    <div class="hex-row even">
                      <div class="hex">
                          <a href="contact">
                              <div class="top"></div>
                              <div class="middle">CONTACT CASTLE GAMING</div>
                              <div class="bottom"></div>
                          </a>
                      </div>
                      <div class="hex">
                          <a href="https://www.twitch.tv/castlegaming">
                              <div class="top rt"></div>
                              <div class="middle rt">CASTLE GAMING on TWITCH</div>
                              <div class="bottom rt"></div>
                          </a>
                      </div>
                  </div>
                  
                  <span class="clear"></span>
                  <p>FOLLOW CASTLE GAMING</p>
                  <a id="fb" target="_blank" href="http://on.fb.me/1HImN6Y"></a> 
                  <a id="tw" target="_blank" href="http://bit.ly/1Y4NzQu"></a><br />
                  <a id="yt" target="_blank" href="http://bit.ly/1O4edEv"></a>   
                </aside>
              </section>`
    });
  });


// The News Page
  // Full date and time, broken down below. This is used for the Giant Bomb's URL filter requirement
  var today = new Date(); 
  var y     = today.getFullYear();
  var mon   = ((today.getMonth() + 1) < 10)? '0' + (today.getMonth() + 1) : (today.getMonth() + 1);
  var d     = (today.getDate() < 10)? '0' + today.getDate() : today.getDate();
  app.get('/news', function(req, res){
    // New York Times API variables
        var nyturl = "https://api.nytimes.com/svc/topstories/v2/technology.json";
        nyturl += '?' + $.param({ 'api-key': nytapikey });
    // Giant Bomb API variables
        var baseURL = 'http:///api.giantbomb.com/api/games';
        var id = '';
        var fields = 'name,deck,description,site_detail_url';
        var offset = 0;
        var limit = 3;
        var resources = '';
        var query = '';
        var filter = `original_release_date:${y-1}-${mon}-${d} 00:00:00|${y}-${mon}-${d} 00:00:00`;
        var sort = 'original_release_date:desc';
        var gburl = `${baseURL}` +
                  `/${id ? id : ''}` +
                  `/?api_key=${gbapikey}` + 
                  `${query ? '&query=' + query : ''}` +
                  `${resources ? '&resources=' + resources.join(',') : ''}` +
                  `${fields ? '&field_list=' + fields : ''}` +
                  `&offset=${offset}&limit=${limit}&format=json` + 
                  `${filter ? `&filter=${filter}` : ''}` + 
                  `${sort ? `&sort=${sort}` : ''}`;
        gburl = gburl.replace(/\/\//g, '/');
        console.log(filter);
    // General keywords for filtering of results
        var cgkeywords = ["fantasy", "gamers", "gamer", "sport", "game", "gaming", "console", "consoles", "play"], 
            nytTotal = "", gbTotal = "", chosen = [], nytAPI = "";

      function newsOutput(nyt, body) { 
          for (var x = 0; x < nyt["num_results"]; x++) {
            var abstract = [];
            abstract.push(nyt["results"][x]["abstract"].split(" "));
            abstract[0].forEach(function(word) {
                cgkeywords.forEach(function(cgword) {
                    if (word.toLowerCase() == cgword.toLowerCase()) {
                        chosen.push(x);
                    }
                });
            });
          }

          if (chosen.length > 0) {
            nytTotal += "<h3>Gaming News Making the Headlines at the New York Times</h3>";
            for (var addedHTML = 0; addedHTML < chosen.length; addedHTML++) {
                nytTotal += "<div class='entry entry"+ addedHTML + "'>" +
                        "<strong><a target='_blank' href='" + nyt["results"][chosen[addedHTML]]["url"] + "'>" +
                                                    nyt["results"][chosen[addedHTML]]["title"] + "</a></strong>" + 
                        "<p>"                       + nyt["results"][chosen[addedHTML]]["abstract"]   + "</p>" + 
                        "<a target='_blank' href='" + nyt["results"][chosen[addedHTML]]["url"]        + "'>Read more...</a>" +
                    "</div>";
            }
          }

          gbTotal += "<h3>Newest Games Listed on Giant Bomb</h3>";
          for (var addedHTML = 0; addedHTML <= 2; addedHTML++) {
            var desc = (body["results"][addedHTML].deck)? body["results"][addedHTML].deck : body["results"][addedHTML].description;
            if (!desc) desc = "";

            gbTotal += "<div class='entry gbentry'>" +
                    "<strong>" + "<a target='_blank' href='" + body["results"][addedHTML].site_detail_url + "'>" + body["results"][addedHTML].name + "</a>" + "</strong>" + 
                    "<p>" + desc + "</p>" + 
                    "<a target='_blank' href='" + body["results"][addedHTML].site_detail_url + "'>Read more...</a>" +
                  "</div>";
          }

          res.render('news.ejs', {
            title: 'Castle Gaming - News',
            body1: `<section class="container">
                        <div class="three columns greybg minheight alpha"> <!-- adspace -->
                            <p>SIDE PAGE ADS</p>
                            <p class="sidePageAds" >AD #1</p>
                            <p class="sidePageAds" >AD #2</p>
                            <p class="sidePageAds" >AD #3</p>
                        </div>
                        <div class="thirteen columns greybg minheight omega" id="uniqStyle">`,
            body2:          `${nytTotal} ${gbTotal}`,
            body3:     `</div>
                    </section>`
          });

      };

    // The New York Times API, for news source #1
      function firstAPICall(giantBombAPICall, newsOutput) {
        $.ajax({    
            url: nyturl,
            method: 'GET',
        }).done(function(nytresult) {
          giantBombAPICall(nytresult, newsOutput);
        })
        .fail(function(nyterr) { 
            fs.open('error_log/errorlog_news_NYTimes.txt', 'a+', (openerr, fd) => {
              if (openerr) {
                if (openerr.code === "EEXIST") {
                  console.error('errorlog_news_NYTimes.txt already exists');
                  return;
                } else {
                  nytTotal += nyterr;
                  throw openerr;
                }
              }
             
              nytTotal += nyterr;
              fs.appendFileSync("error_log/errorlog_news_NYTimes.txt", `NY Times error: ${nyterr}\n`);
            });
            throw nyterr; 
        });
      }
    
    // The Giant Bomb API, for news source #2
        function callbackFunctionName(json){ console.log(json); }

        function giantBombAPICall(nytresult, newsOutput) {
          request({
                  url: gburl, 
                  headers: {
                    'User-Agent': 'Pulling GB games for Castle Gaming website'
                  }
                }, 
                function(error, response, body){
                  if(!error && response.statusCode == 200){
                      newsOutput(nytresult, JSON.parse(body));
                  } else console.log(error);
        });
      }

      nytAPI = firstAPICall(giantBombAPICall, newsOutput);
  });


// The Streams Page
  app.get('/stream', function(req, res){    

    function twitchResults(pastvids) {
      var game0 = (pastvids.videos[0]["game"])? pastvids.videos[0]["game"] : pastvids.videos[0]["title"];
      var game1 = (pastvids.videos[1]["game"])? pastvids.videos[1]["game"] : pastvids.videos[1]["title"];
      var game2 = (pastvids.videos[2]["game"])? pastvids.videos[2]["game"] : pastvids.videos[2]["title"];
      var game3 = (pastvids.videos[3]["game"])? pastvids.videos[3]["game"] : pastvids.videos[3]["title"];

      res.render('stream.ejs', {
        title: 'Castle Gaming - Streams Page',
        body1: `<section class="container">
                    <div class="twelve columns greybg minheight alpha">
                        <img id="liveornah" src="images/1.png" alt="Castle Gaming Live Stream Status" title="Castle Gaming Live Stream Status" />
                        <span class="authenticate hidden login">
                            <img src="http://ttv-api.s3.amazonaws.com/assets/connect_dark.png" class="twitch-connect" />
                        </span>
                        <span class="authenticated hidden logout">
                            <img id="logout" src="images/logout.jpg" alt="" />
                        </span>
                        <iframe
                            src="http://player.twitch.tv/?channel=castlegaming"
                            height="600"
                            width="95%"
                            frameborder="0"
                            scrolling="no"
                            allowfullscreen="true">
                        </iframe>
                    </div>
                    <div class="four columns greybg minheight omega">
                       <p>CHAT EMBED</p>
                       <iframe frameborder="0"
                                scrolling="no"
                                id="chat_embed"
                                src="http://www.twitch.tv/castlegaming/chat"
                                height="600"
                                width="95%">
                        </iframe>
                    </div>
                </section>
                <section class="container">`, // TAKE OUT DATA-WIDGET-ID IN TWITTER WIDGET BELOW?????
        body2: `    <div class="three columns greybg minsmallheight alpha pastvid pastvid0">
                        <div>${game0}: ${pastvids.videos[0]["title"]}</div>
                        <img src="${pastvids.videos[0].thumbnails[0].url}" alt="${pastvids.videos[0]["game"]}: ${pastvids.videos[0]["title"]}" title="${pastvids.videos[0]["game"]}: ${pastvids.videos[0]["title"]}" onclick="pastvid('pastvid0')" id="pastvidone" />
                        <p>Watch on <a class="twitch" href="${pastvids.videos[0].url}" target="_blank">Twitch</a></p>
                    </div>
                    <div class="three columns greybg minsmallheight pastvid pastvid1">
                        <div>${game1}: ${pastvids.videos[1]["title"]}</div>
                        <img src="${pastvids.videos[1].thumbnails[0].url}" alt="${pastvids.videos[1]["game"]}: ${pastvids.videos[1]["title"]}" title="${pastvids.videos[1]["game"]}: ${pastvids.videos[1]["title"]}" onclick="pastvid('pastvid1')" />
                        <p>Watch on <a class="twitch" href="${pastvids.videos[1].url}" target="_blank">Twitch</a></p>
                    </div>
                    <div class="three columns greybg minsmallheight pastvid pastvid2">
                        <div>${game2}: ${pastvids.videos[2]["title"]}</div>
                        <img src="${pastvids.videos[2].thumbnails[0].url}" alt="${pastvids.videos[2]["game"]}: ${pastvids.videos[2]["title"]}" title="${pastvids.videos[2]["game"]}: ${pastvids.videos[2]["title"]}" onclick="pastvid('pastvid2')" />
                        <p>Watch on <a class="twitch" href="${pastvids.videos[2].url}" target="_blank">Twitch</a></p>
                    </div>
                    <div class="three columns greybg minsmallheight pastvid pastvid3">
                        <div>${game3}: ${pastvids.videos[3]["title"]}</div>
                        <img src="${pastvids.videos[3].thumbnails[0].url}" alt="${pastvids.videos[3]["game"]}: ${pastvids.videos[3]["title"]}" title="${pastvids.videos[3]["game"]}: ${pastvids.videos[3]["title"]}" onclick="pastvid('pastvid3')" />
                        <p>Watch on <a class="twitch" href="${pastvids.videos[3].url}" target="_blank">Twitch</a></p>
                    </div>
                    <div class="four columns greybg minsmallheight omega">
                        <!-- <div>UPCOMING TOURNAMENTS</div>
                        <div>TOURNAMENTS ARCHIVES</div> -->
                        <p>Latest tweets:</p>
                        <a class="twitter-timeline" href="https://twitter.com/castlegaming" data-widget-id="664934511264813057" width="290" height="150" data-chrome="nofooter noheader">Tweets by @castlegaming</a>
                        <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>
                    </div>
                </section>`, // TAKE OUT DATA-WIDGET-ID IN TWITTER WIDGET ABOVE?????
        body3: ``    
      });
    }

    function twitchAJAXCall(twitchResults) {
      $.ajax({
          type: 'GET',
          url: 'https://api.twitch.tv/kraken/channels/castlegaming/videos?limit=4&broadcasts=true',
          headers: { 'Client-ID': twitchclientid }
      })
          .done(function(pastvids){
            twitchResults(pastvids);
      })
          .fail(function(err){
            console.log(err);
      });
    }

    twitchAJAXCall(twitchResults);
  });


// The Contact CG Page
  app.get('/contact', function(req, res){
    res.render('contact.ejs', {
      title: 'Castle Gaming - Contact CG',
      body1: '',
      body2: '',
      body3: ''
    });
  });


// The Tournaments Page
  app.get('/tournaments', function(req, res){
    res.render('tournaments.ejs', {
      title: 'Castle Gaming - Tournaments',
      body1: '',
      body2: '',
      body3: ''
    });
  });


// Everything else 
  app.get('/*', function(req, res) {
    res.status(404).render('error.ejs', {
      title: 'Error',
      body1: '',
      body2: '',
      body3: ''
    });
  });


});
app.listen(3000);
console.log("App started");