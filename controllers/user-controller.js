const knex = require("knex")(require("../knexfile").development);
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const signup = (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(
    password,
    Number(process.env.SALT_ROUNDS)
  );
  knex("users")
    .where({ username: username.toLowerCase() })
    .then((userExisting) => {
      if (userExisting.length) {
        return res.status(500).send("Error signing up user");
      } else {
        knex("users")
          .insert({
            username: username.toLowerCase(),
            password: hashedPassword,
          })
          .then((result) => {
            return knex("users").where({ id: result[0] });
          })
          .then((createdUser) => {
            res.status(201).json(createdUser);
          })
          .catch((err) => {
            res.status(500).send("Error signing up user");
          });
      }
    })
    .catch((err) => {
      res.status(500).send("Error signing up user");
    });
};

const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Login requires username and password",
    });
  }

  // if match => send the token (jwt.sign ({ id }))
  knex("users")
    .where({ username: username.toLowerCase() })
    .then((usersFound) => {
      if (usersFound.length === 0) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      const user = usersFound[0];

      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
        expiresIn: 60 * 60 * 24,
      });

      res.json({ token });
    });
};

const profile = (req, res, next) => {
  // Middleware function
  const { authorization } = req.headers;

  // Format: 'Bearer eyJhbG...ocLIs'
  const token = authorization.slice("Bearer ".length);

  // Verify the token
  jwt.verify(token, process.env.SECRET_KEY, (err, payload) => {
    if (err) {
      // Token verification failed: forbidden
      return res.status(401).json({ error: "failed" });
    } else {
      // Token verification succeeded: allow access
      // Make the token payload available to following handlers
      req.payload = payload;
      next();
    }
  });
};

const retrieveUserDetails = (req, res) => {
  const userId = req.payload.userId;
  knex("users")
    .select(
      "users.username",
      "game_matches.game_id",
      "game_matches.game_name",
      "game_matches.game_genre",
      "game_matches.game_released",
      "game_matches.game_slug"
    )
    .leftJoin("game_matches", "users.id", "game_matches.user_id")
    .where("users.id", userId)
    .then((data) => {
      // Create an array of objects containing game IDs and titles
      const games = data.map((item) => {
        return {
          id: item.game_id,
          name: item.game_name,
          genre: item.game_genre,
          released: item.game_released,
          slug: item.game_slug,
        };
      });

      // Extract the unique username (since it's the same for all rows)
      const username = data.length > 0 ? data[0].username : null;

      const userDetails = {
        userId: userId,
        username: username,
        games: games,
      };

      return res.status(200).json(userDetails);
    })
    .catch((err) => {
      res.status(400).send(`Error retrieving user details: ${err}`);
    });
};

const add = (req, res) => {
  const { user_id, game_id, game_name, game_genre, game_released, game_slug } =
    req.body;

  knex("game_matches")
    .where({ user_id, game_id })
    .then((matches) => {
      if (matches.length > 0) {
        return res.status(400).json({ message: "Game already on list" });
      } else {
        return knex("game_matches").insert({
          user_id,
          game_id,
          game_name,
          game_genre,
          game_released,
          game_slug,
        });
      }
    })
    .then((result) => {
      if (result) {
        return knex("game_matches").where({ id: result[0] });
      } else {
        throw new Error("Unable to add game to list");
      }
    })
    .then((createdMatch) => {
      res.status(201).json(createdMatch);
    })
    .catch((error) => {
      res.status(500).json({
        message: "Unable to add game to list",
      });
    });
};

const remove = (req, res) => {
  const { gameid, userid } = req.params;

  knex("game_matches")
    .where({ user_id: userid, game_id: gameid })
    .del()
    .then((deletedRows) => {
      if (deletedRows > 0) {
        res.status(200).json({ message: "Row deleted successfully" });
      } else {
        throw new Error("Row not found");
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Unable to delete row",
      });
    });
};

module.exports = {
  signup,
  login,
  profile,
  retrieveUserDetails,
  add,
  remove,
};
