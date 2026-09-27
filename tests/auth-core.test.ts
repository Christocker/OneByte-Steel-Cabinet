import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { randomBytes, scryptSync } from "node:crypto";
import {
  AuthConfigurationError,
  SESSION_TTL_SECONDS,
  createSessionToken,
  verifyAdminCredentials,
  verifySessionToken,
} from "../lib/auth-core.ts";

const ADMIN_USERNAME = "test-admin";
const ADMIN_PASSWORD = "correct horse battery staple";
const SESSION_SECRET = "s".repeat(48);

const originalEnv = {
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
  SESSION_SECRET: process.env.SESSION_SECRET,
};

function makePasswordHash(password: string, cost = 2 ** 14): string {
  const salt = randomBytes(16);
  const digest = scryptSync(password, salt, 64, { N: cost, r: 8, p: 1 });
  return `scrypt$${cost}$8$1$${salt.toString("base64url")}$${digest.toString("base64url")}`;
}

function restoreEnv(key: keyof typeof originalEnv): void {
  const value = originalEnv[key];
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

before(() => {
  process.env.ADMIN_USERNAME = ADMIN_USERNAME;
  process.env.ADMIN_PASSWORD_HASH = makePasswordHash(ADMIN_PASSWORD);
  process.env.SESSION_SECRET = SESSION_SECRET;
});

after(() => {
  restoreEnv("ADMIN_USERNAME");
  restoreEnv("ADMIN_PASSWORD_HASH");
  restoreEnv("SESSION_SECRET");
});

describe("verifyAdminCredentials", () => {
  it("accepts the configured credentials", async () => {
    assert.equal(await verifyAdminCredentials(ADMIN_USERNAME, ADMIN_PASSWORD), true);
  });

  it("rejects a wrong password", async () => {
    assert.equal(await verifyAdminCredentials(ADMIN_USERNAME, "wrong"), false);
  });

  it("rejects an unknown username", async () => {
    assert.equal(await verifyAdminCredentials("someone-else", ADMIN_PASSWORD), false);
  });
});

describe("session tokens", () => {
  it("round-trips a token for the configured admin", () => {
    const token = createSessionToken(ADMIN_USERNAME);
    const session = verifySessionToken(token);
    assert.ok(session);
    assert.equal(session?.username, ADMIN_USERNAME);
    assert.equal(session!.expiresAt - session!.issuedAt, SESSION_TTL_SECONDS);
  });

  it("rejects a tampered signature", () => {
    const token = createSessionToken(ADMIN_USERNAME);
    const lastChar = token.slice(-1);
    const tampered = `${token.slice(0, -1)}${lastChar === "A" ? "B" : "A"}`;
    assert.equal(verifySessionToken(tampered), null);
  });

  it("rejects malformed tokens", () => {
    for (const bad of ["", "abc", "a.b.c", "!!!.???", ".".repeat(3)]) {
      assert.equal(verifySessionToken(bad), null);
    }
  });

  it("rejects a token signed with a different secret", () => {
    const token = createSessionToken(ADMIN_USERNAME);
    process.env.SESSION_SECRET = "d".repeat(48);
    try {
      assert.equal(verifySessionToken(token), null);
    } finally {
      process.env.SESSION_SECRET = SESSION_SECRET;
    }
  });

  it("refuses to create a session for an unknown admin", () => {
    assert.throws(() => createSessionToken("intruder"), AuthConfigurationError);
  });

  it("rejects configuration with a short session secret", () => {
    process.env.SESSION_SECRET = "too-short";
    try {
      assert.throws(() => createSessionToken(ADMIN_USERNAME), AuthConfigurationError);
    } finally {
      process.env.SESSION_SECRET = SESSION_SECRET;
    }
  });
});
