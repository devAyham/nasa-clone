const mongoose = require("mongoose");

const MONGO_URL = `mongodb+srv://ayhmhamame14:35318165@nasa-api-cluster-1.s921z9x.mongodb.net/nasaDB?retryWrites=true&w=majority`;

mongoose.connection.once("open", () => {
  console.log("mongoDB connection ready");
});

mongoose.connection.on("error", (err) => {
  console.error(err);
});

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

async function mongoDisConnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisConnect, 
};
