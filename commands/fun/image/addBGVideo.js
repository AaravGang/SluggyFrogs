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
const progressUrl = process.env.PROGRESS_URL;

const fetch = require("node-fetch");
const fs = require("fs");

const { performance } = require("perf_hooks");

module.exports = {
  name: "addv",
  aliases: ["addvideo", "add_video", "update_video"],
  description: `Add an video to the DB!`,
  execute: addVideoToDB,
};

const srcUrl =
  "https://cdn.discordapp.com//attachments/1059878251578806333/1102812542373470228/Screen_Shot_2023-05-02_at_9.52.58_AM.png";

async function addVideoToDB(client, msg, params, serverDetail) {
  const attc = msg.attachments.first();
  if (!attc) {
    msg.reply("Got no attachment.");
    return false;
  }

  const [url, height, width, size, request_id] = [
    attc.url,
    attc.height,
    attc.width,
    attc.size,
    msg.id,
  ];

  let [name] = params.slice(0, 1);

  const data = await validate(url, width, height, name, size, request_id, msg);

  if (!data) {
    return;
  }

  if (data.error) {
    msg.reply(data.error);
    msg.react("🚫");
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
    msg.reply("Updated video successfully!\nLoading Preview...");
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

async function validate(url, width, height, name, size, request_id, msg) {
  if (!name) {
    msg.reply(`Got no name. \`${prefix} addv <name> <+attachment>\``);
    return false;
  }

  let embedFormat = {
    title: `Gender Reveal ${animated.strechee.full}`,
    description: `Please wait while we make you transgender.🎊👯`,
    fields: [],
    color: "#EB459E",
  };

  var starttime = performance.now();

  let tracker = await msg.channel.send(`Validating. This may take some time.`);

  let progressUpdater = setInterval(
    updateProgress,
    2000,
    request_id,
    tracker,
    embedFormat
  );

  try {
    var data = await fetch(
      `${videoSwapUrl}&srcUrl=${srcUrl}&dstUrl=${url}&request_id=${request_id}`
    );

    data = await data.json();
  } catch (e) {
    clearInterval(progressUpdater);
    return false;
  }
  clearInterval(progressUpdater);
  if (data.error) {
    return data;
  }

  var seconds = Math.floor((performance.now() - starttime) / 1000);
  var mins = Math.floor(seconds / 60);
  seconds = seconds - mins * 60;

  embedFormat.footer = {
    text: `Finished Surgery in ${mins} minutes ${seconds} seconds`,
  };
  tracker.edit({ embed: embedFormat });
  return data;
}

async function sendPreview(data, msg) {
  imgStorage.find({ _id: data.id }).then(async (arr) => {
    let buffer = await arr[0];
    if (!buffer) {
      return msg.reply(
        "Looks like something went wrong...Couldn't load preview"
      );
    }
    buffer = buffer.get("buffer");
    fs.writeFile("out.mp4", buffer, "base64", function (err) {
      console.log(`Error while writing out.mp4: ${err}`);
    });

    attachment = new Discord.MessageAttachment("out.mp4", "attachment.mp4");

    msg.react(animated.strechee.full);
    msg.channel.send(`Preview! ${emojis.shrekdisgusted.full}`, attachment);
  });
  let res = await imgStorage.deleteOne({ _id: data.id });
}

let updateProgress = async (request_id, msg, embedFormat) => {
  var data = await fetch(`${progressUrl}${request_id}`);
  data = await data.json();
  console.log(data);
  embedFormat.fields = Object.values(data);
  msg.edit({ embed: embedFormat });
};
