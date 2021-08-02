const dotenv = require("dotenv");
dotenv.config();
const prefix = process.env.PREFIX;

const playedFirstBoost = 1 / 4;

const jutsuTypes = [
  "fire",
  "water",
  "wind",
  "lightning",
  "earth",
  "normal",
  "wood",
  "poison",
  "spacetime",
  "sealing",
];

const jutsuTypeDominance = {
  water: ["fire", "lava", "normal"],
  fire: ["wind", "normal"],
  wind: ["lightning", "normal"],
  earth: ["water", "lightning", "normal"],
  lightning: ["water", "normal"],
  normal: jutsuTypes,
  lava: ["normal", "wind"],
  healing: [],
  genjutsu: [],
  wood: ["wind", "earth", "water", "normal"],
  poison: ["fire", "water", "wind", "lightning", "normal", "wood"],
  spacetime: [],
  sealing: [],
};
const powerIncrease = 20;

const jutsusJson = require("./Jutsus.json");

class Jutsu {
  constructor(props, powerBoost = 0) {
    this.name = props.name;
    this.power = props.power + powerBoost;
    this.chakra = props.chakra;
    this.type = props.type;
    this.commandName = props.commandName;
    this.boostOver = jutsuTypeDominance[this.type];
    this.description = props.description;
    this.jutsuBranches = props.jutsuBranches;
    this.usageLeft = props.usageLeft;
  }
  use(currentPlayer, opponent, playedFirst = false) {
    this.usageLeft -= 1;
    if (
      opponent.currentJutsu &&
      (opponent.currentJutsu.jutsuBranches.includes("genjutsu") ||
        opponent.currentJutsu.jutsuBranches.includes("sealing"))
    ) {
      return [currentPlayer, opponent];
    }

    let powerInc = 0;
    if (playedFirst) powerInc += playedFirstBoost * this.power;

    if (this.jutsuBranches.includes("attack")) {
      let powerDec = 0;
      if (
        opponent.currentJutsu &&
        opponent.currentJutsu.jutsuBranches.includes("defense")
      ) {
        powerDec +=
          opponent.currentJutsu.power +
            (playedFirst ? 0 : playedFirstBoost * opponent.currentJutsu.power) <
          this.power
            ? opponent.currentJutsu.power +
              (playedFirst ? 0 : playedFirstBoost * opponent.currentJutsu.power)
            : this.power;
      }
      opponent.shinobi.health -= this.power - powerDec + powerInc;
      if (
        opponent.currentJutsu &&
        this.boostOver.includes(opponent.currentJutsu.type)
      ) {
        opponent.shinobi.health -= powerIncrease;
      }
      return [currentPlayer, opponent];
    }
    if (this.jutsuBranches.includes("healing")) {
      currentPlayer.shinobi.health += this.power + powerInc;
      return [currentPlayer, opponent];
    }
  }

  getDescription() {
    return `Command Name: \`${this.commandName}\`\n\nName: ${
      this.name
    }\n\nPower: ${this.power}\n\nChakra Required: ${
      this.chakra
    }\n\nJutsu Branches: ${this.jutsuBranches.toString()}\n\nType: ${
      this.type
    }\n\nUsage Left: ${
      this.usageLeft
    } times\n\nDominant Over: ${this.boostOver.toString()}\n\nDescription: ${
      this.description
    }`;
  }

  getDescriptionObject() {
    return {
      name: this.name,
      power: this.power,
      chakraRequired: this.chakra,
      type: this.type,
      usageLeft: this.usageLeft,
      dominates: this.boostOver,
      description: this.description,
      jutsuBranches: this.jutsuBranches,
    };
  }
}
const jutsus = {};
for ([key, value] of Object.entries(jutsusJson)) {
  jutsus[key] = new Jutsu(value);
}

function getJutsuDetails(client, msg, params = []) {
  let jutsuEmbed = {
    color: "PURPLE",
    title: "Jutsus",
    description: `\`${prefix} jutsu <jutsu_command_name>\` ,to get details`,
    fields: [],
  };
  if (!params.length) {
    for (let [jutsuKey, jutsu] of Object.entries(jutsus)) {
      jutsuEmbed.fields.push({
        name: jutsu.name,
        value: jutsu.commandName,
        // value: `\`${prefix} jutsu ${jutsu.commandName}\` to get details | \`use ${jutsu.commandName}\` to use it`,
        inline: true,
      });
    }
  }
  // console.log(new Set(params));
  for (let param of new Set(params)) {
    let jutsu = jutsus[param];
    if (jutsu) {
      jutsuEmbed.fields.push({
        name: jutsu.name,
        value: `\`use ${jutsu.commandName}\` | [hover for details](${
          msg.url
        } "${jutsu.getDescription()}")`,
      });
    }
  }

  msg.channel.send({ embed: jutsuEmbed });
}

module.exports = {
  name: "jutsu",
  aliases: ["jutsus"],
  description: `Get details of jutsus available!`,
  execute: getJutsuDetails,
  jutsus: jutsus,
  newJutsu: Jutsu,
};
