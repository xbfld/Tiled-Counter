const canvas = document.getElementById("canvas");
var tilesize = { w: 50, h: 50 };
var boardsize = { col: 6, row: 6 };


// (...a->b)->(...Array(a)->Array(b))
//> liftArray(a=>a+3)([0,1,2,10])
//< [3, 4, 5, 13]
//> liftArray((a,b)=>(a+b))([0,1,2],[10,20])
//< [10, 21, NaN]
//> liftArray((a,b)=>(a+b))([0,1,2],[10,20,30,40],[9,9])
//< [10, 21, 32]
//> liftArray((a,b,c)=>(a+b+c))([0,1,2],[10,20,30,40])
//< [NaN, NaN, NaN]
//> liftArray(Math.max)([1,9,1,1],[99,1,1],[99,1,99,100,100])
//< [99, 9, 99, NaN]
function liftArray(f) {
  function newfunc(...args) {
    let l = [...Array(args[0].length).keys()]
    return l.map(i => f(...args.map(arg => arg[i])))
  }
  return newfunc
}

class GridBox {
  static getTopleft(tileIndex) {
    let canvasCenter = [canvas.width / 2, canvas.height / 2];
    let boardHalfway = [boardsize.col / 2, boardsize.row / 2];
    let tileSize = [tilesize.w, tilesize.h];

    // let indexOffset = liftArray((a, b) => a - b)(tileIndex, boardHalfway);
    let indexOffset = [0, 1].map(i => tileIndex[i] - boardHalfway[i]);
    let offset = [0, 1].map(i => indexOffset[i] * tileSize[i]);
    let pos = [0, 1].map(i => canvasCenter[i] + offset[i]);
    return pos
  }

  //shrink half-margin for all sides
  static getBox(margin, topleft) {
    let [x, y] = topleft
    return [
      x + margin / 2,
      y + margin / 2,
      tilesize.w - margin,
      tilesize.h - margin
    ]
  }
}

class Tile extends GridBox {
  static getBox(margin, pos) {
    return super.getBox(margin, this.getTopleft(pos))
  }
  static getCenter(pos) {
    let tileSize = [tilesize.w, tilesize.h];
    let topleft = this.getTopleft(pos)
    return [0, 1].map(i => topleft[i] + tileSize[i] / 2);
  }
  static draw(tiledata) {
    let { pos: pos, infotext: infotext, tiletext: tiletext } = tiledata
    let margin = 10;
    let [x, y] = this.getTopleft(pos)
    let box = this.getBox(margin, pos)
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "lightgreen";
    ctx.strokeStyle = "black";
    ctx.strokeRect(...box);
    ctx.font = "10px D2Coding";
    ctx.textBaseline = "bottom";
    ctx.textAlign = "left";
    ctx.fillText(infotext, ...box.slice(0, 2));
    ctx.font = "30px D2Coding";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tiletext, ...this.getCenter(pos));
  }
}

class Cursor extends GridBox {
  static getBox(margin, pos) {
    return GridBox.getBox(margin, this.getTopleft(pos))
  }
  static draw(cursor) {
    let pos = cursor.pos
    let margin = 20;
    let [x, y] = this.getTopleft(pos)
    let box = this.getBox(margin, pos)
    let ctx = canvas.getContext("2d");
    ctx.save()
    ctx.lineWidth = 3
    ctx.strokeStyle = cursor.strokeStyle ?? "white";
    ctx.strokeRect(...box);
    ctx.restore()
  }
}
var cursor = { pos: [0, 0] }
var cursorLog = []

var tiles = new Map();
function range(n) {
  return [...Array(n).keys()];
}

var puzzle0 = "7733IIXV.LXXL.IXVI.IVIX.XLIX.VIXX.XIXI.LIVL.XXVI.XIXL"
var puzzle1 = "7734VL.IILV.IVL.XLXX.XIL.VIIXLIXI.V.VILVXXII.XII.VIVL"
function puzzleImport(puzzle) {
  boardsize.col = +puzzle[0]
  boardsize.row = +puzzle[1]
  cursor.pos = [+puzzle[2], +puzzle[3]]
  let board = puzzle.slice(4)
  range(boardsize.col).forEach(i => {
    range(boardsize.row).forEach(j => {
      let tile = { pos: [i, j], infotext: `${i}.${j}`, tiletext: board[i + boardsize.col * j] }
      tiles.set(tile.infotext, tile);
    });
  });
}


function isOutOfBound(i, j) {
  return i < 0 || j < 0 || i >= boardsize.col || j >= boardsize.row
}

function getNextTo(i, j) {
  var result = []
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
    Tile.draw(tile);
  });

  Cursor.draw(cursor);
}

function update() {
  draw();
}
puzzleImport(puzzle1)

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
  // let separator = '■'
  let separator = '.'
  while (1) {
    yield renderRomanNumeral(now) + separator
    now += 1
  }
}
var counter = getNextCount()
var level = ['Start!', counter.next().value, counter.next().value]
const levelStart = 1
const initialState = { mylevel: levelStart, step: 0 }
var state = { ...initialState }
var stateLog = [{ ...state }]

const progression = document.getElementById('progression');

var controller = {};
controller.stepRight = function () {
  controller.stepX('right')
};
controller.stepLeft = function () {
  controller.stepX('left')
};
controller.stepUp = function () {
  controller.stepX('up')
};
controller.stepDown = function () {
  controller.stepX('down')
};
controller.stepX = function (direction) {
  let pos = [...cursor.pos]
  switch (direction) {
    case 'right':
      pos[0] += 1
      break;
    case 'left':
      pos[0] -= 1
      break;
    case 'up':
      pos[1] -= 1
      break;
    case 'down':
      pos[1] += 1
      break;
  }
  if (isOutOfBound(...pos)
    || level[state.mylevel][state.step] != tiles.get(`${pos[0]}.${pos[1]}`).tiletext) {
    console.log('Nope!')
  }
  else {
    cursorLog.push([...cursor.pos])
    cursor.pos = pos
    controller.nextStep()
  }
};

function renderProgress() {
  let mylevel = state.mylevel
  let pastText = level[mylevel - 1]
  let levelText = level[mylevel]
  let nextText = level[mylevel + 1]
  document.getElementById('level').innerText = 'Level: ' + mylevel
  progression.innerHTML = ''
    + `<div class='past'>Last Level: ${pastText}<br></div>`
    + `<div class='passed'>Pass: ${levelText.slice(0, state.step)}<br></div>`
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
  stateLog.push({ ...state })
  renderProgress()
}
controller.rollBack = function () {
  stateLog.pop()
  if (stateLog.length == 0) { stateLog.push(initialState) }
  state = { ...stateLog[stateLog.length - 1] }
  if (cursorLog.length > 0) {
    cursor.pos = cursorLog.pop()
  }
  renderProgress()
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
      // controller.nextStep();
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