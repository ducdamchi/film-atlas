const express = require("express")
const router = express.Router()
const { Users } = require("../models")
const { Directors } = require("../models")

const { Films } = require("../models")
const { Stars } = require("../models")
const { validateToken } = require("../middlewares/AuthMiddleware")

/* GET: Fetch all directors whose films users have liked */
router.get("/", validateToken, async (req, res) => {
  try {
    const jwtUserId = req.user.id //UserId in signed JWT
    const sortDirection = req.query.sortDirection
    const numStars = req.query.numStars

    let order
    switch (sortDirection) {
      case "desc":
        order = [["watchedDirectors", "name", "DESC"]]
        break
      case "asc":
        order = [["watchedDirectors", "name", "ASC"]]
        break
    }

    const userWithWatchedDirectors = await Users.findByPk(jwtUserId, {
      include: [
        {
          model: Directors,
          as: "watchedDirectors",
          attributes: ["id", "name", "profile_path"],
          through: {
            attributes: ["num_watched_films"],
          },
        },
      ],
      order: order,
    })

    if (!userWithWatchedDirectors) {
      return res.status(404).json({ error: "User Not Found" })
    } else {
      return res.status(200).json(userWithWatchedDirectors.watchedDirectors)
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Error Fetching Content" })
  }
})

module.exports = router
