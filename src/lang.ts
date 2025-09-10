import { Request, Response } from "express";

import constants from "./constants";

export default async (req: Request, res: Response) => {
	// Redirect back to language selection screen for invalid "lang" query
	if (!constants.supported_langs.includes(req.query["lang"] as string)) {
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
};
