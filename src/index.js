import path from 'path';
import express from 'express';
import ws from 'express-ws';

const app = express();

// Add express-ws middleware.
ws(app);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client.html'));
});

app.ws('/', (s, req) => {
  console.error('websocket connection');
  for (var t = 0; t < 3; t++)
    setTimeout(() => s.send('message from server', ()=>{}), 1000*t);
});

app.listen(3001, () => console.log('listening on localhost:3001'));