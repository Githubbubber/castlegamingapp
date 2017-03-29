if (window.showAds) {
    console.log("Twitter feed can be loaded. Yay!");
} else {
    // You user uses adbocker, show a popup dialog, alert, etc here
    $("div.twitterhex div.middle").html("<p>Please pause your Adblocker to see Twitter newsfeed!</p>");
    $("div.tweetr").html("<p>Please pause your Adblocker to see Twitter newsfeed!</p>");
}