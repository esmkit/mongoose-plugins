import crypto from "crypto";

export default function pbkdf2(password, salt, options, callback) {
	crypto.pbkdf2(password, salt, options.iterations, options.keylen, options.digestAlgorithm, callback);
}
