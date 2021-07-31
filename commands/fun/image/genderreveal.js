module.exports = {
  name: "genderreveal",
  aliases: ["gr", "revealgender"],
  description: `Reveal the gender of a member!`,
  execute: genderReveal,
};
const Canvas = require("canvas");
const Discord = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();
const creators = process.env.CREATOR_IDS.split(' ');
var bg;

Canvas.loadImage(
  "https://64.media.tumblr.com/202c1955cb2c42045142656a81107657/tumblr_nx29y66Y2y1tmbsp5o1_1280.jpg"
).then((img) => (bg = img));

// setTimeout(()=>console.log(bg),6000)

async function genderReveal(client, msg, params, serverDetails) {
  const canvas = Canvas.createCanvas(500, 500);
  const context = canvas.getContext("2d");
  // Since the image takes time to load, you should await it

  // This uses the canvas dimensions to stretch the image onto the entire canvas
  context.drawImage(bg, 0, 0, canvas.width, canvas.height);
  var avatar;
  if (
    msg.mentions.members.first() &&
    !creators.includes(msg.mentions.members.first().user.id)
  ) {
    avatar = await Canvas.loadImage(
      msg.mentions.members.first().user.displayAvatarURL({ format: "jpg" })
    );
  } else {
    avatar = await Canvas.loadImage(
      msg.author.displayAvatarURL({ format: "jpg" })
    );
  }

  // Draw a shape onto the main canvas
  context.drawImage(avatar, 40, 80, 130, 130);

  const attachment = new Discord.msgAttachment(
    canvas.toBuffer(),
    "welcome-image.png"
  );

  msg.channel.send(`Welcome to the server!`, attachment);
}
