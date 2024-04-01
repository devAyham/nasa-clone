const https = require("https");
const app = require("./app");
const fs = require("fs");
const path = require("path");
const { loadPlanetData } = require("./models/planets/planets.model");
const { mongoConnect } = require("./services/mongo");
const { loadLaunchesData } = require("./models/launches/launches.model");
const PORT = process.env.PORT || 8001;
const server = https.createServer(
  {
    key: fs.readFileSync(path.join(__dirname, "key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "cert.pem")),
  },
  app
);

async function startServer() {
  await mongoConnect();
  await loadPlanetData();
  await loadLaunchesData();

  server.listen(PORT, () => {
    console.log(`Listing on port ${PORT}`);
  });
} 

startServer();
