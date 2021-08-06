const dbHelper = require("../../../DBHelper");
const addImage = dbHelper.addImage;
const getImage = dbHelper.getImage;
const updateImage = dbHelper.updateImage;

const Canvas = require("canvas");
module.exports = {
  name: "addi",
  aliases: ["addimage", "add_image","update_image"],
  description: `Add an image to the DB!`,
  execute: addImageToDB,
};

const dotenv = require("dotenv");
dotenv.config();
const prefix = process.env.PREFIX;

async function addImageToDB(client, msg, params, serverDetail) {
  // name url avatarSize avatarX avatarY
  const [name, url, avatarSize, avatarX, avatarY] = params.slice(0, 5);

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
    addRequest.name,
    addRequest.url,
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

    try {
      image = await Canvas.loadImage(url);

      if (!image) {
        msg.reply(`No image!`);
        return false;
      }
    } catch (err) {
      msg.reply(`Exception while trying to load image from url`);
      console.log(err);
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
              await updateImage(name, {
                name: name,
                url: url,
                avatarSize: avatarSize,
                avatarX: avatarX,
                avatarY: avatarY,
              });
              msg.reply("Updated image successfully!");
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
