import { Request, Response } from "express";

export default async (req: Request, res: Response) => {
	res.render(`index-${req.cookies["lang"]}`);
};
