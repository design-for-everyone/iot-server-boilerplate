// declaration and setup of the webserver
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
require('dotenv').config();
const port = process.env.PORT || 3000;

const app = express();
app.use(morgan('tiny'));
app.use(cors());
app.use(bodyParser.json());

// starting the server
const server = app.listen(port, () => {
    console.log(`Server is started on ${port}`);
});

// setting up socket.io
const socketio = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
socketio.on('connection', socket => {
    console.log(`A new client is connected with id: ${socket.id}`);
});

// connecting to MQTT and subscribing to a topic
const mqtt = require('mqtt')
const mqttClient = mqtt.connect(process.env.MQTT_HOST);
console.log(`Connecting to ${process.env.MQTT_HOST}`);
mqttClient.on('connect', () => {
    console.log('Server is connected to MQTT');
    // subscribing to the fake sensor
    mqttClient.subscribe('sensor/fake', (error, granted) => {
        if (error) {
            console.log('An error occured');
            console.log(error);
        } else {
            console.log(`Successfull subscription to ${granted[0].topic}`);
        }
    });
});

// listening for messages on the subscribed topic(s)
mqttClient.on('message', (topic, message) => {
    console.log(`Received message about ${topic} with value ${message.toString()}`);
    socketio.emit('message', message);

});

// routes for testing purposes

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to my MQTT to Socket.IO server'
    });
});

app.get('/status', (req, res) => {
    res.json({
        message: 'Server is up and running',
        broker: process.env.MQTT_HOST
    });
});