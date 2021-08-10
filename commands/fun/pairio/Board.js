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

const fontSize = 30;
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
    const canvas = Canvas.createCanvas(imageDimensions, imageDimensions);

    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "red";
    ctx.lineWidth = this.spacerSize;
    ctx.font = `${fontSize} "Arial"`;

    // draw pics
    for (var i = 0; i < this.size; i++) {
      for (var j = 0; j < this.size; j++) {
        if (this.guessed.includes(this.plainBoard[i * this.size + j])) {
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
          ctx.fillText(
            this.plainBoard[i * this.size + j],
            i * this.boxSize + this.spacerSize,
            j * this.boxSize + this.spacerSize
          );
        } else {
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
            i * this.boxSize ,
            j * this.boxSize,
            this.boxSize,
            this.boxSize
          );
          ctx.fillText(
            this.plainBoard[i * this.size + j],
            i * this.boxSize + this.spacerSize,
            j * this.boxSize + this.spacerSize
          );
        }
      }
    }

    // draw lines
    for (var i = 0; i <= this.size; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * this.boxSize);
      ctx.lineTo(imageDimensions, i * this.boxSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(i * this.boxSize, 0);
      ctx.lineTo(i * this.boxSize, imageDimensions);
      ctx.stroke();
    }

    this.image = canvas.toBuffer();
    return this.image;
  }
}

module.exports = {
  Board: Board,
};
