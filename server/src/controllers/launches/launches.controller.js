const {
  getAllLaunches,
  addNewLaunch,
  abortLaunchById,
  hasExistingLaunch,
} = require("../../models/launches/launches.model");
const { getPagination } = require("../../services/pagenations");

async function httpGetAllLaunches(req, res) {
  const { limit, skip } = getPagination(req.query);
  const launches = await getAllLaunches(limit, skip);
  return res.status(200).json(Array.from(launches));
  // return res.status(200).json(await getAllLaunches());
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;

  if (!launch.target) {
    return res.status(400).json({
      error: "Missing target field",
    });
  }
  if (!launch.mission) {
    return res.status(400).json({
      error: "mission field required",
    });
  }
  if (!launch.rocket) {
    return res.status(400).json({
      error: "rocket field required",
    });
  }
  if (!launch.launchDate) {
    return res.status(400).json({
      error: "Missing launchDate  field",
    });
  }

  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "invalid launch date",
    });
  }
  const newLaunch = await addNewLaunch(launch);

  return res.status(201).json(newLaunch);
}
async function httpAbortLaunchById(req, res) {
  const id = +req.params.id;
  const ishasExistingLaunch = await hasExistingLaunch(id);
  if (!ishasExistingLaunch) {
    return res.status(404).json({
      error: "launch does not found",
    });
  } else {
    const aborted = await abortLaunchById(id);
    if (aborted.modifiedCount == 1 && aborted.matchedCount == 1) {
      return res.status(200).json({
        message: true,
        data: aborted,
      });
    } else {
      return res.status(400).json({
        message: "can not delete this launch",
      });
    }
  }
}
module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunchById,
};
