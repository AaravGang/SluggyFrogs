const dbHelper = require("../../../DBHelper");
const addVideo = dbHelper.addImage;
const getVideo = dbHelper.getImage;
const updateVideo = dbHelper.updateImage;

const imgStorage = require("../../../models").imgStorageModel;

const emojisJson = require("../../../emojis.json");
const emojis = emojisJson.emojis;
const animated = emojisJson.animated;

const Discord = require("discord.js");

const Canvas = require("canvas");

const dotenv = require("dotenv");
dotenv.config();
const prefix = process.env.PREFIX;
const videoSwapUrl = process.env.VIDEO_FACE_SWAP;

const fetch = require("node-fetch");
const fs = require("fs");

module.exports = {
  name: "addv",
  aliases: ["addvideo", "add_video", "update_video"],
  description: `Add an video to the DB!`,
  execute: addVideoToDB,
};

const srcUrl =
  "https://cdn.discordapp.com/attachments/1059878251578806333/1059894909911437343/images.jpg";

async function addVideoToDB(client, msg, params, serverDetail) {
  const attc = msg.attachments.first();
  if (!attc) {
    msg.reply("Got no attachment.");
    return false;
  }

  const [url, height, width] = [attc.url, attc.height, attc.width];

  let [name] = params.slice(0, 1);

  const data = await validate(url, width, height, name, msg);

  if (!data) {
    return;
  }

  if (!data.status) {
    msg.reply("Couldn't detect any faces");
    msg.react("🚫");
    return;
  }

  let addRequest = {
    name: name,
    url: url,
    type: "video",
  };
  if (await getVideo(name)) {
    await updateVideo(name, addRequest);
    msg.reply("Updated video successfully!");
    msg.react("👍");
  } else {
    let addStatus = await addVideo(addRequest);
    if (addStatus) {
      msg.reply("Added successfully!\nLoading Preview...");
      msg.react("👍");
    }
  }
  sendPreview(data, msg);
}

async function validate(url, width, height, name, msg) {
  if (!name) {
    msg.reply(`Got no name. \`${prefix} addv <name> <+attachment>\``);
    return false;
  }
  msg.channel.send("Validating. This may take some time.");

  var data = await fetch(`${videoSwapUrl}&srcUrl=${srcUrl}&dstUrl=${url}`);
  data = await data.json();
  return data;
}

async function sendPreview(data, msg) {
  imgStorage.find({ _id: data.id }).then(async (arr) => {
    const buffer = arr[0].get("buffer");
    fs.writeFile("out.mp4", buffer, "base64", function (err) {
      console.log(err);
    });

    attachment = new Discord.MessageAttachment("out.mp4", "attachment.mp4");

    msg.react(animated.strechee.full);
    msg.channel.send(`Preview! ${emojis.shrekdisgusted.full}`, attachment);
  });
  let res = await imgStorage.deleteOne({ _id: data.id });
}
