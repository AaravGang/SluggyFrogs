const fs = require("fs");
const dir = "./commands/";
const commandFolders = fs.readdirSync("./commands");

const dotenv = require("dotenv");
dotenv.config();
const prefix = process.env.PREFIX.toLowerCase();

const helpCommands = {};

for (let folder of commandFolders) {
  let subFolders = fs.readdirSync(`./commands/${folder}`);
  for (let subFolder of subFolders) {
    let commandFiles = fs
      .readdirSync(`./commands/${folder}/${subFolder}`)
      .filter((file) => file === "help.js");
    for (let file of commandFiles) {
      const command = require(`./commands/${folder}/${subFolder}/${file}`);
      helpCommands[subFolder] = command;
    }
  }
}



function help(client, msg, params) {
  for (let param of params) {
    if (helpCommands[param]) {
      msg.channel.send({ embed: helpCommands[param].help() });
      return;
    }
  }
  const helpCommandsEmbed = {
    title: "My Commands",
    description: `\`${prefix} help <command_name>\`, to get detailed info of a command.`,
    fields: [],
    color: "#EB459E",
  };

  for (let [key, value] of Object.entries(helpCommands)) {
    helpCommandsEmbed.fields.push({
      name: `${key}`,
      value: `for detailed info: \`${prefix} help ${key}\``,
      inline: true,
    });
  }
  msg.channel.send({ embed: helpCommandsEmbed });
}

module.exports = {
  name: "help",
  description: `Get help about my commands.`,
  execute: help,
};
