import { randomBytes, scryptSync } from "node:crypto";

const COST = 16_384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;
const KEY_LENGTH = 64;

function readPassword() {
  return new Promise((resolve, reject) => {
    const input = process.stdin;
    const canHide = input.isTTY && typeof input.setRawMode === "function";

    if (!canHide) {
      process.stderr.write("Admin password: ");
      let value = "";
      input.setEncoding("utf8");
      input.on("data", (chunk) => {
        value += chunk;
      });
      input.on("end", () => resolve(value.trimEnd()));
      return;
    }

    process.stderr.write("Admin password: ");
    input.setRawMode(true);
    input.resume();
    let value = "";

    const finish = (error, result) => {
      input.setRawMode(false);
      input.pause();
      input.removeListener("data", onData);
      process.stderr.write("\n");
      if (error) reject(error);
      else resolve(result);
    };

    const onData = (chunk) => {
      for (const character of chunk.toString("utf8")) {
        if (character === "\u0003") {
          finish(new Error("Password entry cancelled."));
          return;
        }
        if (character === "\r" || character === "\n") {
          finish(null, value);
          return;
        }
        if (character === "\u0008" || character === "\u007f") {
          value = value.slice(0, -1);
        } else if (character >= " ") {
          value += character;
        }
      }
    };

    input.on("data", onData);
  });
}

try {
  const password = await readPassword();
  if (!password) throw new Error("Password cannot be empty.");
  const salt = randomBytes(16);
  const digest = scryptSync(password, salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELIZATION,
    maxmem: 32 * 1024 * 1024,
  });
  console.log(
    `scrypt$${COST}$${BLOCK_SIZE}$${PARALLELIZATION}$${salt.toString("base64url")}$${digest.toString("base64url")}`
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : "Unable to generate password hash.");
  process.exitCode = 1;
}
