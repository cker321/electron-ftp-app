let express = require('express');
let app = express();
let api = require('./router/index');
let ws = require('./router/websocket');

// 跨域设置
app.all("*", function(req, res, next) {
    if (req.method === 'OPTIONS') {
        res.header("Access-Control-Allow-Credentials", true);
        res.header("Access-Control-Allow-Origin", "http://localhost:9080");
        res.header("Access-Control-Allow-Headers", "content-type, x-authorization");
        res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
        next();
    } else {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
        next();
    }
});

app.use('/', api);

const port = process.env.PORT || 3009;

ws.createServer(function(conn) {
      console.log('New connection')
      conn.on('close', function(code, reason) {
          console.log('Connection closed')
      })
  }).listen(1300)

app.listen(port, () => {
    console.log(`server running @ http://localhost:${port}`);
});
