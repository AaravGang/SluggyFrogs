const jutsusFile = require("./Jutsus");
const newJutsu = jutsusFile.newJutsu;
const jutsusJson = require("./Jutsus.json");
const dotenv = require("dotenv");
dotenv.config();
const prefix = process.env.PREFIX;

const boostForChakraSync = 20;

class Shinobi {
  constructor(
    { name, commandName, chakra, health, jutsuNames, fees, chakraTypes },
    healthBoost = 0,
    chakraBoost = 0,
    powerBoost = 0
  ) {
    this.name = name;
    this.commandName = commandName;
    this.chakra = chakra + healthBoost;
    this.health = health + chakraBoost;
    this.powerBoost = powerBoost;
    this.jutsuNames = jutsuNames;
    this.chakraTypes = chakraTypes;
    this.jutsus = [];
    for (let jutsuName of this.jutsuNames) {
      let chakraSyncBoost = this.chakraTypes.includes(
        jutsusJson[jutsuName].type
      )
        ? boostForChakraSync
        : 0;
      this.jutsus.push(
        new newJutsu(jutsusJson[jutsuName], this.powerBoost + chakraSyncBoost)
      );
    }
    this.fees = fees;
  }
  getShinobiDetails() {
    return {
      name: this.name,
      commandName: this.commandName,
      chakra: this.chakra,
      health: this.health,
      jutsus: this.jutsus,
      jutsuNames: this.jutsuNames,
      fees: this.fees,
      damageBoost: this.damageBoost,
      chakraTypes: this.chakraTypes,
    };
  }
  getDetailsForEmbed() {
    return `Name: ${this.name}\n\nCommand Name: ${this.commandName}\n\nChakra:${this.chakra}\n\nHealth:${this.health}\n\nJutsus: ${this.jutsuNames}\n\nChakra Types: ${this.chakraTypes}\n\nFees: ${this.fees}`;
  }
}


// move this inside getshinobidetails if psbl
const shinobiDetails = require("./Shinobis.json");

const shinobis = {};
for ([key, value] of Object.entries(shinobiDetails)) {
  shinobis[key] = new Shinobi(value);
}
//

async function getShinobiDetails(client, msg, params = null) {
  const shinobisListEmbed = {
    color: "BLUE",
    title: "Choose your shinobi!",
    fields: [],
  };

  if (!params || !params.length) {
    for (let [shinobiKey, shinobi] of Object.entries(shinobis)) {
      shinobisListEmbed.fields.push({
        name: shinobi.name,
        value: `Use \`${prefix} hire ${
          shinobi.commandName
        }\` | [hover for details](${
          msg.url
        } "${shinobi.getDetailsForEmbed()}")`,
        inline: true,
      });
    }
  } else {
    let ind = 0;
    for (let param of new Set(params)) {
      if (ind >= 2) {
        break;
      }
      let shinobi = shinobis[param];
      if (shinobi) {
        shinobisListEmbed.fields.push({
          name: shinobi.name,
          value: `Usage: \`${prefix} hire ${
            shinobi.commandName
          }\`\n\n${shinobi.getDetailsForEmbed()}\n\n**Jutsus Info**\n\n${shinobi.jutsus
            .map(
              (jutsu) =>
                `Name: **${jutsu.name}**\nPower: ${jutsu.power}\nChakra: ${
                  jutsu.chakra
                }\nBranches: ${jutsu.jutsuBranches
                  .toString()
                  .replace(/,/, " + ")}`
            )
            .toString()
            .replace(/,/g, "\n\n")}`,
          inline: true,
        });
        ind++;
      }
    }
  }
  await msg.channel.send({ embed: shinobisListEmbed });
}

module.exports = {
  name: "hire-options",
  aliases: ["shinobis", "shinobi", "hire_options", "hire-opts", "hire_opts"],
  description: `Get list of available shinobis\nUsage: \`${prefix} hire-options\``,
  execute: getShinobiDetails,
  shinobiDetails: shinobiDetails,
  Shinobi: Shinobi,
};
