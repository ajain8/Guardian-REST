function init() {
  
  var serverBaseUrl = document.domain;

  /* 
   On client init, try to connect to the socket.IO server.
   Note we don't specify a port since we set up our server
   to run on port 8080
  */
  var socket = io.connect(serverBaseUrl);

  //We'll save our session ID in a variable for later
  var sessionId = '';
  // var active;
  /*
 When the client successfuly connects to the server, an
 event "connect" is emitted. Let's get the session ID and
 log it.
  */
  socket.on('connect', function () {
    sessionId = socket.socket.sessionid;
    //active = true;
    console.log('Connected ' + sessionId);    
    //console.log(document)
  });

  socket.on('updatedLocationArray', function (data) {
      var url = window.location.href;
      var pathArray;
      if(url.indexOf('?id')!=-1){
          pathArray = url.split('=');
      }
      else{
          pathArray = url.split('/');
      }
      console.log(pathArray);

      var pathCreated = window.location.origin+"/getLocationsArrayForSession/"+pathArray[pathArray.length-1];
      //console.log(pathCreated);
      // console.log(window.location.origin+"/getLocationsArrayForSession/"+pathArray[pathArray.length-1]);
      // if(state === true){
        $.get(pathCreated,function(data,status){
        //alert("Data: " + data + "\nStatus: " + status);
        //console.log(data[0].latitude);
        loadMap(data);
        setupLinks(data);
        
      // }
      });
  });
  socket.on('alertPanic', function (data) {
    // console.log(location.search);
    // var query = getQueryParams(document.location.search);
    // var sess_id = query.id;
      window.alert("PANIC! Call your friend immediately!");

    // if(data.sessionID === sess_id){

    //   console.log("PANIC FOR ME!");
    // }
    // else{
    //   console.log("NOT FOR ME!");
    //   console.log("FAIL SESSION ID: "+sess_id);
    // }
    // console.log(data);
  });

  function getQueryParams(qs) {
    qs = qs.split("+").join(" ");

    var params = {}, tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])]
            = decodeURIComponent(tokens[2]);
    }

    return params;
}

  //   socket.on('sessionDeleted', function (data) {

  //     // var url = window.location.href;
  //     // var pathArray;
  //     // if(url.indexOf('?id')!=-1){
  //     //     pathArray = url.split('=');
  //     // }
  //     // else{
  //     //     pathArray = url.split('/');
  //     // }
  //     // console.log(pathArray);

  //     // var pathCreated = window.location.origin+"/getLocationsArrayForSession/"+pathArray[pathArray.length-1];
  //     // //console.log(pathCreated);
  //     // // console.log(window.location.origin+"/getLocationsArrayForSession/"+pathArray[pathArray.length-1]);
  //     //  $.get(pathCreated,function(data,status){
  //     //    //alert("Data: " + data + "\nStatus: " + status);
  //     //    //console.log(data[0].latitude);
  //     //    loadMap(data);
  //     //    setupLinks(data);
  //     // });
  //     if(data.session_id === sessionId){
  //             active = false;
  //     }
  // });


}

$(document).on('ready', init);