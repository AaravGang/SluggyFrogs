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
    this.images = {};
  }

  async draw() {
    const canvas = Canvas.createCanvas(imageDimensions, imageDimensions);

    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "red";
    ctx.lineWidth = this.spacerSize;
    ctx.font = "30px Arial";

    ctx.fillStyle = "#000000";

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw pics
    for (var i = 0; i < this.size; i++) {
      for (var j = 0; j < this.size; j++) {
        if (this.guessed.includes(this.plainBoard[i * this.size + j])) {
          let img = noImg;
          if (this.images[this.plainBoard[i * this.size + j]]) {
            img = this.images[this.plainBoard[i * this.size + j]];
          } else {
            try {
              img = await Canvas.loadImage(
                await getPreview(this.plainBoard[i * this.size + j])
              );
              this.images[this.plainBoard[i * this.size + j]] = img;
            } catch (err) {
              console.log(err);
            }
          }
          ctx.drawImage(
            img,
            j * this.boxSize + this.spacerSize,
            i * this.boxSize + this.spacerSize,
            this.boxSize - this.spacerSize,
            this.boxSize - this.spacerSize
          );
          ctx.fillStyle = "#0000FF";
          ctx.fillText(
            this.plainBoard[i * this.size + j],
            j * this.boxSize + this.spacerSize,
            i * this.boxSize + this.boxSize - this.spacerSize
          );
        } else {
          ctx.fillStyle = "#fff";
          ctx.fillRect(
            j * this.boxSize + this.spacerSize,
            i * this.boxSize + this.spacerSize,
            this.boxSize - this.spacerSize,
            this.boxSize - this.spacerSize
          );
        }
        ctx.fillStyle = "#FF0000";
        ctx.fillText(
          i * this.size + j,
          j * this.boxSize + 50,
          i * this.boxSize + 50
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
