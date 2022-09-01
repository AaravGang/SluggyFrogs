module.exports = {
  name: "genderreveal",
  aliases: ["gr", "revealgender"],
  description: `Reveal the gender of a member!`,
  execute: genderReveal,
};
const Canvas = require("canvas");
const Discord = require("discord.js");

const emojisJson = require("../../../emojis.json");
const emojis = emojisJson.emojis;
const animated = emojisJson.animated;

const dotenv = require("dotenv");
dotenv.config();

const creators = process.env.CREATOR_IDS.split(" ");
// var bgOpts = [];

// Canvas.loadImage(
//   "https://media.tenor.com/images/fb2fdc0aab9f6f65c194d8425e1e224c/raw"
// ).then((img) => console.log(img));

// Canvas.loadImage("commands/fun/image/haha.jpg").then((img) =>
//   bgOpts.push({ image: img, avatarSize: 130, avatarX: 60, avatarY: 120 })
// );

const dbHelper = require("../../../DBHelper");
const getImages = dbHelper.getImages;
const getProfilePics = dbHelper.getProfilePics;
const delProfilePic = dbHelper.delProfilePic;

async function genderReveal(client, msg, params, serverDetails) {
  const bgOpts = await getImages();

  const bgInfo = bgOpts[Math.floor(Math.random() * bgOpts.length)];

  let bg = await Canvas.loadImage(bgInfo.url);

  const canvas = Canvas.createCanvas(500, 500);
  const context = canvas.getContext("2d");
  // Since the image takes time to load, you should await it

  // This uses the canvas dimensions to stretch the image onto the entire canvas
  context.drawImage(bg, 0, 0, canvas.width, canvas.height);

  var avatar;
  if (
    msg.mentions.members.first() &&
    !msg.mentions.members.first().user.bot &&
    !creators.includes(msg.mentions.members.first().user.id)
  ) {
    const profilePics = await getProfilePics(
      msg.guild,
      msg.mentions.members.first().user.id
    );

    var url = msg.mentions.members
      .first()
      .user.displayAvatarURL({ format: "jpg" });

    try {
      avatar = await Canvas.loadImage(url);
    } catch (e) {
      return msg.reply(
        "Error while trying to load the discord avatar of member."
      );
    }

    //check if all pfps are valid, if not delete them
    if (profilePics) {
      urls = [...profilePics];
      urls.forEach(async (imageLink, ind) => {
        try {
          avatar = await Canvas.loadImage(imageLink);
        } catch (err) {
          delProfilePic(
            msg.guild,
            msg.mentions.members.first().user.id,
            imageLink
          );
          profilePics.splice(ind);
        }
      });
    }

    if (profilePics && profilePics.length > 0) {
      url = profilePics[Math.floor(Math.random() * profilePics.length)];
    }

    try {
      avatar = await Canvas.loadImage(url);
    } catch (err) {
      msg.reply(
        `Error. profile pic of <@${
          msg.mentions.members.first().user.id
        }> has prolly expired.`
      );
    }
    if (!avatar) return false;
  } else {
    const profilePics = await getProfilePics(msg.guild, msg.author.id);
    var url = msg.author.displayAvatarURL({ format: "jpg" });
    try {
      avatar = await Canvas.loadImage(url);
    } catch (e) {
      return msg.reply(
        "Error while trying to load the discord avatar of member."
      );
    }

    //check if all pfps are valid, if not delete them
    if (profilePics) {
      urls = [...profilePics];

      urls.forEach(async (imageLink, ind) => {
        try {
          avatar = await Canvas.loadImage(imageLink);
        } catch (err) {
          delProfilePic(msg.guild, msg.author.id, imageLink);
          profilePics.splice(ind);
        }
      });
    }

    if (profilePics && profilePics.length > 0) {
      url = profilePics[Math.floor(Math.random() * profilePics.length)];
    }
    try {
      avatar = await Canvas.loadImage(url);
    } catch (err) {
      msg.reply(
        `Error. profile pic of <@${msg.author.id}> has prolly expired.`
      );
    }
    if (!avatar) return false;
  }

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

  msg.react(animated.strechee.full);
  msg.channel.send(
    `Your deepest secrets have been revealed, XD :)! ${emojis.shrekdisgusted.full}`,
    attachment
  );
}
