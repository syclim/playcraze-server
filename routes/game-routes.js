const router = require("express").Router();
const gameController = require("../controllers/game-controller");

router.route("/:filter").get(gameController.index);

module.exports = router;
