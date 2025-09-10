import { Request, Response } from "express";

const get = (req: Request, res: Response) => {
	res.render(`corporate-login-${req.cookies["lang"]}`);
};

const post = (req: Request, res: Response) => {
	res.send("WIP");
};

export default { get: get, post: post };
