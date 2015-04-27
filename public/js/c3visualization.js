



(function() {
  $.getJSON( '/igMediaCounts')//This is a method declared in app.js. It gets users followers
    .done(function( data ) {
        console.log("data: "+data);
      var yCounts = data.users.map(function(item){

        return item.counts.media;
      });
      
      yCounts.unshift('Media Count');

        /*
      var chart = c3.generate({
        bindto: '#chart',
        data: {
          columns: [
            yCounts 
          ]
        }
      });
        */
        var chart = c3.generate({
          data: {
            columns: [
              yCounts
                /*
              ['data1', 30, 20, 50, 40, 60, 50],
              ['data2', 200, 130, 90, 240, 130, 220],
              ['data3', 300, 200, 160, 400, 250, 250],
              ['data4', 200, 130, 90, 240, 130, 220],
              ['data5', 130, 120, 150, 140, 160, 150],
              ['data6', 90, 70, 20, 50, 60, 120],
              */
            ],
            type: 'bar',
            types: {
              data3: 'spline',
              data4: 'line',
              data6: 'area'
            },
            groups: [
              ['data1','data2']
            ]
          }
        });



    });
})();


