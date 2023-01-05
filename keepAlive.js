const express = require('express');
const server = express();

server.all(`/`, (req, res) => {
  res.send(`Working good.`);
});

function keepAlive() {
  server.listen(3000, () => {
      console.log(`WebServer is now ready! | ` + Date.now());
  });
}

module.exports = keepAlive;