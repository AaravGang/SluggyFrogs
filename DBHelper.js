const models = require("./models");
const serverModel = models.serverModel;
const jutsuModel = models.jutsuModel;
const chakraTypesModel = models.chakraTypesModel;
const dotenv = require("dotenv");
dotenv.config();

const botToken = process.env.BOT_TOKEN;
const prefix = process.env.PREFIX.toLowerCase();
const startWealth = parseInt(process.env.START_WEALTH);

async function onGuildJoin(guild) {
  try {
    let guildData = {
      serverID: guild.id,
      members: {},
    };

    guild.members.cache.forEach((member) => {
      if (!member.user.bot) {
        guildData.members[member.id] = {
          id: member.id,
          userName: member.user.username,
          avatar: member.user.avatar,
          bal: startWealth,
          inventory: {},
        };
      }
    });

    return await serverModel.create(guildData);
  } catch (err) {
    console.log(err);
  }
}

async function onGuildLeave(guild) {
  try {
    return await serverModel.deleteOne({ serverID: guild.id });
  } catch (err) {
    console.log(err);
  }
}

async function onMemberJoin(member) {
  const guild = member.guild;
  try {
    var server = await serverModel.findOne({ serverID: guild.id });
    if (server.members[member.id]) {
      return true;
    }
    server.members[member.id] = {
      id: member.id,
      userName: member.user.username,
      avatar: member.user.avatar,
      bal: startWealth,
      inventory: {},
    };
    return await serverModel.findOneAndUpdate(
      { serverID: guild.id },
      {
        $set: {
          members: server.members,
        },
      }
    );
  } catch (err) {
    console.log(err);
  }
}

async function updateNarutoGameStats(guild, newNarutoGameStats) {
  try {
    return await serverModel.findOneAndUpdate(
      { serverID: guild.id },
      {
        $set: {
          narutoGame: newNarutoGameStats,
        },
      }
    );
  } catch (err) {
    console.log(err);
  }
}

async function getNarutoGameStats(guild) {
  try {
    return (await serverModel.findOne({ serverID: guild.id })).narutoGame;
  } catch (err) {
    console.log(err);
  }
}

async function updateMemberBal(guild, memberId, wealthInc) {
  const updateField = {};
  updateField[`members.${memberId}.bal`] = wealthInc;
  try {
    return await serverModel.findOneAndUpdate(
      { serverID: guild.id },
      { $inc: updateField }
    );
  } catch (err) {
    console.log(err);
  }
}

async function updateMembersBal(guild, payload) {
  const updateField = {};
  for ([key, value] of Object.entries(payload)) {
    updateField[`members.${key}.bal`] = value;
  }
  try {
    return await serverModel.findOneAndUpdate(
      { serverID: guild.id },
      { $inc: updateField }
    );
  } catch (err) {
    console.log(err);
  }
}

async function getMember(guild, memberId) {
  try {
    let serverDetails = await serverModel.findOne({ serverID: guild.id });
    return serverDetails.members[memberId];
  } catch (err) {
    console.log("ERROR WHILE GETTING MEMBER:", err);
    return false;
  }
}

async function getServerStats(guild) {
  try {
    return await serverModel.findOne({ serverID: guild.id });
  } catch (err) {
    console.log("ERROR WHILE GETTING SERVER STATS:", err);
    return false;
  }
}

async function updateToInventory(guild, memberId, itemName, number) {
  let updateField = {};
  updateField[`members.${memberId}.inventory.${itemName}`] = number;
  updateField = { $set: updateField };

  try {
    return await serverModel.findOneAndUpdate(
      { serverID: guild.id },
      updateField
    );
  } catch (err) {
    console.log(err);
  }
}

async function getInventory(guild, memberId) {
  try {
    return (await serverModel.findOne({ serverID: guild.id })).members[memberId]
      .inventory;
  } catch (err) {
    console.log(err);
  }
}

async function addJutsu(jutsu) {
  try {
    let jutsu = await jutsuModel.findOne({ commandName: jutsu.commandName });
    if (jutsu && Object(jutsu).keys().length) {
      console.log("jutsu exists!");
      return;
    }
    let updateField = {};
    updateField[commandName] = jutsu;
    let createStatus = await jutsuModel.create(jutsu);
  } catch (err) {
    console.log(err);
  }
}

async function updateMemberPrevShinobi(guild, memberId, newShinobi) {
  const updateField = {};
  updateField[`members.${memberId}.prevShinobi`] = newShinobi;
  try {
    return await serverModel.findOneAndUpdate(
      { serverID: guild.id },
      { $set: updateField }
    );
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  onGuildJoin: onGuildJoin,
  onGuildLeave: onGuildLeave,
  updateNarutoGameStats: updateNarutoGameStats,
  getNarutoGameStats: getNarutoGameStats,
  updateMemberBal: updateMemberBal,
  onMemberJoin: onMemberJoin,
  getMember: getMember,
  getServerStats: getServerStats,
  updateMembersBal: updateMembersBal,
  updateToInventory: updateToInventory,
  getInventory: getInventory,
  addJutsu: addJutsu,
  updateMemberPrevShinobi: updateMemberPrevShinobi,
};
