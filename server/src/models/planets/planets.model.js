const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");
const { getAllLaunches } = require("../launches/launches.model.js");
const planets = require("./planets.mongo.js");

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}
function loadPlanetData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", (data) => {
        if (isHabitablePlanet(data)) {
          savePlanet(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        const count = await getAllPlanets();
        console.log(`${count.length} habitable planets found!`);
        resolve();
      });
  });
}

async function getAllPlanets() {
  return await planets.find(
    {
      // kepler_name: "Kepler-442 b",
    },
    {}
  );
}
async function savePlanet(data) {
  try {
    await planets.updateOne(
      {
        kepler_name: data.kepler_name,
      },
      {
        //if  exist will update with this obj
        kepler_name: data.kepler_name,
      },
      {
        // if not exist will add new insert record
        upsert: true,
      }
    );
  } catch (err) {
    console.error("can not save planet", err);
  }
}

module.exports = {
  getAllPlanets,
  loadPlanetData,
};
