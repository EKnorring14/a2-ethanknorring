const http = require("http"),
      fs   = require("fs"),
      mime = require("mime"),
      dir  = "public/",
      port = 3000;

// Red Sox player data with derived field (OPS - On-base Plus Slugging)
let players = [
  { id: 1, name: "Rafael Devers", position: "3B", avg: 0.285, obp: 0.352, slg: 0.524, ops: 0.876 },
  { id: 2, name: "Xander Bogaerts", position: "SS", avg: 0.295, obp: 0.367, slg: 0.493, ops: 0.860 },
  { id: 3, name: "J.D. Martinez", position: "DH", avg: 0.286, obp: 0.349, slg: 0.518, ops: 0.867 }
];

const server = http.createServer(function(request, response) {
  if (request.method === "GET") {
    handleGet(request, response);
  } else if (request.method === "POST") {
    handlePost(request, response);
  } else if (request.method === "PUT") {
    handlePut(request, response);
  } else if (request.method === "DELETE") {
    handleDelete(request, response);
  }
});

const handleGet = function(request, response) {
  const filename = dir + request.url.slice(1);

  if (request.url === "/") {
    sendFile(response, "public/index.html");
  } else if (request.url === "/players") {
    response.writeHead(200, "OK", { "Content-Type": "application/json" });
    response.end(JSON.stringify(players));
  } else {
    sendFile(response, filename);
  }
};

const handlePost = function(request, response) {
  let dataString = "";

  request.on("data", function(data) {
    dataString += data;
  });

  request.on("end", function() {
    const newPlayer = JSON.parse(dataString);
    
    // Server logic: Calculate OPS (derived field)
    newPlayer.ops = (parseFloat(newPlayer.obp) + parseFloat(newPlayer.slg)).toFixed(3);
    newPlayer.id = players.length > 0 ? Math.max(...players.map(p => p.id)) + 1 : 1;
    
    players.push(newPlayer);
    
    response.writeHead(200, "OK", { "Content-Type": "application/json" });
    response.end(JSON.stringify(players));
  });
};

const handlePut = function(request, response) {
  let dataString = "";

  request.on("data", function(data) {
    dataString += data;
  });

  request.on("end", function() {
    const updatedPlayer = JSON.parse(dataString);
    
    // Server logic: Recalculate OPS (derived field)
    updatedPlayer.ops = (parseFloat(updatedPlayer.obp) + parseFloat(updatedPlayer.slg)).toFixed(3);
    
    const index = players.findIndex(p => p.id === updatedPlayer.id);
    if (index !== -1) {
      players[index] = updatedPlayer;
    }
    
    response.writeHead(200, "OK", { "Content-Type": "application/json" });
    response.end(JSON.stringify(players));
  });
};

const handleDelete = function(request, response) {
  const playerId = parseInt(request.url.split("/").pop());
  
  players = players.filter(player => player.id !== playerId);
  
  response.writeHead(200, "OK", { "Content-Type": "application/json" });
  response.end(JSON.stringify(players));
};

const sendFile = function(response, filename) {
  const type = mime.getType(filename);

  fs.readFile(filename, function(err, content) {
    if (err === null) {
      response.writeHeader(200, { "Content-Type": type });
      response.end(content);
    } else {
      response.writeHeader(404);
      response.end("404 Error: File Not Found");
    }
  });
};

server.listen(process.env.PORT || port);