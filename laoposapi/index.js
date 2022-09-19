require("dotenv").config();
const express = require("express");
const routes = require("./routes/routes");


const app = express();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.use(express.json());
app.use("/api", routes);

app.listen(4000, () => {
    console.log(`Server Started at ${4000}`);
});
