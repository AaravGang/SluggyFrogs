const jutsusFile = require("./Jutsus");
const newJutsu = jutsusFile.newJutsu;
const jutsusJson = require("./Jutsus.json");
const dotenv = require("dotenv");
dotenv.config();
const prefix = process.env.PREFIX;

const boostForChakraSync = 20;
const rankOrder = ["genin", "chunin", "jonin", "kage"];

class Shinobi {
  constructor(
    { name, commandName, chakra, health, jutsuNames, fees, chakraTypes, rank },
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
    this.rank = rank;
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
      rank: this.rank,
    };
  }
  getDetailsForEmbed() {
    return `Name: ${this.name}\n\nCommand Name: ${this.commandName}\n\nRank: ${this.rank}\n\nChakra:${this.chakra}\n\nHealth:${this.health}\n\nJutsus: ${this.jutsuNames}\n\nChakra Types: ${this.chakraTypes}\n\nFees: ${this.fees}`;
  }
}

const shinobiDetails = require("./Shinobis.json");

const shinobis = {};
for ([key, value] of Object.entries(shinobiDetails)) {
  shinobis[key] = new Shinobi(value);
}

const rankWise = Object.entries(shinobis).sort(
  ([, s1], [, s2]) => rankOrder.indexOf(s1.rank) - rankOrder.indexOf(s2.rank)
);
const rankWiseShinobis = {};
for (let rank of rankOrder) {
  rankWiseShinobis[rank] = rankWise
    .filter(([shinobiName, details]) => details.rank == rank)
    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
}

async function getShinobiDetails(client, msg, params = null) {
  const shinobisListEmbed = {
    color: "BLUE",
    title: "Choose your shinobi!",
    fields: [],
  };

  if (!params || !params.length) {
    for (let [rankName, rankShinobis] of Object.entries(rankWiseShinobis)) {
      shinobisListEmbed.fields.push({
        name: `⚔️ **${rankName.toUpperCase()}** ⚔️`,
        value: "\u200b",
      });

      for (let [shinobiKey, shinobi] of Object.entries(rankShinobis)) {
        shinobisListEmbed.fields.push({
          name: shinobi.name,
          value: `Use \`${prefix} hire ${
            shinobi.commandName
          }\n\`[hover for details](${
            msg.url
          } "${shinobi.getDetailsForEmbed()}")`,
          inline: true,
        });
      }
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
  rankOrder: rankOrder,
};
