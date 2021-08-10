const fs = require("fs");
const dir = "./commands/fun/pairio/";
const commandFiles = fs
  .readdirSync(dir)
  .filter((fileName) => fileName.endsWith(".js"));
const fileDetails = [];
for (let fileName of commandFiles) {
  let file = require(`./${fileName}`);
  if (file.name) {
    fileDetails.push(file);
  }
}

const dotenv = require("dotenv");
dotenv.config();
const prefix = process.env.PREFIX.toLowerCase();

function help() {
  let helpEmbed = {
    title: "Play Pair.io Commands",
    description: "",
    fields: [],
    color: "YELLOW",
  };

  for (let file of fileDetails) {
    helpEmbed.fields.push({
      name: file.name,
      value: `${file.description}\nUsage: \`${prefix} ${
        file.name
      }\`\nAliases: ${
        file.aliases ? file.aliases.toString().replace(/,/g, ", ") : "None"
      }`,
      inline: true,
    });
  }

  return helpEmbed;
}

module.exports = {
  help: help,
  details: fileDetails,
};
