const dbHelper = require("../../../DBHelper");
const addImage = dbHelper.addImage;
const Canvas = require("canvas");
module.exports = {
  name: "addi",
  aliases: ["addimage", "add_image"],
  description: `Add an image to the DB!`,
  execute: addImageToDB,
};

const dotenv = require("dotenv");
dotenv.config();
const prefix = process.env.PREFIX;

async function addImageToDB(client, msg, params, serverDetail) {
  // name url avatarSize avatarX avatarY
  const [name, url, avatarSize, avatarX, avatarY] = params.slice(0, 5);
  console.log(name, url, avatarSize, avatarX, avatarY);

  const addRequest = await validateParams(
    name,
    url,
    avatarSize,
    avatarX,
    avatarY,
    msg
  );
  console.log(addRequest);
  if (addRequest == false) return;

  let addStatus = await addImage(
    addRequest.name,
    addRequest.image,
    addRequest.avatarSize,
    addRequest.avatarX,
    addRequest.avatarY
  );
  if (addStatus) {
    msg.reply("Added successfully!");
    return;
  }
  msg.reply("Error");
}

async function validateParams(name, url, avatarSize, avatarX, avatarY, msg) {
  if (name && !isNaN(avatarSize) && !isNaN(avatarX) && !isNaN(avatarY)) {
    var image;
    var imageBuffer;
    try {
      image = await Canvas.loadImage(url);

      if (!image) {
        msg.reply(`No image!`);
        return false;
      }
      const canvas = Canvas.createCanvas(500, 500);
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      imageBuffer = context.toBuffer();
    } catch (err) {
      msg.reply(`Exception while trying to load image from url`);
      console.log(err);
      return false;
    }
    return {
      name: name,
      image: imageBuffer,
      avatarSize: parseInt(avatarSize),
      avatarX: parseInt(avatarX),
      avatarY: parseInt(avatarY),
    };
  }

  msg.reply(
    `Recieved invalid params. \`${prefix} addi <name> <url> <avatarSize> <avatarX (topleft)> <avatarY (topleft)>\``
  );
  return false;
}
