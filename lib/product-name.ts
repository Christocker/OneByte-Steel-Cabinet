// Auto title-cases product names.
//
// Rules:
//  - Every word is capitalized: "Half glass cabinet with 2 drawers" becomes
//    "Half Glass Cabinet With 2 Drawers".
//  - All-caps words are normalized: "FULL GLASS" becomes "Full Glass".
//  - Intentional internal capitals are preserved: "OneByte", "iPhone".
//  - Hyphenated and slashed parts are capitalized separately: "4-drawers"
//    becomes "4-Drawers".
//  - Parentheses and other punctuation are left untouched:
//    "(4 doors)" becomes "(4 Doors)".
const PART_SEPARATOR = /([-/–—])/u;

function titleCasePart(part: string): string {
  const letters = part.match(/\p{L}/gu);
  if (!letters) return part;

  const allLower = letters.every((letter) => letter === letter.toLowerCase());
  const allUpper = letters.every((letter) => letter === letter.toUpperCase());

  // Mixed-case words (OneByte, iPhone) are intentional; leave them alone.
  if (!allLower && !allUpper) return part;

  let firstLetter = true;
  let result = "";
  for (const character of part) {
    if (!/\p{L}/u.test(character)) {
      result += character;
      continue;
    }
    if (firstLetter) {
      result += character.toUpperCase();
      firstLetter = false;
    } else {
      result += allUpper ? character.toLowerCase() : character;
    }
  }
  return result;
}

function titleCaseToken(token: string): string {
  return token.split(PART_SEPARATOR).map(titleCasePart).join("");
}

export function toTitleCase(value: string): string {
  return value.replace(/\S+/gu, titleCaseToken);
}

// Lightweight, cursor-safe helper for live typing: capitalizes the first letter
// of every word/part without lowercasing anything the user has typed.
export function capitalizeWordStarts(value: string): string {
  return value.replace(
    /(^|[\s\-/–—(])(\p{L})/gu,
    (_match, prefix: string, letter: string) => `${prefix}${letter.toUpperCase()}`
  );
}
