const express = require("express")
const router = express.Router()
const { Users } = require("../models")
const { Films } = require("../models")
const { Directors } = require("../models")
const { WatchedDirectors } = require("../models")
const { validateToken } = require("../middlewares/AuthMiddleware")

/* GET: Fetch all films liked by a user */
router.get("/", validateToken, async (req, res) => {
  try {
    const jwtUserId = req.user.id //UserId in signed JWT
    const sortBy = req.query.sortBy || "added_date"
    const sortDirection = req.query.sortDirection || "desc"
    const sortCommand = `${sortBy}_${sortDirection}`
    let order
    switch (sortCommand) {
      case "added_date_desc":
        order = [["likedFilms", "createdAt", "DESC"]]
        break
      case "added_date_asc":
        order = [["likedFilms", "createdAt", "ASC"]]
        break
      case "released_date_desc":
        order = [["likedFilms", "release_date", "DESC"]]
        break
      case "released_date_asc":
        order = [["likedFilms", "release_date", "ASC"]]
        break
    }

    const userWithLikedFilms = await Users.findByPk(jwtUserId, {
      include: [
        {
          model: Films,
          as: "likedFilms",
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
            attributes: [["createdAt", "addedAt"]],
          },
        },
      ],
      order: order,
    })

    if (!userWithLikedFilms) {
      return res.status(404).json({ error: "User Not Found" })
    } else {
      return res.status(200).json(userWithLikedFilms.likedFilms)
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Error Fetching Content" })
  }
})

/* GET: Check if a film is liked by a user */
router.get("/:tmdbId", validateToken, async (req, res) => {
  try {
    const tmdbId = req.params.tmdbId //tmdbId used in URL
    const jwtUserId = req.user.id //UserId in signed JWT

    /* Find Film instance */
    const film = await Films.findOne({ where: { id: tmdbId } })
    /* If Film not already in app's db, User couldn't have liked it */
    if (!film) {
      return res.status(200).json({ liked: false })
    }

    /* Find User instance */
    const user = await Users.findByPk(jwtUserId)
    if (!user) {
      return res.status(404).json({ error: "User Not Found" })
    }

    const liked = await user.hasLikedFilm(film)
    return res.status(200).json({ liked: liked })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Error Checking Like Status" })
  }
})

/* POST: Handle when user Likes a film */
router.post("/", validateToken, async (req, res) => {
  try {
    const jwtUserId = req.user.id //UserId in signed JWT
    const likeData = req.body
    const user = await Users.findByPk(jwtUserId)

    if (!user) {
      return res.status(404).json({ error: "User Not Found" })
    }
    /* Either find existing film or create new film */
    const [film, created] = await Films.findOrCreate({
      where: {
        id: likeData.tmdbId,
      },
      defaults: {
        id: likeData.tmdbId,
        title: likeData.title,
        runtime: likeData.runtime,
        directors: likeData.directors,
        directorNamesForSorting: likeData.directorNamesForSorting,
        poster_path: likeData.poster_path,
        backdrop_path: likeData.backdrop_path,
        origin_country: likeData.origin_country,
        release_date: likeData.release_date,
      },
    })
    // add film to Liked junction table
    await user.addLikedFilm(film)

    /* Now, handle the Director model and WatchedDirector junction table */
    for (const director of likeData.directors) {
      /* Either find the director or create a new entry */
      const [entry, entryCreated] = await Directors.findOrCreate({
        where: {
          id: director.tmdbId,
        },
        defaults: {
          id: director.tmdbId,
          name: director.name,
          profile_path: director.profile_path,
        },
      })

      // If no previous record of director, it means this is the user's first watched film by the director. Set num_watched_films = 1.
      if (entryCreated) {
        await user.addWatchedDirector(entry, {
          through: { num_watched_films: 1 },
        })
      } else {
        // Otherwise, find or create an instance of User x Director in junction table and set the appropriate film count and number of stars that director has in total.
        const [junctionEntry, junctionEntryCreated] =
          await WatchedDirectors.findOrCreate({
            where: {
              directorId: entry.id,
              userId: jwtUserId,
            },
            defaults: {
              directorId: entry.id,
              userId: jwtUserId,
              num_watched_films: 1,
              num_stars_total: 0,
            },
          })
        if (!junctionEntryCreated) {
          junctionEntry.num_watched_films += 1
          await junctionEntry.save()
        }
      }
    }

    return res.status(200).json("Success")
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Error Adding Entry" })
  }
})

/* DELETE: Removed a film unliked by User from junction table */
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

    await user.removeLikedFilm(film)

    /* Locate each instance of watched director in junction table */
    for (const director of film.directors) {
      const watchedDirector = await WatchedDirectors.findOne({
        where: {
          directorId: director.tmdbId,
          userId: jwtUserId,
        },
      })
      if (!watchedDirector) {
        return res.status(404).json({
          error: `Cannot find entry for director ${director.name}, id: ${director.tmdbId} in WatchedDirector junction table.`,
        })
      }

      // If current num_watched_films by a director is 1, remove director from junction table
      if (watchedDirector.num_watched_films <= 1) {
        await watchedDirector.destroy()
      } else {
        watchedDirector.num_watched_films -= 1
        await watchedDirector.save()
      }
    }

    return res.status(200).json("Success")
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Error Removing Entry" })
  }
})
module.exports = router
