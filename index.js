const Discord = require("discord.js");

const dotenv = require("dotenv");
dotenv.config();

const prefix = process.env.PREFIX.toLowerCase();
const botToken = process.env.BOT_TOKEN;
const startWealth = parseInt(process.env.START_WEALTH);

const client = new Discord.Client();
client.commands = new Discord.Collection();
const fs = require("fs");
const commandFolders = fs.readdirSync("./commands");

const help = require("./help");

const models = require("./models");
const serverModel = models.serverModel;

const dbHelper = require("./DBHelper");
const onGuildJoin = dbHelper.onGuildJoin;
const onGuildLeave = dbHelper.onGuildLeave;
const onMemberJoin = dbHelper.onMemberJoin;

function setCommands() {
  for (let folder of commandFolders) {
    let subFolders = fs.readdirSync(`./commands/${folder}`);
    for (let subFolder of subFolders) {
      let commandFiles = fs
        .readdirSync(`./commands/${folder}/${subFolder}`)
        .filter((file) => file.endsWith(".js"));
      for (let file of commandFiles) {
        const command = require(`./commands/${folder}/${subFolder}/${file}`);
        if (command.name) {
          client.commands.set(command.name, command);
        }
      }
    }
  }

  client.commands.set("help", help);
}
setCommands();

client.once("ready", () => {
  console.log("Up and Ready!!");
});

client.on("guildCreate", async (guild) => {
  let joinStatus = await onGuildJoin(guild);
  // console.log("SERVER JOINED:", joinStatus);
});

client.on("guildDelete", async (guild) => {
  let leaveStatus = await onGuildLeave(guild);
  // console.log("SERVER DELETED:", leaveStatus);
});

client.on("guildMemberAdd", async (member) => {
  let addStatus = await onMemberJoin(member);
  console.log(addStatus);
});

client.login(botToken).then((_response) => {
  client.user.setActivity(`${prefix}😂`, {
    type: "LISTENING",
  });
});

client.on("message", async (message) => {
  if (message.content.toLowerCase().startsWith(prefix) && !message.author.bot) {
    let serverDetails = await serverModel.findOne({
      serverID: message.guild.id,
    });
    if (!serverDetails) {
      serverDetails = await onGuildJoin(message.guild);
    }

    // console.log("THIS IS SERVER WAS CREATED WHEN SOMEONE TEXTED:", serverDetails);

    return handleCommands(client, message, serverDetails);
  }
});

function handleCommands(client, msg, serverDetails) {
  let content = msg.content.toLowerCase();
  let tokens = content
    .trim()
    .split(" ")
    .filter((item) => item); // get rid of "" blank strings

  // prefix is tokens[0]
  let commandName = tokens[1];
  let commandParams = tokens.slice(2);
  if (commandName && client.commands.has(commandName)) {
    client.commands
      .get(commandName)
      .execute(client, msg, commandParams, serverDetails);
  } else if (
    commandName &&
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    )
  ) {
    client.commands
      .find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))
      .execute(client, msg, commandParams, serverDetails);
  }
}