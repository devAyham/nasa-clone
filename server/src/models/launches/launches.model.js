const axios = require("axios");
const launchesDB = require("./launches.mongo");
const planets = require("../planets/planets.mongo");
const SPACEX_URL = require("../../../config/SPACEX_URl");

const FIRST_FLIGHT_NUMBER = 100;

 async function populateLaunches() {
  console.log("downloading launches data");
  const response = await axios.post(`${SPACEX_URL}/launches/query`, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  const launchDocs = response.data.docs;
  launchDocs.forEach((launchDoc) => {
    const payloads = launchDoc.payloads;
    const customers = payloads.flatMap((payload) => {
      return payload.customers;
    });
    const launch = {
      flightNumber: launchDoc.flight_number,
      mission: launchDoc.name,
      rocket: launchDoc.rocket.name,
      launchDate: launchDoc.date_utc,
      upcoming: launchDoc.upcoming,
      success: launchDoc.success,
      customers,
    };
    console.log(launch);
    saveLaunch(launch);
  });
}

async function loadLaunchesData() {
  const firstLaunch = await findlaunch({
    flightNumber: 1,
  });
  if (firstLaunch) {
    console.log("Launches already loaded");
  } else {
    await populateLaunches();
  }
}
async function getAllLaunches(limit, skip) {
  return await launchesDB
    .find(
      {},
      {
        _id: 0,
        __v: 0,
      }
    )
    .sort({
      flightNumber: 1,
    })
    .limit(limit)
    .skip(skip);
}
async function addNewLaunch(launch) {
  const planet = await planets.findOne({
    kepler_name: launch.target,
  });

  if (!planet) {
    throw new Error("No matching palnet exist");
  }
  const flightNumber = (await getlatestFlightNumber()) + 1;
  const newLaunch = {
    ...launch,
    success: true,
    upcoming: true,
    customers: ["ZTM", "NASA"],
    flightNumber,
  };

  await saveLaunch(newLaunch);
  return newLaunch;
}
async function getlatestFlightNumber() {
  const latesetLaunch = await launchesDB.findOne().sort("-flightNumber");

  if (!latesetLaunch) {
    return FIRST_FLIGHT_NUMBER;
  }
  return latesetLaunch.flightNumber;
}
async function saveLaunch(launch) {
  /* if the launch with the given flight number is already exist
   it will update it with the given launch obj else it will create a new launch */
  // await launchesDB.updateOne(
  //we use this methhod for not showin the $setOnInsert prop in out response
  await launchesDB.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}
async function findlaunch(filter) {
  return await launchesDB.findOne(filter);
}
async function hasExistingLaunch(id) {
  return await findlaunch({
    flightNumber: id,
  });
}
async function abortLaunchById(id) {
  const abortedlaunch = await hasExistingLaunch(id);
  if (!abortedlaunch) {
    return new Error("no launch with the same flightNumber");
  }
  const newabortedlaunch = await launchesDB.updateOne(
    {
      flightNumber: id,
    },
    {
      success: false,
      upcoming: false,
    }
  );
  return newabortedlaunch;
  // const abortedLaunch = launches.get(id);
  // abortedLaunch.success = false;
  // abortedLaunch.upcoming = false;
  // return abortedLaunch;
}

module.exports = {
  loadLaunchesData,
  getAllLaunches,
  addNewLaunch,
  hasExistingLaunch,
  abortLaunchById,
};
