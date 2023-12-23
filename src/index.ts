import { InMemoryStore } from "./InMemoryStore";
import { UserManager } from "./UserManager";
import { IncomingMessage, SupportedMessage, UpvoteMessageType, UserMessageType } from "./message";

const WebSocketServer = require('websocket').server;
const http = require('http');
const userManager = new UserManager();
const store = new InMemoryStore()
const server = http.createServer(function(request: any, response: any) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

const wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin: any) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
  }
  
  function messageHandler(ws: WebSocket,message: IncomingMessage) {
    if (message.type === SupportedMessage.JoinRoom) {
        const payload = message.payload;
        userManager.addUser(payload.name, payload.userId, payload.roomId, ws)
    }
    if (message.type === SupportedMessage.SendMessage) {
        const payload = message.payload
        const user = userManager.getUser(payload.roomId, payload.userId)
        if (!user) {
            console.error("User not found in the db");
            return;
        }
        store.addChat(payload.userId, user.name, payload.roomId, payload.message)
    }
  }

  wsServer.on('request', function(request: any) {
      if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
      }
      
      const connection = request.accept('echo-protocol', request.origin);
      console.log((new Date()) + ' Connection accepted.');
      connection.on('message', function(message: any) {
          if (message.type === 'utf8') {
            try {
                messageHandler(connection, JSON.parse(message.utf8Data))
            }catch (e) {

            }
              console.log('Received Message: ' + message.utf8Data);
              connection.sendUTF(message.utf8Data);
          }
          else if (message.type === 'binary') {
              console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
              connection.sendBytes(message.binaryData);
          }
      });
      connection.on('close', function(reasonCode: any, description: any) {
          console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
      });
  });