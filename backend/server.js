const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const aadhareRoutes = require("./routes/aadharRoute");
const predictionsRoutes = require("./routes/prediction");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("app is running");
});
// Routes
app.use("/v1/api", userRoutes);
app.use("/v1/api/aadhar", aadhareRoutes);
app.use("/v1/api/prediction", predictionsRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
