import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import mustacheExpress from "mustache-express";

import constants from "./constants";
import lang from "./lang";
import root from "./root";
import corporate_login from "./corporate_login";
import corporate_register from "./corporate_register";

const app = express();

// Set templating engine (mustache)
app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname + "/../public");

// Extract form data from requests
app.use(express.json());
app.use(express.urlencoded());

// CORS + Cookies middleware
app.use(cors());
app.use(cookieParser());

// Serve static files from /public
app.use(express.static(__dirname + "/../public"));

// Language middleware
app.get("/lang", lang); // Lang endpoint
app.use((req, res, next) => {
	if (!req.cookies["lang"]) {
		res.render("language-select", { redirect: req.originalUrl });
		return;
	}
	next();
});

// PUT ALL ENDPOINTS HERE
app.get("/", root);

app.get("/corporate-login", corporate_login.get);
app.post("/corporate-login", corporate_login.post);

app.get("/corporate-register", corporate_register.get);
app.post("/corporate-register", corporate_register.post);

// 404 Not Found Middleware
app.use((req, res) => {
	res.status(404).send(http.STATUS_CODES[404]);
});

// Start server
app.listen(constants.port, () => {
	console.log(`Server started on port ${constants.port}!`);
});
