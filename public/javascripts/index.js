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
  /*
 When the client successfuly connects to the server, an
 event "connect" is emitted. Let's get the session ID and
 log it.
  */
  socket.on('connect', function () {
    sessionId = socket.socket.sessionid;
    console.log('Connected ' + sessionId);    
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
       $.get(pathCreated,function(data,status){
         //alert("Data: " + data + "\nStatus: " + status);
         //console.log(data[0].latitude);
         loadMap(data);
      });
  });

}

$(document).on('ready', init);