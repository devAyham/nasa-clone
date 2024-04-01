const express = require("express");
const planetsRouter = require("../planets/planets.router");
const launchesRouter = require("../launches/launches.router");

const v1Router = express.Router();

v1Router.use("/planets", planetsRouter);
v1Router.use("/launches", launchesRouter);

module.exports = v1Router;
