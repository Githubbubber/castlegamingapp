//"use strict";

$(document).ready( function() { // Get all needed news api info; Display on the page
    Twitch.init({clientId: '9d4vywl3lztz8ynwa2pzn6wfpzqgabd'}, function(error, status) {// the sdk is now loaded
        if (status.authenticated) { // we're logged in :)
            $('.logout').removeClass('hidden');
          } else {
            $('.login').removeClass('hidden');
          }
        });

    $('.twitch-connect').click(function() { 
        Twitch.login({  
            scope: ['user_read', 'channel_read']    
        }); 
    });

    // Reload page/reset url hash. Shouldn't need to...
    $('img#logout').click(function() { 
        Twitch.logout(); 
        window.location = window.location.pathname;
    });

    $.ajax({
        type: 'GET',
        url: 'https://api.twitch.tv/kraken/channels/castlegaming',
        headers: {
           'Client-ID': '9d4vywl3lztz8ynwa2pzn6wfpzqgabd'
        },
        success: function(data) {
          var archivevidurl = data["_links"]["videos"];
           $.getJSON(archivevidurl, {
             limit: 4,
             broadcasts: "true",
             client_id: "9d4vywl3lztz8ynwa2pzn6wfpzqgabd"
           })
           .done(function(pastvids){
              var x       = 0, 
                  ptitle  = "", 
                  pimg    = "", 
                  plink   = "",
                  theVid  = "";

              for (x; x < 4; x++) {
                  ptitle  = "div.pastvid" + (x) +" div";
                  pimg    = "div.pastvid" + (x) +" img";
                  plink   = "div.pastvid" + (x) +" p a.twitch";
                  theVid   = pastvids.videos[x]["game"]+': "'+pastvids.videos[x]["title"]+'"';

                  $(ptitle).text(theVid);

                  $(pimg).attr({
                      src: pastvids.videos[x].thumbnails[0].url,
                      title: theVid,
                      alt: theVid
                  });
                  $(pimg).fadeIn(1000);
                  $(pimg).css({  width: "90%",   paddingTop: "8%", cursor:"pointer" });

                  $(plink).attr("href",pastvids.videos[x].url);
              }
          });

        }
    });

}); // Get all needed news api info; Display on the page
