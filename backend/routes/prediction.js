const express = require("express");
const router = express.Router();
const { getPrediction } =  require("../controllers/predictionController");

router.get("/predict", getPrediction);

module.exports = router;
