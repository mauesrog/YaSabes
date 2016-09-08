import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import socketio from 'socket.io';
import http from 'http';
import multer from 'multer';

import apiRouter from './router';


// initialize
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/yasabes';
mongoose.connect(mongoURI);
// set mongoose promises to es6 default
mongoose.Promise = global.Promise;

// enable/disable cross origin resource sharing if necessary
app.use(cors());

// enable json message body for posting data to API
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', apiRouter);
app.use(multer({ dest: './uploads/' }).single('image'));

io.on('connection', (socket) => {
  try {
    // creates notes and
    socket.on('sendMessage', fields => {
      try {
        const pushMessages = partiesInvolved => {
          try {
            console.log(partiesInvolved);
            io.sockets.emit('incomingMessage', partiesInvolved);
          } catch (err) {
            io.sockets.emit('error', err);
          }
        };

        console.log(fields);

        const renterId = fields.renter;
        const vendorId = fields.vendor;
        const conversationId = fields.id;

        pushMessages({ renterId, vendorId, conversationId });
      } catch (err) {
        socket.emit('error', err);
      }
    });
  } catch (err) {
    console.log(err);
  }
});

// START THE SERVER
// =============================================================================
const port = process.env.PORT || 9090;
server.listen(port);

console.log(`listening on: ${port}`);
