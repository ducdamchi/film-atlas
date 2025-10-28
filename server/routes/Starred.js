const express = require("express")
const router = express.Router()
const { Users } = require("../models")
const { Films } = require("../models")
const { Stars } = require("../models")
const { WatchedDirectors } = require("../models")
const { validateToken } = require("../middlewares/AuthMiddleware")

/* GET: Fetch all films starred by a user */
router.get("/", validateToken, async (req, res) => {
  try {
    const jwtUserId = req.user.id //UserId in signed JWT
    const numStars = req.query.numStars
    // console.log(numStars)
    const sortBy = req.query.sortBy || "added_date"
    const sortDirection = req.query.sortDirection || "desc"
    const sortCommand = `${sortBy}_${sortDirection}`
    let order
    switch (sortCommand) {
      case "added_date_desc":
        order = [["starredFilms", "createdAt", "DESC"]]
        break
      case "added_date_asc":
        order = [["starredFilms", "createdAt", "ASC"]]
        break
      case "released_date_desc":
        order = [["starredFilms", "release_date", "DESC"]]
        break
      case "released_date_asc":
        order = [["starredFilms", "release_date", "ASC"]]
        break
    }

    const userWithStarredFilms = await Users.findByPk(jwtUserId, {
      include: [
        {
          model: Films,
          as: "starredFilms",
          attributes: [
            "id",
            "title",
            "runtime",
            "directors",
            "directorNamesForSorting",
            "poster_path",
            "backdrop_path",
            "origin_country",
            "release_date",
          ],
          through: {
            attributes: [["createdAt", "addedAt"], "stars"],
            ...(numStars > 0 && {
              where: {
                stars: numStars,
              },
            }),
          },
        },
      ],
      order: order,
    })

    if (!userWithStarredFilms) {
      return res.status(404).json({ error: "User Not Found" })
    } else {
      return res.status(200).json(userWithStarredFilms.starredFilms)
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Error Fetching Content" })
  }
})

/* GET: Check if a film is starred by a user */
router.get("/:tmdbId", validateToken, async (req, res) => {
  try {
    const tmdbId = req.params.tmdbId //tmdbId used in URL
    const jwtUserId = req.user.id //UserId in signed JWT

    /* Find Film instance */
    const film = await Films.findOne({ where: { id: tmdbId } })
    /* If Film not already in app's db, User couldn't have liked it */
    if (!film) {
      return res.status(200).json({ starred: false })
    }

    /* Find User instance */
    const user = await Users.findByPk(jwtUserId)
    if (!user) {
      return res.status(404).json({ error: "User Not Found" })
    }

    const starredFilm = await Stars.findOne({
      where: {
        userId: user.id,
        filmId: film.id,
      },
    })

    if (starredFilm) {
      return res.status(200).json({ starred: true, stars: starredFilm.stars })
    } else {
      return res.status(200).json({ starred: false })
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Error Checking Like Status" })
  }
})

/* POST: Add a film starred by User to junction table */
router.post("/", validateToken, async (req, res) => {
  try {
    const jwtUserId = req.user.id //UserId in signed JWT
    const starData = req.body
    const user = await Users.findByPk(jwtUserId)

    if (!user) {
      return res.status(404).json({ error: "User Not Found" })
    }

    /* Either find existing film or create new film */
    const [film, created] = await Films.findOrCreate({
      where: {
        id: starData.tmdbId,
      },
      defaults: {
        id: starData.tmdbId,
        title: starData.title,
        runtime: starData.runtime,
        directors: starData.directors,
        directorNamesForSorting: starData.directorNamesForSorting,
        poster_path: starData.poster_path,
        backdrop_path: starData.backdrop_path,
        origin_country: starData.origin_country,
        release_date: starData.release_date,
      },
    })

    await user.addStarredFilm(film, {
      through: { stars: starData.stars },
    })

    /* Now, handle the Director model and WatchedDirector junction table */
    for (const director of starData.directors) {
      /* The director(s) should already exist at this point because whenever user rates a film that has not been liked, the client will call the POST like API first, which in turns create a director entry if the director is not yet cached in DB. Simply find the entry in watchedDirectors junction table to set the correct num_stars_total*/

      const junctionEntry = await WatchedDirectors.findOne({
        where: {
          directorId: director.tmdbId,
          userId: jwtUserId,
        },
      })
      if (!junctionEntry) {
        return res.status(404).json({
          error: `Cannot find director ${director.name}, id: ${director.id} in watchedDirector junction table.`,
        })
      }
      junctionEntry.num_stars_total += starData.stars
      await junctionEntry.save()
    }

    return res.status(200).json("Success")
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Error Adding Entry" })
  }
})

/* PUT: Modify the rating of a film that's already rated */
router.put("/", validateToken, async (req, res) => {
  try {
    const jwtUserId = req.user.id //UserId in signed JWT
    const starData = req.body

    /* Find Film instance */
    const film = await Films.findOne({ where: { id: starData.tmdbId } })
    if (!film) {
      return res.status(404).json({ error: "Film Not Found" })
    }

    /* Find User instance */
    const user = await Users.findByPk(jwtUserId)
    if (!user) {
      return res.status(404).json({ error: "User Not Found" })
    }

    /* Find Starred Film instance */
    const starredFilm = await Stars.findOne({
      where: {
        userId: user.id,
        filmId: film.id,
      },
    })
    if (!starredFilm) {
      return res.status(404).json("Entry Not Found")
    }

    /* Now, handle the Director model and WatchedDirector junction table */
    for (const director of starData.directors) {
      /* The director(s) should already exist at this point because the film has already been rated. Simply find the entry in watchedDirectors junction table to update the correct num_stars_total*/
      const junctionEntry = await WatchedDirectors.findOne({
        where: {
          directorId: director.tmdbId,
          userId: jwtUserId,
        },
      })
      if (!junctionEntry) {
        return res.status(404).json({
          error: `Cannot find director ${director.name}, id: ${director.tmdbId} in watchedDirector junction table.`,
        })
      }
      junctionEntry.num_stars_total -= starredFilm.stars
      junctionEntry.num_stars_total += starData.stars
      await junctionEntry.save()
    }

    starredFilm.stars = starData.stars
    await starredFilm.save()

    return res.status(200).json("Success")
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Error Adding Entry" })
  }
})

/* DELETE: Removed a film unstarred by User from junction table */
router.delete("/", validateToken, async (req, res) => {
  try {
    const jwtUserId = req.user.id //UserId in signed JWT
    const tmdbId = req.body.tmdbId

    /* Find Film instance */
    const film = await Films.findOne({ where: { id: tmdbId } })
    if (!film) {
      return res.status(404).json({ error: "Film Not Found" })
    }

    /* Find User instance */
    const user = await Users.findByPk(jwtUserId)
    if (!user) {
      return res.status(404).json({ error: "User Not Found" })
    }

    const starredFilm = await Stars.findOne({
      where: {
        userId: user.id,
        filmId: film.id,
      },
    })

    if (!starredFilm) {
      return res.status(404).json("Entry Not Found")
    }

    /* Locate each instance of watched director in junction table. Update the number of total stars that a user gave that director. */
    for (const director of film.directors) {
      const watchedDirector = await WatchedDirectors.findOne({
        where: {
          directorId: director.tmdbId,
          userId: jwtUserId,
        },
      })

      if (!watchedDirector) {
        return res.status(404).json({
          message: `Cannot find entry for director ${director.name}, id: ${director.tmdbId} in watchedDirector junction table.`,
        })
      }

      watchedDirector.num_stars_total -= starredFilm.stars
      await watchedDirector.save()
    }

    /* Important: only destroy the starredFilm entry after updating the total number of stars that a user gave a director. */
    await starredFilm.destroy()
    return res.status(200).json("Success")
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Error Removing Entry" })
  }
})
module.exports = router
