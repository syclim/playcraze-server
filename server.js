const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT;

app.use(cors({ origin: 'https://playcraze.netlify.app'}));

const gameRoutes = require("./routes/game-routes");
const userRoutes = require("./routes/user-routes");

app.use(express.json());
app.use("/games", gameRoutes);
app.use("/user", userRoutes);

app.listen(PORT, () => {
  console.log(`running at http://localhost:${PORT}`);
});
