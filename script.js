const CANVAS = document.getElementById("canvas");
const CANVAS_CENTER = [CANVAS.width / 2, CANVAS.height / 2]
var game = {boardSize : new Array(2)}
var TILE_SIZE = [50, 50];//[width, height]
var BOARD_SIZE = { col: 6, row: 6 };

var cursor = { pos: [0, 0] }
var cursorLog = []
var cursor_initial = { pos: [0, 0] }

var tiles = new Map();

var puzzle0 = "7733IIXV.LXXL.IXVI.IVIX.XLIX.VIXX.XIXI.LIVL.XXVI.XIXL"
var puzzle1 = "7734VL.IILV.IVL.XLXX.XIL.VIIXLIXI.V.VILVXXII.XII.VIVL"
function puzzleImport(puzzle) {
  game.boardSize[0] = BOARD_SIZE.col = +puzzle[0]
  game.boardSize[1] = BOARD_SIZE.row = +puzzle[1]
  GridBox.gridSize = [...game.boardSize]
  cursor_initial = [+puzzle[2], +puzzle[3]]
  cursor.pos = [...cursor_initial]
	let board = puzzle.slice(4)
	
  range(game.boardSize[0]).forEach(i => {
    range(game.boardSize[1]).forEach(j => {
      let tile = { pos: [i, j], infotext: `${i}.${j}`, tiletext: board[i + game.boardSize[0] * j] }
      tiles.set(tile.infotext, tile);
    });
  });
}

GridBox.cellSize = [...TILE_SIZE];
//gridSize will be reimported on puzzle importing stage
// GridBox.gridSize = [...game.boardSize];
GridBox.center = [...CANVAS_CENTER]

Tile.ctx = CANVAS.getContext("2d");
Cursor.ctx = CANVAS.getContext("2d");

function isOnBoard(i, j) {
  return !(i < 0 || j < 0 || i >= BOARD_SIZE.col || j >= BOARD_SIZE.row)
}

function getNextTo(i, j) {
  var result = []
  if (!isOnBoard(i, j)) { return result }
  if (isOnBoard(i + 1, j)) { result.push([i + 1, j]) }
  if (isOnBoard(i - 1, j)) { result.push([i - 1, j]) }
  if (isOnBoard(i, j + 1)) { result.push([i, j + 1]) }
  if (isOnBoard(i, j - 1)) { result.push([i, j - 1]) }
  return result
}

function draw() {
  let ctx = CANVAS.getContext("2d");
  ctx.fillStyle = "rgb(104, 153, 185)"; // Pythagorean triple
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);

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
  function isValidSymbol() {
    return level[state.mylevel][state.step]
      == tiles.get(`${pos[0]}.${pos[1]}`).tiletext
  }
  if (!isOnBoard(...pos)
    || !isValidSymbol()) {
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
controller.reset = function () {
  stateLog = [initialState]
  state = { ...initialState }
  cursor.pos = [...cursor_initial]
  cursorLog = []
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
    case "KeyR":
      controller.reset();
      break;
    default:
      break;
  }
}

window.addEventListener("keydown", keydownHandler);

renderProgress();