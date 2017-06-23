import path from 'path';
import express from 'express';
import WS from 'express-ws';
import bp from 'body-parser';
import events from 'events';

const app = express();

// Add middleware.
const ws = WS(app);

// parse application/json
app.use(bp.json());

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client.html'));
});

// Setup the Event Emitter
const ee = new events.EventEmitter();

// Post Anything
app.post('/post-anything', (req, res) => {
  ee.emit('POST_ANYTHING', req.body);
  res.json({
    status: 'success',
    message: req.body.message,
    user: req.body.user
  });
});

// Build Status
app.post('/build-status', (req, res) => {
  ee.emit('BUILD_STATUS', req.body);
  res.json({
    status: 'success',
    body: req.body
  });
});

// E2E Status
app.post('/e2e-status', (req, res) => {
  ee.emit('E2E_STATUS', req.body);
  res.json({
    status: 'success',
    body: req.body
  });
});

// Way to kill all connections.
app.get('/kill-all', (req, res) => {
  const clients = ws.getWss().clients;
  const length = clients.size;

  clients.forEach((client) => {
    client.send('Disconnecting You!');
    client.terminate();
  });

  res.send(`Killed ${length}`);
});

// Set up the connection URL
app.ws('/', (s, req) => {
  s.send('{"message": "Connected!"}');
});

ws.getWss().on('connection', (s) => {
  const clients = ws.getWss().clients;
  console.log('New Connection!');
  console.log(`There are ${clients.size}`);
});

// Setup listener for post-anything
ee.on('POST_ANYTHING', (data) => {
  const clients = ws.getWss().clients;
  const action = {
    type: 'POST_ANYTHING',
    payload: data,
  };

  clients.forEach((client) => {
    client.send(JSON.stringify(action));
  });
});

// Handle BUILD_STATUS
ee.on('BUILD_STATUS', (data) => {
  const clients = ws.getWss().clients;
  const action = {
    type: 'BUILD_STATUS',
    payload: data,
  };

  clients.forEach((client) => {
    client.send(JSON.stringify(action));
  });
});

// Handle BUILD_STATUS
ee.on('E2E_STATUS', (data) => {
  const clients = ws.getWss().clients;
  const action = {
    type: 'E2E_STATUS',
    payload: data,
  };

  clients.forEach((client) => {
    client.send(JSON.stringify(action));
  });
});

app.listen(3001, () => console.log('listening on localhost:3001'));
