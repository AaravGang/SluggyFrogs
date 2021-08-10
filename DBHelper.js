const models = require("./models");
const serverModel = models.serverModel;
const imageModel = models.imageModel;

const dotenv = require("dotenv");
dotenv.config();
const fetch = require("node-fetch");

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

async function addImage(name, url, avatarSize, avatarX, avatarY) {
  try {
    return await imageModel.create({
      name: name,
      url: url,
      avatarSize: avatarSize,
      avatarX: avatarX,
      avatarY: avatarY,
    });
  } catch (err) {
    console.log(err);
  }
}

async function getImages() {
  return await imageModel.find({});
}

async function getImage(name) {
  return await imageModel.findOne({ name: name });
}

async function updateImage(name, data) {
  return await imageModel.findOneAndUpdate({ name: name }, { $set: data });
}

async function deleteImage(name) {
  return await imageModel.findOneAndDelete({ name: name });
}

async function updatePairioGameStats(guild, newGameStats) {
  try {
    return await serverModel.findOneAndUpdate(
      { serverID: guild.id },
      {
        $set: {
          pairioGame: newGameStats,
        },
      }
    );
  } catch (err) {
    console.log(err);
  }
}

async function getPairioGameStats(guild) {
  return await serverModel.findOne({ serverID: guild.id });
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
  updateMemberPrevShinobi: updateMemberPrevShinobi,
  addImage: addImage,
  getImages: getImages,
  getImage: getImage,
  updateImage: updateImage,
  deleteImage: deleteImage,
  updatePairioGameStats: updatePairioGameStats,
  getPairioGameStats: getPairioGameStats,
};
