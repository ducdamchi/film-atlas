const { verify } = require("jsonwebtoken")

const validateToken = (req, res, next) => {
  const accessToken = req.header("accessToken")

  // If no access token generated, user not logged in
  if (!accessToken) {
    return res.json({ error: "User not logged in." })

    // User logged in
  } else {
    try {
      // verify the access token
      const validToken = verify(accessToken, "secretstring")

      // req.user can be accessed by any endpoint that uses 'validateToken'
      req.user = validToken

      // if valid, move forward with request
      if (validToken) {
        return next()
      }
    } catch (err) {
      return res.json({ error: err })
    }
  }
}

module.exports = { validateToken }
