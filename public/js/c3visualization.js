


(function() {
  $.getJSON( '/igMediaCounts')//This is a method declared in app.js. It gets users followers
    .done(function( data ) {
        //console.log("data: "+data);
        //console.log("this is data: " + JSON.stringify(data, undefined, 2));

        var yCounts = data.users.map(function(item){
        return item.counts.media;
      });
      
      yCounts.unshift('Media Count');

      var chart = c3.generate({
        bindto: '#chart',
        data: {
          type: 'area',
          columns: [
            yCounts 
          ]
        }
      });

    });
})();


