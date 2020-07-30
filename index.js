require("dotenv").config();

// Telegram
const { Telegraf } = require("telegraf");

// Google Sheets
const { JWT } = require("google-auth-library");
const keys = require("./credentials.json");
const { google } = require("googleapis");

// Google Sheets
const client = new JWT({
   email: keys.client_email,
   key: keys.private_key,
   scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});
const sheets = google.sheets("v4");
let spreadsheetId = "1U5fakD2kqni6p9W-qHDGdOJRliUZMpgjgoNdY4_uU9o";

// Telegram
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.on("text", (ctx) => {
   sheets.spreadsheets.values
      .get({
         auth: client,
         spreadsheetId,
         range: "Class Data",
      })
      .then((res) => {
         let data = res.data.values;
         let query = ctx.message.text;

         ctx.reply(getCell(data, query) || "Нет в наличии");
      })
      .catch((err) => {
         console.log(err);
      });
});

const getCell = (data, query) => {
   const rows = data.length;
   const labels = data[0];

   for (let row = 1; row < rows; row++) {
      if (data[row][0].toLowerCase() === query.toLowerCase()) {
         let response = "";
         for (let label = 0; label < labels.length; label++) {
            response += `${labels[label]}: ${data[row][label]}\n`;
         }
         return response;
      }
   }

   return null;
};

bot.launch();
