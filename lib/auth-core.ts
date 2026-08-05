import {
  createHash,
  createHmac,
  randomBytes,
  scrypt,
  timingSafeEqual,
} from "node:crypto";

export const SESSION_COOKIE_NAME = "onebyte_admin_session";
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

export type AdminSession = {
  username: string;
  issuedAt: number;
  expiresAt: number;
};

export class AuthConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthConfigurationError";
  }
}

type PasswordHash = {
  cost: number;
  blockSize: number;
  parallelization: number;
  salt: Buffer;
  digest: Buffer;
};

function getAuthConfig() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const sessionSecret = process.env.SESSION_SECRET;

  if (!username || username.length > 100) {
    throw new AuthConfigurationError("ADMIN_USERNAME is not configured correctly.");
  }

  if (!passwordHash) {
    throw new AuthConfigurationError("ADMIN_PASSWORD_HASH is not configured.");
  }

  if (!sessionSecret || sessionSecret.length < 32) {
    throw new AuthConfigurationError("SESSION_SECRET must be at least 32 characters.");
  }

  return { username, passwordHash, sessionSecret };
}

function decodePasswordHash(encoded: string): PasswordHash | null {
  const parts = encoded.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") {
    return null;
  }

  const cost = Number(parts[1]);
  const blockSize = Number(parts[2]);
  const parallelization = Number(parts[3]);

  if (
    !Number.isInteger(cost) ||
    cost < 2 ** 10 ||
    cost > 2 ** 20 ||
    (cost & (cost - 1)) !== 0 ||
    !Number.isInteger(blockSize) ||
    blockSize < 1 ||
    blockSize > 32 ||
    !Number.isInteger(parallelization) ||
    parallelization < 1 ||
    parallelization > 8
  ) {
    return null;
  }

  try {
    const salt = Buffer.from(parts[4], "base64url");
    const digest = Buffer.from(parts[5], "base64url");
    if (salt.length < 16 || digest.length < 32) {
      return null;
    }
    return { cost, blockSize, parallelization, salt, digest };
  } catch {
    return null;
  }
}

async function verifyScryptPassword(password: string, encodedHash: string) {
  const hash = decodePasswordHash(encodedHash);
  if (!hash) {
    return false;
  }

  try {
    const derived = await new Promise<Buffer>((resolve, reject) => {
      scrypt(password, hash.salt, hash.digest.length, {
        N: hash.cost,
        r: hash.blockSize,
        p: hash.parallelization,
        maxmem: Math.max(32 * 1024 * 1024, 128 * hash.cost * hash.blockSize + 1024 * 1024),
      }, (error, key) => {
        if (error) reject(error);
        else resolve(key);
      });
    });

    return derived.length === hash.digest.length && timingSafeEqual(derived, hash.digest);
  } catch {
    return false;
  }
}

function equalStrings(left: string, right: string) {
  const leftDigest = createHash("sha256").update(left).digest();
  const rightDigest = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftDigest, rightDigest);
}

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export async function verifyAdminCredentials(username: string, password: string) {
  const config = getAuthConfig();
  const [usernameMatches, passwordMatches] = await Promise.all([
    Promise.resolve(equalStrings(username, config.username)),
    verifyScryptPassword(password, config.passwordHash),
  ]);
  return usernameMatches && passwordMatches;
}

export function createSessionToken(username: string) {
  const config = getAuthConfig();
  if (!equalStrings(username, config.username)) {
    throw new AuthConfigurationError("Cannot create a session for an unknown admin.");
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = encode(
    JSON.stringify({
      sub: username,
      iat: now,
      exp: now + SESSION_TTL_SECONDS,
      nonce: randomBytes(16).toString("base64url"),
    })
  );

  return `${payload}.${sign(payload, config.sessionSecret)}`;
}

export function verifySessionToken(token: string): AdminSession | null {
  if (!token || token.length > 4096) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const config = getAuthConfig();
  const expectedSignature = sign(parts[0], config.sessionSecret);
  const providedSignature = Buffer.from(parts[1], "base64url");
  const expectedSignatureBuffer = Buffer.from(expectedSignature, "base64url");
  if (
    providedSignature.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(providedSignature, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(decode(parts[0])) as {
      sub?: unknown;
      iat?: unknown;
      exp?: unknown;
      nonce?: unknown;
    };
    const now = Math.floor(Date.now() / 1000);
    if (
      typeof payload.sub !== "string" ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number" ||
      typeof payload.nonce !== "string" ||
      !equalStrings(payload.sub, config.username) ||
      !Number.isSafeInteger(payload.iat) ||
      !Number.isSafeInteger(payload.exp) ||
      payload.exp <= now ||
      payload.iat > now + 60
    ) {
      return null;
    }

    return {
      username: payload.sub,
      issuedAt: payload.iat,
      expiresAt: payload.exp,
    };
  } catch {
    return null;
  }
}
