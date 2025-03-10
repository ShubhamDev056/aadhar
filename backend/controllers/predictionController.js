const ss = require("simple-statistics");

exports.getPrediction = (req, res) => {
  // Sample Year-Wise Data
  const yearWiseData = [
    { year: 2000, value: 100 },
    { year: 2005, value: 150 },
    { year: 2010, value: 200 },
    { year: 2015, value: 300 },
    { year: 2020, value: 400 },
  ];

  // Convert Data for Regression Model
  const points = yearWiseData.map((item) => [item.year, item.value]);
  const regression = ss.linearRegression(points);
  const line = ss.linearRegressionLine(regression);

  // Predict future values for 2025, 2030
  const futureYears = [2025, 2030];
  const predictions = futureYears.map((year) => ({
    year,
    value: line(year),
  }));

  res.json({ history: yearWiseData, predictions });
};
