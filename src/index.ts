import express from "express";
import dotenv from "dotenv";
import http from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import mustacheExpress from "mustache-express";

dotenv.config();

const app = express();
const port = process.env.PORT ?? 3000;

const supported_langs = ["en", "hi", "kn"];

// Set templating engine (mustache)
app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname + "/../public");

// CORS + Cookies middleware
app.use(cors());
app.use(cookieParser());

// Serve static files from /public
app.use(express.static(__dirname + "/../public"));

// Set language endpoint
app.get("/lang", (req, res) => {
	// Redirect back to language selection screen for invalid "lang" query
	if (!supported_langs.includes(req.query["lang"] as string)) {
		return res.render("language-select", {
			redirect: req.originalUrl,
		});
	}

	// Set "lang" cookie to query param with the same name
	res.cookie("lang", req.query["lang"] as string);

	if (req.query["redirect"] === "/lang") {
		return res.redirect("/");
	}

	// Redirect to requested resource
	res.redirect(req.query["redirect"] as string);
});

// Language middleware
app.use((req, res, next) => {
	if (!req.cookies["lang"]) {
		res.render("language-select", { redirect: req.originalUrl });
		return;
	}
	next();
});

// GET / endpoint
app.get("/", (req, res) => {
	res.render(`index-${req.cookies["lang"]}`);
});

// 404 Not Found Middleware
app.use((req, res) => {
	res.status(404).send(http.STATUS_CODES[404]);
});

// Start server
app.listen(port, () => {
	console.log(`Server started on port ${port}!`);
});
