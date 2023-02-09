const express = require("express");
const http = require("http");
const path = require("path");

const { log, clear } = console;

const app = express();
const server = http.Server(app);
const io = require("socket.io")(server);

const PORT = 3000;

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public/")));

server.listen(PORT, (err) => {
  if (err) {
    log(err);
    return;
  }
  clear();
  log(`Running on http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.render("index");
});

var p_colors = [];

io.on("connection", (socket) => {
  var idx = p_colors.length;
  p_colors.push(r_c());
  socket.emit("plys",p_colors );
  socket.broadcast.emit("nply", p_colors[idx]);
  socket.emit("pidx", idx);
 
  socket.on("disconnect", () => {
    p_colors.splice(idx, 1);
    log("out ",idx);

    io.emit("rmply", idx);
  })

  socket.on("py", (y) => {
    socket.broadcast.emit("o_py", {y,idx});
  })
  log(p_colors.length, "users");
}); 
 
function r(max, min = 0) {
  return parseInt(Math.random() * (max - min) + min);
}

function rgb(r, g, b) {
  return `rgb(${r},${g},${b})`;
}

function r_c() {
  return rgb(r(255, 100), r(255, 100), r(255));
}