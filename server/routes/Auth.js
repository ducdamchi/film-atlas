const express = require("express")
const router = express.Router()
const { Users } = require("../models")
const bcrypt = require("bcrypt")
const { sign } = require("jsonwebtoken")
const { validateToken } = require("../middlewares/AuthMiddleware")

/* Notes:
All of the routes below will be prefixed with "/posts"
req: (Request object) - Contains request data (headers, parameters, body, etc.) 
res (Respon
se object) - Used to send back the response */

/* Register */
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body

    const user_existed = await Users.findOne({ where: { username: username } })

    /* Check if username already existed */
    if (!user_existed) {
      /* Use bcrypt library to hash the password the user input. Hashing is a one-way encryption, which means one cannot 'unhash' it for the original password string even if they have access to the already hashed string. */
      bcrypt.hash(password, 10).then((hash) => {
        Users.create({
          username: username,
          password: hash,
        })
        return res.json("Successfully created user.")
      })
    } else {
      return res.json("Username already existed.")
    }
  } catch (err) {
    return res.status(500).json({ error: "Error Creating User.\n", err })
  }
})

/* Sign In */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await Users.findOne({ where: { username: username } })

    // If user exists
    if (user) {
      // Check if hashed password matches password in database
      bcrypt.compare(password, user.password).then(async (match) => {
        // Return message if password does not match
        if (!match) {
          return res.json({ error: "Wrong Password." })

          // If passwords match, pass data to turn into a token
        } else {
          const accessToken = sign(
            { username: user.username, id: user.id },
            "secretstring"
          )
          // Only return valid json when accessToken created
          return res.json({
            username: user.username,
            id: user.id,
            token: accessToken,
          })
        }
      })
    } else {
      return res.json({ error: "Username Does Not Exist." })
    }
  } catch (error) {
    return res.status(500).json({ error: "Error Signing IN User.\n", err })
  }
})

router.get("/verify", validateToken, (req, res) => {
  return res.json(req.user)
})

module.exports = router
