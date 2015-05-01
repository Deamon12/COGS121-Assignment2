



(function() {

  $.getJSON( '/youtubeSubInfo')//This is a method declared in app.js. Get Youtube Info
    .done(function( data ) {
          //console.log("data: "+data);
          console.log("this is data: " + JSON.stringify(data, undefined, 2));

          var videoCount = data.users.items.map(function (item) {
              return item.stats.statistics.videoCount;
          });
          //videoCount.unshift('Video Count');
          //console.log("Video Count " + JSON.stringify(videoCount, undefined, 2));


          var viewCount = data.users.items.map(function (item) {
              return item.stats.statistics.viewCount;
          });
          //viewCount.unshift('View Count');


          var commentCount = data.users.items.map(function (item) {
              return item.stats.statistics.commentCount;
          });
          //commentCount.unshift('Comment Count');

          var subscriberCount = data.users.items.map(function (item) {
              return item.stats.statistics.subscriberCount;
          });
          //subscriberCount.unshift('Subscriber Count');


          var accountNames = data.users.items.map(function (item) {
              return item.snippet.title;
          });
          console.log("accountNames " + JSON.stringify(accountNames, undefined, 2));

          var accountImages = data.users.items.map(function (item) {
              return item.snippet.thumbnails.default.url;
          });



          var chart = c3.generate({
              data: {
                  x : 'x',
                  json: {
                      x : accountNames,
                      Video_Count: videoCount
                  },
                  type: 'bar'
              },


              axis: {
                  x: {
                      type: 'category',
                      tick: {
                          rotate: 75,
                          multiline: false
                      },
                      height: 130
                  }
              }

          });

          setTimeout(function () {
              chart.load({
                  json: {
                      View_Count: viewCount
                  },
                  type: 'spline'
              });
          }, 3000);
          setTimeout(function () {
              chart.load({
                  json: {
                      Comment_Count: commentCount
                  }
              });
          }, 1000);
          setTimeout(function () {
              chart.load({
                  json: {
                      Subscriber_Count: subscriberCount
                  }
              });
          }, 2000);

      });




})();


