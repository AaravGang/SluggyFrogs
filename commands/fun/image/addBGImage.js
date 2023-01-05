const dbHelper = require("../../../DBHelper");
const addImage = dbHelper.addImage;
const getImage = dbHelper.getImage;
const updateImage = dbHelper.updateImage;

const emojisJson = require("../../../emojis.json");
const emojis = emojisJson.emojis;
const animated = emojisJson.animated;

const Discord = require("discord.js");

const Canvas = require("canvas");
module.exports = {
  name: "addi",
  aliases: ["addimage", "add_image", "update_image"],
  description: `Add an image to the DB!`,
  execute: addImageToDB,
};

const dotenv = require("dotenv");
dotenv.config();
const prefix = process.env.PREFIX;

var previewAvatar;
Canvas.loadImage("commands/fun/image/maya.png").then(
  (img) => (previewAvatar = img)
);

async function addImageToDB(client, msg, params, serverDetail) {
  // name url avatarSize avatarX avatarY
  let [name, url, avatarSize, avatarX, avatarY] = params.slice(0, 5);
  url = msg.attachments.first() ? msg.attachments.first().url : url

  const addRequest = await validateParams(
    name,
    url,
    avatarSize,
    avatarX,
    avatarY,
    msg
  );
  //   console.log(addRequest);
  if (addRequest == false) return;

  let addStatus = await addImage(
    name,
    url,
    addRequest.avatarSize,
    addRequest.avatarX,
    addRequest.avatarY
  );
  if (addStatus) {
    msg.reply("Added successfully!");
    msg.react("👍");
    sendPreview(addRequest, previewAvatar, msg);

    return;
  }
  msg.reply("Error. line 54");
}

async function validateParams(name, url, avatarSize, avatarX, avatarY, msg) {
  if (name && !isNaN(avatarSize) && !isNaN(avatarX) && !isNaN(avatarY)) {
    var image;

    try {
      console.log(url)
      image = await Canvas.loadImage(url);

      if (!image) {
        msg.reply(`No image!`);
        return false;
      }
    } catch (err) {
      console.log(err)
      msg.reply(`Exception while trying to load image from url`);

      return false;
    }

    if (await getImage(name)) {
      msg
        .reply("This image already exists, do you wanna update it?")
        .then((_) =>
          msg.channel
            .awaitMessages((m) => m.author.id == msg.author.id, {
              max: 1,
            })
            .then(async (collected) => {
              let m = collected.first();
              if (m.content != "yes") return false;
              const imgDetails = {
                name: name,
                url: url,
                avatarSize: avatarSize,
                avatarX: avatarX,
                avatarY: avatarY,
              };

              await updateImage(name, imgDetails);
              msg.reply("Updated image successfully!");
              msg.react("👍");
              sendPreview(imgDetails, previewAvatar, msg);
            })
            .catch((collected) => console.log(collected))
        );
      return false;
    }

    return {
      name: name,
      url: url,
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

async function sendPreview(bgInfo, avatar, msg) {
  let bg = await Canvas.loadImage(bgInfo.url);

  const canvas = Canvas.createCanvas(500, 500);
  const context = canvas.getContext("2d");
  // Since the image takes time to load, you should await it

  // This uses the canvas dimensions to stretch the image onto the entire canvas
  context.drawImage(bg, 0, 0, canvas.width, canvas.height);

  // Draw a shape onto the main canvas
  context.drawImage(
    avatar,
    bgInfo.avatarX,
    bgInfo.avatarY,
    bgInfo.avatarSize,
    bgInfo.avatarSize
  );

  const attachment = new Discord.MessageAttachment(
    canvas.toBuffer(),
    "welcome-image.png"
  );

  msg.channel.send(`Preview.${emojis.dick.full}`, attachment);
}
