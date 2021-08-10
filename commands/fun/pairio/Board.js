const imageDimensions = 500;
const Canvas = require("canvas");
const Discord = require("discord.js");
const getPreview = require("./getPreview").getPreview;

const dotenv = require("dotenv");
dotenv.config();

var noImg;
Canvas.loadImage("commands/fun/pairio/no_image.png").then(
  (img) => (noImg = img)
);
class Board {
  constructor(board) {
    this.plainBoard = board;
    this.image = null;
    this.size = Math.sqrt(board.length);

    this.spacerSize = 10;
    this.boxSize = imageDimensions / this.size - this.spacerSize;
    this.guessed = [];
  }

  async draw() {
    if (this.image) return this.image;
    const canvas = Canvas.createCanvas(imageDimensions, imageDimensions);

    const ctx = canvas.getContext("2d");
    for (var i = 0; i < this.size; i++) {
      for (var j = 0; j < this.size; j++) {
        let img = noImg;
        try {
          img = await Canvas.loadImage(
            await getPreview(this.plainBoard[i * this.size + j])
          );
        } catch (err) {
          console.log(err);
        }
        ctx.drawImage(
          img,
          i * this.boxSize + this.spacerSize,
          j * this.boxSize + this.spacerSize,
          this.boxSize,
          this.boxSize
        );
      }
    }
    this.image = canvas.toBuffer();
    return this.image;
  }
}



module.exports = {
  Board: Board,
};
