const express = require("express")
const router = express.Router()
const { Users, Directors, WatchedDirectors } = require("../models")
const { validateToken } = require("../middlewares/AuthMiddleware")

/* GET: Fetch all directors whose films users have liked */
router.get("/", validateToken, async (req, res) => {
  try {
    const jwtUserId = req.user.id //UserId in signed JWT
    const sortBy = req.query.sortBy || "name"
    const sortDirection = req.query.sortDirection || "desc"
    const sortCommand = `${sortBy}_${sortDirection}`
    // const numStars = req.query.numStars

    let order
    switch (sortCommand) {
      // Sorting by association model attribute
      case "name_desc":
        order = [[{ model: Directors, as: "watchedDirectors" }, "name", "ASC"]]
        break
      case "name_asc":
        order = [[{ model: Directors, as: "watchedDirectors" }, "name", "DESC"]]
        break

      // Sorting by junction table attribute
      case "highest_star_desc":
        order = [
          [
            { model: Directors, as: "watchedDirectors" },
            WatchedDirectors,
            "highest_star",
            "DESC",
          ],
        ]
        break
      case "highest_star_asc":
        order = [
          [
            { model: Directors, as: "watchedDirectors" },
            WatchedDirectors,
            "highest_star",
            "ASC",
          ],
        ]
        break
      case "score_desc":
        order = [
          [
            { model: Directors, as: "watchedDirectors" },
            WatchedDirectors,
            "score",
            "DESC",
          ],
        ]
        break
      case "score_asc":
        order = [
          [
            { model: Directors, as: "watchedDirectors" },
            WatchedDirectors,
            "score",
            "ASC",
          ],
        ]
        break
    }

    const userWithWatchedDirectors = await Users.findByPk(jwtUserId, {
      include: [
        {
          model: Directors,
          as: "watchedDirectors",
          attributes: ["id", "name", "profile_path"],
          through: {
            attributes: [
              "num_watched_films",
              "num_starred_films",
              "num_stars_total",
              "highest_star",
              "avg_rating",
              "score",
            ],
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
    return res.status(500).json({ error: "Error Fetching All Directors Info" })
  }
})

router.get("/:tmdbId", validateToken, async (req, res) => {
  try {
    const tmdbId = req.params.tmdbId //Director's tmdbId used in URL
    const jwtUserId = req.user.id //UserId in signed JWT

    /* Find Director instance */
    const director = await Directors.findOne({ where: { id: tmdbId } })
    /* If director not already in app's db, User couldn't have watched films by them*/
    if (!director) {
      return res
        .status(200)
        .json({ watched: 0, starred: 0, highest_star: 0, score: 0 })
    }

    /* Find User instance */
    const user = await Users.findByPk(jwtUserId)
    if (!user) {
      return res.status(404).json({ error: "User Not Found" })
    }

    const watchedDirector = await WatchedDirectors.findOne({
      where: {
        directorId: tmdbId,
        userId: jwtUserId,
      },
    })
    if (!watchedDirector) {
      return res
        .status(200)
        .json({ watched: 0, starred: 0, highest_star: 0, score: 0 })
    }
    return res.status(200).json({
      watched: watchedDirector.num_watched_films,
      starred: watchedDirector.num_starred_films,
      highest_star: watchedDirector.highest_star,
      score: watchedDirector.score,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Error Fetching Director Info" })
  }
})

module.exports = router
