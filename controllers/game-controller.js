const axios = require("axios");
const API_KEY = "1524ceb6a1954c5285606736c4204de8";

const index = (req, res) => {
  const searchFilter = req.params.filter.split("&")[0]
    ? "&search=" + req.params.filter.split("&")[0]
    : "";
  const genreFilter = req.params.filter.split("&")[1]
    ? "&genres=" + req.params.filter.split("&")[1]
    : "";
  const platformFilter = req.params.filter.split("&")[2]
    ? "&platforms=" + req.params.filter.split("&")[2]
    : "";

  const filters = searchFilter + genreFilter + platformFilter;
  axios
    .get(`https://api.rawg.io/api/games?key=${API_KEY}${filters}`)
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
};

module.exports = {
  index,
};
