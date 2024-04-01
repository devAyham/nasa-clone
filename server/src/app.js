const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const v1Router = require("./routes/versions/v1Router");
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(morgan("short"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/v1", v1Router);
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;
 