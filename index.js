var WebSocketClient = require('websocket').client;
var config = require("config")
require("./jsbot/array")

const Brain = require("./jsbot/bot");



var client = new WebSocketClient();
const brain = new Brain(config.get('NAME')) 


client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});
 
client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        let state = JSON.parse(message.utf8Data)

        if('map' in state) {
            brain.insertMapInfo(state)
            return;
        } 
        let awnser = brain.processNextMove(state)

        connection.send(JSON.stringify(awnser))

        
    });
    if (connection.connected) 
        connection.sendUTF(JSON.stringify({cmd:'join',name:brain.name}));
});



 
client.connect(`ws://${config.get('SERVER')}:${config.get('PORT')}/player`);
