const cv = document.createElement("canvas");
const cx = cv.getContext("2d");
document.body.appendChild(cv);
const cb = cv.getBoundingClientRect();
const resolution = 1;
const cw = (cv.width = resolution * cb.width);
const ch = (cv.height = resolution * cb.height);

function r(max, min = 0) {
  return parseInt(Math.random() * (max - min) + min);
}

function rgb(r, g, b) {
  return `rgb(${r},${g},${b})`;
}

function r_c() {
  return rgb(r(255, 100), r(255, 100), r(255));
}

function p(color) {
  const posx =
    ((cw - 50) / players.length) * (1 + parseInt(players.length / 2));
  this.s = 40;
  this.s2 = this.s / 2;
  this.y = ch - this.s - 20;
  this.x = players.length % 2 == 0 ? posx : cw - posx;
  this.rk = players.length + 1;
  this.id = players.length;
  this.d = () => {
    this.up_x();
    this.y += this.v;
    if (this.y + this.v > ch - this.s - 20) this.y -= this.v;
    if (this.y + this.s < 0) this.y = ch - this.s - 20;
    cx.strokeStyle = color;
    cx.fillStyle = color;
    cx.font = "bold 20px arial";
    const m = cx.measureText(this.isEx ? this.rk + "ex" : this.g_rk());
    cx.lineCap = "round";
    cx.lineWidth = 3;
    cx.beginPath();
    cx.strokeRect(this.x, this.y, this.s, this.s);
    cx.fillText(
      this.g_rk(),
      this.x + this.s2 - m.width / 2,
      this.y + this.s2 + m.width / 4
    );
    cx.closePath();
  };

  this.up_x = () => {
    const posx =
      ((cw - (cw - 40 * players.length) / players.length) / players.length) *
      (1 + parseInt(this.id / 2));
    this.x = this.id % 2 == 0 ? posx : cw - posx;
  };

  this.up_rk = () => {
    this.rk = 1;
    for (var p of players) {
      if (p.y < this.y) {
        this.rk++;
      }
    }
    this.isEx = false;
    for (var p of players) {
      if (p.rk == this.rk && p.id != this.id) {
        this.isEx = true;
        break;
      }
    }
  };

  this.g_rk = () => {
    return this.isEx
      ? this.rk + "ex"
      : this.rk == 1
      ? "1st"
      : this.rk == 2
      ? "2nd"
      : this.rk == 3
      ? "3rd"
      : this.rk + "th";
  };

  this.v = 0;
  this.isEx = false;
  players.push(this);
  socket.emit("np", { color });
}

var players = [];
var p1;

socket.on("plys", (colors) => {
  for (var color of colors) {
    new p(color);
  }
});
socket.on("nply", (color) => {
  new p(color);
});
socket.on("rmply", (idx) => {
  players.splice(idx, 1);
});
socket.on("pidx", (idx) => {
  p1 = players[idx];
});

socket.on("o_py", (data) => {
  players[data.idx].y = data.y;
});

g_f();

function g_f(f) {
  cx.clearRect(0, 0, cw, ch);
  for (var p of players) {
    p.d();
    p.up_rk();
  }
  if (p1) socket.emit("py", p1.y);

  requestAnimationFrame(g_f);
}

window.addEventListener("keydown", (ev) => {
  if (ev.key == "ArrowUp") {
    p1.v = -3;
  } else if (ev.key == "ArrowDown") {
    p1.v = 3;
  } else if (ev.key == " ") {
    p1.v = 0;
  }
});

socket.on("py", function (data) {
  players[data.index].y = data.value;
});
