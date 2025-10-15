const express = require("express")
const router = express.Router()
const { Films } = require("../models")
const { validateToken } = require("../middlewares/AuthMiddleware")

module.exports = router
