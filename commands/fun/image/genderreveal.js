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
const creators = process.env.CREATOR_IDS.split(" ");
var bgOpts = [];

Canvas.loadImage(
  "https://64.media.tumblr.com/202c1955cb2c42045142656a81107657/tumblr_nx29y66Y2y1tmbsp5o1_1280.jpg"
).then((img) => bgOpts.push(img));

Canvas.loadImage("commands/fun/image/haha.jpg").then((img) => bgOpts.push(img));

// setTimeout(()=>console.log(bg),6000)

async function genderReveal(client, msg, params, serverDetails) {
  const maya = await Canvas.loadImage(
    "commands/fun/image/Screenshot_2021-08-05_at_12.28.58_PM.png"
  );
  let bg = bgOpts[Math.floor(Math.random() * bgOpts.length)];
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
  context.drawImage(maya, 40, 80, 130, 130);

  const attachment = new Discord.MessageAttachment(
    canvas.toBuffer(),
    "welcome-image.png"
  );

  msg.channel.send(
    `Your deepest secrets have been revealed, XD :)!`,
    attachment
  );
}
