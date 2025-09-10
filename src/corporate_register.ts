import { Request, Response } from "express";
import validator from "validator";

// --- validation helpers ---

// Accept Unicode letters, numbers, spaces, dots, hyphens, apostrophes
// \p{L} matches any kind of letter from any language (requires u flag)
const NAME_RE = /^[\p{L}\p{M}\d .'\-]{6,64}$/u;

const ADDRESS_MIN = 10;
const ADDRESS_MAX = 100;

const COMPANY_TYPES = new Set([
	"pvt-ltd",
	"llp",
	"partnership",
	"public-co",
	"sole-prop",
]);

const INDUSTRY_TYPES = new Set([
	"fmcg",
	"agri-buyer",
	"food-processing",
	"catering",
]);

// GSTIN: 15 chars alnum, India-specific pattern: 2 digits (state) + 10 PAN chars + 1 entity + 1 checksum
const GSTIN_RE =
	/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/i;

// PAN: 10 chars: 5 letters + 4 digits + 1 letter
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;

// Phone: 10 digits (Indian), or allow leading +91?
const PHONE_RE = /^(?:\+91)?[6-9][0-9]{9}$/;

// Website: use validator.isURL with sane options
const urlOptions = {
	require_protocol: true,
	allow_underscores: false,
};

const messages: Record<string, Record<string, string>> = {
	en: {
		missing_fields: "Please fill all required fields.",
		invalid_full_name:
			"Full name must be 6-64 characters and contain valid letters.",
		invalid_email:
			"Please enter a valid email address (6-128 chars).",
		invalid_phone: "Please enter a valid 10-digit phone number.",
		invalid_company_name: "Company name must be 6-80 characters.",
		invalid_company_type: "Invalid company type selected.",
		invalid_gstin: "GSTIN looks invalid.",
		invalid_pan: "PAN looks invalid.",
		invalid_address: "Address must be 10-100 characters.",
		invalid_industry: "Invalid industry type selected.",
		invalid_designation:
			"Authorized signatory designation must be 6-24 characters.",
		invalid_website:
			"Website URL looks invalid (include protocol, e.g. https://).",
	},
	hi: {
		missing_fields: "कृपया सभी आवश्यक फ़ील्ड भरें।",
		invalid_full_name:
			"पूरा नाम 6–64 अक्षरों का होना चाहिए और मान्य वर्ण होने चाहिए।",
		invalid_email: "कृपया मान्य ईमेल पता दर्ज करें (6–128 अक्षर)।",
		invalid_phone: "कृपया 10-अंकीय फोन नंबर दर्ज करें।",
		invalid_company_name:
			"कृपया 6–80 अक्षरों में कंपनी का नाम दर्ज करें।",
		invalid_company_type: "अमान्य कंपनी प्रकार चुना गया है।",
		invalid_gstin: "GSTIN अमान्य दिख रहा है।",
		invalid_pan: "PAN अमान्य दिख रहा है।",
		invalid_address: "पता 10–100 अक्षरों का होना चाहिए।",
		invalid_industry: "अमान्य उद्योग प्रकार चुना गया है।",
		invalid_designation: "पदनाम 6–24 अक्षरों का होना चाहिए।",
		invalid_website:
			"Website URL अमान्य है (प्रोटोकॉल सहित, उदाहरण: https://)।",
	},
	kn: {
		missing_fields:
			"ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಅಗತ್ಯ ಕ್ಷೇತ್ರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ.",
		invalid_full_name:
			"ಪೂರ್ಣ ಹೆಸರು 6–64 ಅಕ್ಷರಗಳಿರಬೇಕು ಮತ್ತು ಮಾನ್ಯ ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು.",
		invalid_email: "ದಯವಿಟ್ಟು ಮಾನ್ಯ ಇಮೇಲ್ ನಮೂದಿಸಿ (6–128 ಅಕ್ಷರ).",
		invalid_phone: "ದಯವಿಟ್ಟು 10 ಅಂಕಿ ಫೋನ್ ನಂಬರ್ ನಮೂದಿಸಿ.",
		invalid_company_name:
			"ದಯವಿಟ್ಟು 6–80 ಅಕ್ಷರಗಳಲ್ಲಿ ಕಂಪನಿ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.",
		invalid_company_type: "ಅಮಾನ್ಯ ಕಂಪನಿಯ ಪ್ರಕಾರ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ.",
		invalid_gstin: "GSTIN ಅಮಾನ್ಯವಾಗಿ ಕಾಣುತ್ತಿದೆ.",
		invalid_pan: "PAN ಅಮಾನ್ಯವಾಗಿದೆ.",
		invalid_address: "ವಿಳಾಸವು 10–100 ಅಕ್ಷರಗಳಿರಬೇಕು.",
		invalid_industry: "ಅಮಾನ್ಯ ಉದ್ಯಮ ಪ್ರಕಾರ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ.",
		invalid_designation: "ಅಧಿಕೃತ ಸಹಿ ಪದವು 6–24 ಅಕ್ಷರಗಳಿರಬೇಕು.",
		invalid_website:
			"Website URL ಅಮಾನ್ಯವಾಗಿದೆ (ಪ್ರೋಟೋಕಾಲ್ ಸೇರಿಸಿ, ಉದಾ: https://).",
	},
};

const t = (lang: string | undefined, key: string) => {
	const l = lang === "hi" ? "hi" : lang === "kn" ? "kn" : "en";
	return messages[l][key] || messages["en"][key] || "Invalid input.";
};

const get = (req: Request, res: Response) => {
	res.render(`corporate-register-${req.cookies["lang"]}`);
};

const post = (req: Request, res: Response) => {
	// Normalize lang cookie
	const lang = (req.cookies && req.cookies.lang) || "en";

	// Read raw inputs and trim
	const full_name_raw = String(req.body["full-name-input"] ?? "").trim();
	const email_raw = String(req.body["email-input"] ?? "").trim();
	const phone_raw = String(req.body["phone-input"] ?? "").trim();
	const company_name_raw = String(
		req.body["company-name-input"] ?? ""
	).trim();
	const company_type_raw = String(
		req.body["company-type-input"] ?? ""
	).trim();
	const gstin_raw = String(req.body["gstin-input"] ?? "").trim();
	const pan_raw = String(req.body["pan-input"] ?? "").trim();
	const address_1_raw = String(
		req.body["address-line-1-input"] ?? ""
	).trim();
	const address_2_raw = String(
		req.body["address-line-2-input"] ?? ""
	).trim();
	const industry_type_raw = String(
		req.body["industry-type-input"] ?? ""
	).trim();
	const auth_designation_raw = String(
		req.body["authorized-signatory-designation-input"] ?? ""
	).trim();
	const website_raw = String(
		req.body["company-website-input"] ?? ""
	).trim();

	// Basic required-fields check
	if (
		!full_name_raw ||
		!email_raw ||
		!phone_raw ||
		!company_name_raw ||
		!company_type_raw ||
		!pan_raw ||
		!address_1_raw ||
		!address_2_raw ||
		!industry_type_raw ||
		!auth_designation_raw
	) {
		return res.status(400).render(`server-message-${lang}`, {
			message: t(lang, "missing_fields"),
		});
	}

	// Normalize / derived values
	const full_name = full_name_raw.replace(/\s+/g, " "); // collapse multi spaces
	const email = email_raw.toLowerCase();
	const phone = phone_raw.replace(/\s|-/g, ""); // remove spaces/dashes
	const company_name = company_name_raw;
	const company_type = company_type_raw.toLowerCase();
	const gstin = gstin_raw.toUpperCase();
	const pan = pan_raw.toUpperCase();
	const address_1 = address_1_raw.replace(/\s+/g, " ");
	const address_2 = address_2_raw.replace(/\s+/g, " ");
	const industry_type = industry_type_raw.toLowerCase();
	const authorized_signatory_designation = auth_designation_raw.replace(
		/\s+/g,
		" "
	);
	const company_website = website_raw;

	// VALIDATION CHECKS

	if (
		!NAME_RE.test(full_name) ||
		full_name.length < 6 ||
		full_name.length > 64
	) {
		return res.status(400).render(`server-message-${lang}`, {
			message: t(lang, "invalid_full_name"),
		});
	}

	if (
		!validator.isLength(email, { min: 6, max: 128 }) ||
		!validator.isEmail(email)
	) {
		return res.status(400).render(`server-message-${lang}`, {
			message: t(lang, "invalid_email"),
		});
	}

	if (!PHONE_RE.test(phone)) {
		return res.status(400).render(`server-message-${lang}`, {
			message: t(lang, "invalid_phone"),
		});
	}

	if (!validator.isLength(company_name, { min: 6, max: 80 })) {
		return res.status(400).render(`server-message-${lang}`, {
			message: t(lang, "invalid_company_name"),
		});
	}

	if (!COMPANY_TYPES.has(company_type)) {
		return res.status(400).render(`server-message-${lang}`, {
			message: t(lang, "invalid_company_type"),
		});
	}

	if (gstin) {
		// GSTIN optional, but if present must match regex and length 15
		if (gstin.length !== 15 || !GSTIN_RE.test(gstin)) {
			return res
				.status(400)
				.render(`server-message-${lang}`, {
					message: t(lang, "invalid_gstin"),
				});
		}
	}

	if (!PAN_RE.test(pan)) {
		return res.status(400).render(`server-message-${lang}`, {
			message: t(lang, "invalid_pan"),
		});
	}

	if (
		!validator.isLength(address_1, {
			min: ADDRESS_MIN,
			max: ADDRESS_MAX,
		}) ||
		!validator.isLength(address_2, {
			min: ADDRESS_MIN,
			max: ADDRESS_MAX,
		})
	) {
		return res.status(400).render(`server-message-${lang}`, {
			message: t(lang, "invalid_address"),
		});
	}

	if (!INDUSTRY_TYPES.has(industry_type)) {
		return res.status(400).render(`server-message-${lang}`, {
			message: t(lang, "invalid_industry"),
		});
	}

	if (
		!validator.isLength(authorized_signatory_designation, {
			min: 6,
			max: 24,
		})
	) {
		return res.status(400).render(`server-message-${lang}`, {
			message: t(lang, "invalid_designation"),
		});
	}

	// website optional, but if present should be a valid URL
	if (company_website) {
		if (
			!validator.isLength(company_website, {
				min: 6,
				max: 64,
			}) ||
			!validator.isURL(company_website, urlOptions)
		) {
			return res
				.status(400)
				.render(`server-message-${lang}`, {
					message: t(lang, "invalid_website"),
				});
		}
	}

	// Hash password, create company and user in DB using parameterized queries/ORM + success response

	return res.status(200).render(`server-message-${lang}`, {
		message: "Registration data looks valid. Server logic for registration not implemented yet.",
	});
};

export default { get: get, post: post };
