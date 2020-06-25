/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

// prints "hi" in the browser's dev tools console
const canvas = document.getElementById("canvas");
var tilesize = { w: 50, h: 50 };
var boardsize = { col: 4, row: 4 };

function Tile(i, j, infotext = `${i}.${j}`) {
  this.i = i;
  this.j = j;
  this.infotext = infotext;
}
Tile.prototype.draw = function() {
  let margin = 10;
  let x = canvas.width / 2 + (this.i - boardsize.col / 2) * tilesize.w;
  let y = canvas.height / 2 + (this.j - boardsize.row / 2) * tilesize.h;
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = "lightgreen";
  ctx.strokeStyle = "black";
  ctx.strokeRect(
    x + margin / 2,
    y + margin / 2,
    tilesize.w - margin,
    tilesize.h - margin
  );
  ctx.font = "10px D2Coding";
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.fillText(this.infotext, x + margin / 2, y - margin / 2);
  ctx.font = "30px D2Coding";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("CD", x + tilesize.w / 2, y + tilesize.h / 2);
};

var tiles = [];
function range(n) {
  return [...Array(n).keys()];
}
range(boardsize.col).forEach(i => {
  range(boardsize.row).forEach(j => {
    tiles.push(new Tile(i, j));
  });
});

function Cursor(i, j, strokeStyle="lime") {
  this.i = i;
  this.j = j;
  this.strokeStyle = strokeStyle
}
Cursor.prototype.draw = function() {
  let margin = 10;
  let x = canvas.width / 2 + (this.i - boardsize.col / 2) * tilesize.w;
  let y = canvas.height / 2 + (this.j - boardsize.row / 2) * tilesize.h;
  let ctx = canvas.getContext("2d");
  ctx.strokeStyle = this.strokeStyle;
  ctx.strokeRect(
    x + margin / 2 + margin / 2 / 2,
    y + margin / 2 + margin / 2 / 2,
    tilesize.w - margin - margin / 2,
    tilesize.h - margin - margin / 2
  );
};

var cursor = new Cursor(1, 2);
function getNextTo(i,j){
  var result=[]
  function isOutOfBound(i,j){
    return i<0||j<0||i>=boardsize.col||j>=boardsize.row
  }
  if (isOutOfBound(i,j)){return result}
  if (!isOutOfBound(i+1,j)){result.push([i+1,j])}
  if (!isOutOfBound(i-1,j)){result.push([i-1,j])}
  if (!isOutOfBound(i,j+1)){result.push([i,j+1])}
  if (!isOutOfBound(i,j-1)){result.push([i,j-1])}
  return result
}

function draw() {
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgb(104, 153, 185)"; // Pythagorean triple
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  tiles.forEach(tile => {
    tile.draw();
  });

  cursor.draw();
}

function update() {
  draw();
}

var controller = {};
controller.stepRight = function() {
  cursor.i += 1;
};
controller.stepLeft = function() {
  cursor.i -= 1;
};
controller.stepUp = function() {
  cursor.j -= 1;
};
controller.stepDown = function() {
  cursor.j += 1;
};
controller.stepX = function() {};

window.setInterval(update, 50);

function keydownHandler(e) {
  switch (e.code) {
    case "ArrowRight":
      controller.stepRight();
      break;
    case "ArrowLeft":
      controller.stepLeft();
      break;
    case "ArrowUp":
      controller.stepUp();
      break;
    case "ArrowDown":
      controller.stepDown();
      break;
    case "KeyZ":
      break;
    default:
      break;
  }
}

window.addEventListener("keydown", keydownHandler);
