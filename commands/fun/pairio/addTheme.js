const dbHelper = require("../../../DBHelper");

const addPairioTheme = dbHelper.addPairioTheme;
const updatePairioTheme = dbHelper.updatePairioTheme;
const getPairioThemes = dbHelper.getPairioThemes;

const validLengths = [2, 8, 32];

module.exports = {
  name: "add-theme",
  aliases: ["update-theme", "at", "ut"],
  description: "Add or update a pairio theme!",
  execute: addTheme,
};

async function addTheme(client, msg, params, serverDetails) {
  let name = params[0];
  let words = params.slice(1);
  let valid = await validateParams(msg, name, words);
  if (!valid) return;
  if (valid.update) {
    await updatePairioTheme(name, { name: name, words: words });
    msg.reply("Successfully updated theme!");
    return;
  }
  await addPairioTheme({ name: name, words: words });
  msg.reply("Successfully added theme!");
}

async function validateParams(msg, name, words) {
  if (name && words) {
    if (!validLengths.includes(words.length)) {
      msg.reply(
        `The number of words can only be half of a perfect even square,i.e. one of these: [${validLengths}]`
      );
      return false;
    }
    if ((await getPairioThemes())[name]) {
      return { name: name, words: words, update: true };
    }
    return { name: name, words: words };
  }
  msg.reply("Did not receive <theme_name> or/and <words>");
  return false;
}
