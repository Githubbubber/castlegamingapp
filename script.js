"use strict";
//var passkeys = require("./passkeys.js"); // Comment out for Heroku
var passkeys = "";  // Comment out for local testing
var nytapikey = (passkeys.NYTAPIKEY)? passkeys.NYTAPIKEY : process.env.NYTAPIKEY;
var gbapikey = (passkeys.GBAPIKEY)? passkeys.GBAPIKEY : process.env.GBAPIKEY;
var twitchclientid = (passkeys.TWITCHCLIENTID)? passkeys.TWITCHCLIENTID : process.env.TWITCHCLIENTID;
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
                  <div class="three columns minheight"> <!-- adspace -->
                      <div class="sidePage">
                        <a href="images/iFix_tourny_flyer_2.jpg">
                            <img class="sidePageAds" src="images/iFix_tourny_flyer_2.jpg" alt="iFix tournament flyer for August 26th, 2017" />
                        </a>
                      </div>
                      <div class="sidePage">
                        <a href="www.ponderingnerds.com">
                          <img class="sidePageAds" src="images/pn_podcast_img.jpg" alt="Listen to the Pondering Nerdcast" />
                        </a>
                      </div>
                      <div class="sidePage">
                        <a href="images/logo_bg.jpg">
                          <img class="sidePageAds" src="images/logo_bg.jpg" alt="Castle Gaming" />
                        </a>
                      </div>
                  </div>

                  <div class="eight columns greybg minheight" id="blogContent">`,
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
                        <div class="three columns minheight"> <!-- adspace -->
                          <div class="sidePage">
                            <a href="www.ponderingnerds.com">
                              <img class="sidePageAds" src="images/pn_podcast_img.jpg" alt="Listen to the Pondering Nerdcast" />
                            </a>
                          </div>
                          <div class="sidePage">
                            <a href="images/iFix_tourny_flyer_1.jpg">
                                <img class="sidePageAds" src="images/iFix_tourny_flyer_1.jpg" alt="iFix tournament flyer for August 26th, 2017" />
                            </a>
                          </div>
                          <div class="sidePage">
                            <a href="images/iFix_tourny_flyer_2.jpg">
                                <img class="sidePageAds" src="images/iFix_tourny_flyer_2.jpg" alt="iFix tournament flyer for August 26th, 2017" />
                            </a>
                          </div>
                        </div>
                        <div class="twelve columns greybg minheight" id="uniqStyle">`,
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
                  headers: { 'User-Agent': 'Pulling GB games for Castle Gaming website' }
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
    var streamsTotal = 0, streamserr = 0;
    function twitchResults(pastvids) {
      // var game0 = (pastvids.videos[0]["game"])? pastvids.videos[0]["game"] : pastvids.videos[0]["title"];
      // var game1 = (pastvids.videos[1]["game"])? pastvids.videos[1]["game"] : pastvids.videos[1]["title"];
      // var game2 = (pastvids.videos[2]["game"])? pastvids.videos[2]["game"] : pastvids.videos[2]["title"];
      // var game3 = (pastvids.videos[3]["game"])? pastvids.videos[3]["game"] : pastvids.videos[3]["title"]; 
      res.render('stream.ejs', {
        title: 'Castle Gaming - Streams Page',
        body1: `<section class="container">
                      <div class="twelve columns greybg minheight">
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
                  <section class="container">`, 
        body2: `    <div class="three columns greybg minsmallheight">
                        <a href="images/iFix_tourny_flyer_1.jpg">
                        <img class="sidePageAds" src="images/iFix_tourny_flyer_1.jpg" alt="iFix tournament flyer" />
                        </a>
                      </div>
                      <div class="three columns greybg minsmallheight">
                        <a href="images/iFix_tourny_flyer_2.jpg">
                        <img class="sidePageAds" src="images/iFix_tourny_flyer_2.jpg" alt="iFix tournament flyer" />
                        </a>
                      </div>
                      <div class="three columns greybg minsmallheight">
                        <a href="images/iFix_logo.jpg">
                        <img class="sidePageAds" src="images/cg_flyer.jpg" alt="Castle Gaming Flyer" />
                        </a>
                      </div>
                      <div class="three columns greybg minsmallheight">
                        <a href="images/iFix_logo.jpg">
                        <img class="sidePageAds" src="images/iFix_logo.jpg" alt="iFix logo" />
                        </a>
                      </div>
                      <div class="four columns greybg minsmallheight omega tweetr">
                          <!-- <div>UPCOMING TOURNAMENTS</div>
                          <div>TOURNAMENTS ARCHIVES</div> -->
                          <p>Latest tweets:</p>
                          <a class="twitter-timeline" href="https://twitter.com/castlegaming" data-widget-id="664934511264813057" width="290" height="150" data-chrome="nofooter noheader">Tweets by @castlegaming</a>
                          <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>
                      </div>
                  </section>`,
          body3: ``    
        }); 
    }

    function twitchAJAXCall(twitchResults) {
      $.ajax({
         success: function() {
            
              $.getJSON(archivevidurl, {
                limit: 4, //broadcasts: "true",
                client_id: twitchclientid })  
              .done(function(pastvids){  }) 
              .fail(function(err){ console.log(err);  });
        }
      });
    }

    function twitchAJAXCall(twitchResults) {
        $.ajax({ 
            method: 'GET',   
            url: 'https://api.twitch.tv/kraken/channels/castlegaming',
            headers: { 'Client-ID': twitchclientid }
        }).done(function(data) {
          var archivevidurl = data["_links"]["videos"];
          console.log("We in dis bish? \n" + archivevidurl);
          twitchResults(0);
        })
        .fail(function(err) { 
          // fs.open('error_log/errorlog_streams_page.txt', 'a+', (openerr, fd) => {
          //   if (openerr) {
          //     if (openerr.code === "EEXIST") {
          //       console.error('errorlog_streams_page.txt already exists');
          //       return;
          //     } else {
          //       streamsTotal += streamserr;
          //       throw openerr;
          //     }
          //   }
           
          //   streamsTotal += streamserr;
          //   fs.appendFileSync("error_log/errorlog_streams_page.txt", `Streams error: ${streamserr}\n`);
          // });
          // throw streamserr; 
          console.log(err);  
          twitchResults(0);
        });
      }

    twitchAJAXCall(twitchResults);
  });// end of streams page


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

app.listen(process.env.PORT || 3000);
console.log("App started");