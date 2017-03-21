//"use strict";

$(document).ready( function() { // Get all needed news api info; Display on the page
// New York Times API variables
    var nyturl = "https://api.nytimes.com/svc/topstories/v2/technology.json";
    nyturl += '?' + $.param({ 'api-key': "117ece22ba784f4393acb6de3dae5e9c" });
// Giant Bomb API variables
    var gburl = "http://www.giantbomb.com/api/games";  // url resources: promos, releases";
// // Internet Game Database API variable
//     var igdburl = "https://igdbcom-internet-game-database-v1.p.mashape.com/keywords/";
// // WTF Web App API variable
//     var wtfurl = "http://thedailywtf.com/api/articles/recent";
// // Reddit API variable
//     var redditurl = "https://www.reddit.com/dev/api";
//     var redditurl2 = "https://www.reddit.com/r/gamernews/hot?before=t4_2J23H84QYU5PTMR7&count=0&limit=5";
// General keywords for filtering of results
    var cgkeywords = ["fantasy", "sport", "game", "gaming", "console", "play"], chosen = [];

// The New York Times API, for news source #1
    $.ajax({    
        url: nyturl,
        method: 'GET'
    }).done(function(nytresult) {
        for (var x = 0; x < nytresult["num_results"]; x++) {
            var abstract = [];
            abstract.push(nytresult["results"][x]["abstract"].split(" "));
            abstract[0].forEach(function(word) {
                cgkeywords.forEach(function(cgword) {
                    if (word.toLowerCase() == cgword.toLowerCase()) {
                        chosen.push(x);
                    }
                });
            });
        }
    
        if (chosen.length > 0) {
            console.log(chosen);
            $("div#uniqStyle").append("<h3>Gaming News Making the Headlines at the New York Times</h3>");
            for (var addedHTML = 0; addedHTML < chosen.length; addedHTML++) {
                $("div#uniqStyle").append(
                    "<div class='entry entry"+ addedHTML + "'>" +
                        "<strong><a target='_blank' href='" + nytresult["results"][chosen[addedHTML]]["url"] + "'>" +
                                                    nytresult["results"][chosen[addedHTML]]["title"]      + 
                        "</a></strong>" + 
                        "<p>"                       + nytresult["results"][chosen[addedHTML]]["abstract"]   + "</p>" + 
                        "<a target='_blank' href='" + nytresult["results"][chosen[addedHTML]]["url"]        + "'>Read more...</a>" +
                    "</div>");
            }
        }
    })
    .fail(function(nyterr) { 
        throw nyterr; 
    });

// The Giant Bomb API, for news source #2
    function callbackFunctionName(json){ console.log(json); }

    $.ajax({
        url: gburl,
        method: 'GET',
        dataType: 'jsonp',
        jsonpCallback: "callbackFunctionName",
        data: { limit: 3, 
                format: "jsonp", 
                filter: "field:2016-01-09|2016-31-12", 
                json_callback: "callbackFunctionName", 
                api_key: "4dee63acf4a9e4c29605abac23ee9173de82265b",
                sort: "original_release_date:desc"
            }
    }).done(function(gbresult) {
        $("div#uniqStyle").append("<h3>Newest Games Listed on Giant Bomb</h3>");
        for (var addedHTML = 0; addedHTML <= 2; addedHTML++) {
            $("div#uniqStyle").append(
                "<div class='entry gbentry'>" +
                        "<strong><a target='_blank' href='" + gbresult["results"][addedHTML]["site_detail_url"] + "'>" + 
                                                                gbresult["results"][addedHTML]["name"]            + 
                        "</a></strong>" + 
                        "<p>"                               + gbresult["results"][addedHTML]["deck"]            + 
                        "</p>" + 
                        "<a target='_blank' href='"         + gbresult["results"][addedHTML]["site_detail_url"] + "'>Read more...</a>" +
                "</div>");
        }
    }).fail(function(gberr) { throw gberr; });  // End of The Giant Bomb API section, for news source #2

});
