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
const fs = require("fs");

const creators = process.env.CREATOR_IDS.split(" ");
const faceSwapUrl = process.env.FACESWAP_URL;
const videoSwapUrl = process.env.VIDEO_FACE_SWAP;
const progressUrl = process.env.PROGRESS_URL;

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
const deleteImage = dbHelper.deleteImage;

const imgStorage = require("../../../models").imgStorageModel;

const fetch = require("node-fetch");

let embedFormat = {
  title: `Gender Reveal ${animated.strechee.full}`,
  description: `Please wait while we make you transgender.🎊👯`,
  fields: [],
  color: "#EB459E",
};


let updateProgress = async (request_id, msg) => {
  var data = await fetch(`${progressUrl}${request_id}`);
  data = await data.json();
  console.log(data);
  embedFormat.fields = Object.values(data);
  msg.edit({ embed: embedFormat });
};


async function genderReveal(client, msg, params, serverDetails) {
  let bgOpts = [];
  if (params.length > 0) {
    bgOpts = await getImages({ name: params[0] });
  }
  if (bgOpts.length == 0) {
    bgOpts = await getImages();
  }
  const bgInfo = bgOpts[Math.floor(Math.random() * bgOpts.length)];
  const type = bgInfo.type;

  const canvas = Canvas.createCanvas(500, 500);
  let attachment;

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
        `Error. profile pic of <@${msg.mentions.members.first().user.id
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

  let progressUpdater
  if (type == "video") {

    let tracker = await msg.channel.send(`Editing. This may take some time.`);

    progressUpdater = setInterval(updateProgress, 2000, msg.id, tracker);

  }

  try {
    console.log(bgInfo.url);
    var apiUrl =
      type == "image"
        ? `${faceSwapUrl}srcUrl=${encodeURIComponent(url)}&dstUrl=${encodeURIComponent(bgInfo.url)}`
        : `${videoSwapUrl}&srcUrl=${encodeURIComponent(url)}&dstUrl=${encodeURIComponent(bgInfo.url)}&request_id=${msg.id}`;


    var data = await fetch(apiUrl);
    data = await data.json();

    clearInterval(progressUpdater)
    if (data.error) {
      return msg.reply(data.error)
    }


  } catch (e) {
    console.log("Error while trying to face swap:", e);
    if (type == "video") {
      clearInterval(progressUpdater)
      msg.reply("Error while fetching.");
      return;
    }
    const bg = await Canvas.loadImage(bgInfo.url);

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

    attachment = new Discord.MessageAttachment(
      canvas.toBuffer(),
      "attachment.png"
    );
    msg.react(animated.strechee.full);
    msg.channel.send(
      `Your deepest secrets have been revealed, XD :)! ${emojis.shrekdisgusted.full}`,
      attachment
    );
    console.log("uploaded image");

    return;
  }

  if (data.status) {
    imgStorage.find({ _id: data.id }).then(async (arr) => {
      const buffer = arr[0].get("buffer");

      if (type == "video") {

        let success = true;
        fs.writeFile("out.mp4", buffer, "base64", function(err) {
          success = false;
        });
        if (!success) {
          msg.reply("Error while writing out.mp4");

          return;
        }

        attachment = new Discord.MessageAttachment("out.mp4", "attachment.mp4");
      } else {
        const img = new Canvas.Image();

        img.onload = async () => {
          const canvas = Canvas.createCanvas(img.width, img.height);
          const context = canvas.getContext("2d");
          context.drawImage(img, 0, 0, img.width, img.height);

          attachment = new Discord.MessageAttachment(
            canvas.toBuffer(),
            "attachment.png"
          );
        };
        img.src = "data:image/png;base64," + buffer;
      }

      msg.react(animated.strechee.full);
      msg.channel.send(
        `Your deepest secrets have been revealed, XD :)! ${emojis.shrekdisgusted.full}`,
        attachment
      );
      console.log("uploaded image");

      let res = await imgStorage.deleteOne({ _id: data.id });
    });
  } else {
    if (type == "video") {
      msg.reply("Swapping Failed.");
      await deleteImage(bgInfo.name)

      return;
    }

    let bg
    try {
      bg = await Canvas.loadImage(bgInfo.url);
    } catch (e) {
      console.log(`Background Image expired name:${bgInfo.name}`);
      deleteImage(bgInfo.name);
      msg.channel.send(`Looks like that image expired🤷‍♂️`);
      return;
    }
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

    attachment = new Discord.MessageAttachment(
      canvas.toBuffer(),
      "attachment.png"
    );
    msg.react(animated.strechee.full);
    msg.channel.send(
      `Your deepest secrets have been revealed, XD :)! ${emojis.shrekdisgusted.full}`,
      attachment
    );
    console.log("uploaded image");

    return;
  }
}
