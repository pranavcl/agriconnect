import dotenv from "dotenv";

dotenv.config();

export default {
	port: process.env.PORT ?? 3000,
	supported_langs: ["en", "hi", "kn"],
};
