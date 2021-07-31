const fetch = require("node-fetch");
const dotenv = require("dotenv");
dotenv.config();
const TENOR_KEY = process.env.TENOR_KEY;

//get a gif for jutsu
const tenorBaseUrl = `https://g.tenor.com/v1/search?key=${TENOR_KEY}&`;
async function getGif(queryString) {
  try {
    var data = await (
      await fetch(
        tenorBaseUrl + `q=${queryString.replace(/ /g, "%20")}` + `&limit=${5}`
      )
    ).json();
    let randomInd = Math.floor(Math.random(0, 1) * data.results.length);
    if (data.results[randomInd].url) {
      return data.results[randomInd].media[0].gif.url;
    } else {
      return "https://media.tenor.com/images/a8230c2b356094c6528e234a374854c1/tenor.gif";
    }
  } catch (err) {
    console.error("Error in getGif:", err);
    return "https://media.tenor.com/images/a8230c2b356094c6528e234a374854c1/tenor.gif";
  }
}

module.exports = {
  getGif: getGif,
};
