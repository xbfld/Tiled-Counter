const canvas = document.getElementById("canvas");
var tilesize = { w: 50, h: 50 };
var boardsize = { col: 4, row: 4 };

class GridBox {
  getTopleft(tileIndex) {
    let canvasCenter = [canvas.width / 2, canvas.height / 2];
    // let tileIndex = [this.i, this.j];
    let boardHalfway = [boardsize.col / 2, boardsize.row / 2];
    let tileSize = [tilesize.w, tilesize.h];

    let indexOffset = [0, 1].map(i => tileIndex[i] - boardHalfway[i]);
    let offset = [0, 1].map(i => indexOffset[i] * tileSize[i]);
    let pos = [0, 1].map(i => canvasCenter[i] + offset[i]);
    return pos
  }

  //shrink half-margin for all sides
  getBox(margin) {
    let [x, y] = this.getTopleft()
    return [
      x + margin / 2,
      y + margin / 2,
      tilesize.w - margin,
      tilesize.h - margin
    ]
  }
}

class Tile extends GridBox {
  constructor(i, j, infotext = `${i}.${j}`, tiletext = '@') {
    super();
    this.i = i;
    this.j = j;
    this.infotext = infotext;
    this.tiletext = tiletext;
  }
  getTopleft() {
    return super.getTopleft([this.i, this.j])
  }
  getCenter() {
    let tileSize = [tilesize.w, tilesize.h];
    let pos = this.getTopleft()
    return [0, 1].map(i => pos[i] + tileSize[i] / 2);
  }
  draw() {
    let margin = 10;
    let [x, y] = this.getTopleft()
    let box = this.getBox(margin)
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "lightgreen";
    ctx.strokeStyle = "black";
    ctx.strokeRect(...box);
    ctx.font = "10px D2Coding";
    ctx.textBaseline = "bottom";
    ctx.textAlign = "left";
    ctx.fillText(this.infotext, ...box.slice(0, 2));
    ctx.font = "30px D2Coding";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.tiletext, ...this.getCenter());
  }
}

var tiles = [];
function range(n) {
  return [...Array(n).keys()];
}
range(boardsize.col).forEach(i => {
  range(boardsize.row).forEach(j => {
    tiles.push(new Tile(i, j));
  });
});

class Cursor extends GridBox {
  constructor(i, j, strokeStyle = "lime") {
    super();
    this.i = i;
    this.j = j;
    this.strokeStyle = strokeStyle;
  }
  getTopleft() {
    return super.getTopleft([this.i, this.j])
  }
  draw() {
    let margin = 15;
    let [x, y] = this.getTopleft()
    let box = this.getBox(margin)
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = this.strokeStyle;
    ctx.strokeRect(...box);
  }
}

var cursor = new Cursor(1, 2);
function getNextTo(i, j) {
  var result = []
  function isOutOfBound(i, j) {
    return i < 0 || j < 0 || i >= boardsize.col || j >= boardsize.row
  }
  if (isOutOfBound(i, j)) { return result }
  if (!isOutOfBound(i + 1, j)) { result.push([i + 1, j]) }
  if (!isOutOfBound(i - 1, j)) { result.push([i - 1, j]) }
  if (!isOutOfBound(i, j + 1)) { result.push([i, j + 1]) }
  if (!isOutOfBound(i, j - 1)) { result.push([i, j - 1]) }
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

function renderRomanNumeral(n) {
  const units = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX']
  const tens = ['', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC']
  const hundreds = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM']
  const thousands = ['', 'M', 'MM', 'MMM']
  let digit = [...('' + n)]
  let result = ''

  result = units[digit.pop()] + result
  if (digit.length == 0) { return result }
  result = tens[digit.pop()] + result
  if (digit.length == 0) { return result }
  result = hundreds[digit.pop()] + result
  if (digit.length == 0) { return result }
  result = thousands[digit.pop()] + result

  return result
}

function* getNextCount() {
  let now = 1;
  let separator = '□'
  while (1) {
    yield renderRomanNumeral(now) + separator
    now += 1
  }
}
var counter = getNextCount()
var level = ['Start!',counter.next().value,counter.next().value]
var state = { mylevel: 1, step: 0 }
var stateLog = [state]

const progression = document.getElementById('progression');

var controller = {};
controller.stepRight = function () {
  cursor.i += 1;
};
controller.stepLeft = function () {
  cursor.i -= 1;
};
controller.stepUp = function () {
  cursor.j -= 1;
};
controller.stepDown = function () {
  cursor.j += 1;
};
controller.stepX = function () { };

function renderProgress() {
  let mylevel = state.mylevel
  let pastText = level[mylevel-1]
  let levelText = level[mylevel]
  let nextText = level[mylevel+1]
  progression.innerHTML =''
  +`<div class='past'>Last Level: ${pastText}<br></div>`
    +`<div class='passed'>Pass: ${levelText.slice(0, state.step)}<br></div>`
    + `<div class='now'>Left: ${levelText.slice(state.step)}<br></div>`
    + `<div class='next'>Next Level: ${nextText}</div>`
}

controller.nextStep = function () {
  state.step += 1

  // move on next level
  if (state.step == level[state.mylevel].length) {
    state.step = 0
    state.mylevel += 1
    level.push(counter.next().value)
  }

  // // prepare next level if mylevel exceeded
  // if (state.mylevel == level.length) {
  //   level.push(counter.next().value)
  // }
  renderProgress()
}
controller.rollBack = function () {

}

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
    case "Space":
      controller.nextStep();
      break;
    case "KeyZ":
      controller.rollBack();
      break;
    default:
      break;
  }
}

window.addEventListener("keydown", keydownHandler);

renderProgress();