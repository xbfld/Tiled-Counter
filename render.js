class GridBox {
  static getTopleft(cellIndex) {
    let boardHalfway = [0, 1].map(i => this.gridSize[i] / 2);
    let indexOffset = [0, 1].map(i => cellIndex[i] - boardHalfway[i]);
    let offset = [0, 1].map(i => indexOffset[i] * this.cellSize[i]);
    let pos = [0, 1].map(i => this.center[i] + offset[i]);
    return pos
  }

  //shrink half-margin for all sides
  static getBox(topleft, margin) {
    let [x, y] = topleft
    return [
      x + margin / 2,
      y + margin / 2,
      this.cellSize[0] - margin,
      this.cellSize[1] - margin
    ]
  }
}
self.GridBox = GridBox

class Tile extends GridBox {
  static getBox(pos, margin) {
    return super.getBox(this.getTopleft(pos), margin)
  }
  static getCenter(pos) {
    let [x, y, w, h] = this.getBox(pos, 0)
    return [x + w / 2, y + h / 2]
  }
  static draw(tiledata) {
    let { pos: pos, infotext: infotext, tiletext: tiletext } = tiledata
    let margin = 10;
    // let [x, y] = this.getTopleft(pos)
    let box = this.getBox(pos, margin)
    let ctx = this.ctx
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
self.Tile = Tile

class Cursor extends GridBox {
  static getBox(pos, margin) {
    return super.getBox(this.getTopleft(pos), margin)
  }
  static draw(cursor) {
    let pos = cursor.pos
    let margin = 20;
    // let [x, y] = this.getTopleft(pos)
    let box = this.getBox(pos, margin)
    let ctx = this.ctx
    ctx.save()
    ctx.lineWidth = 3
    ctx.strokeStyle = cursor.strokeStyle ?? "white";
    ctx.strokeRect(...box);
    ctx.restore()
  }
}
self.Cursor = Cursor