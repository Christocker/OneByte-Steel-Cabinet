import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildInquiryMessage,
  getSiteHost,
  SITE_CONTACT,
  whatsappInquiryUrl,
} from "../lib/site.ts";

describe("buildInquiryMessage", () => {
  it("uses the display item number", () => {
    const message = buildInquiryMessage({
      itemNumber: 12,
      displayItemNumber: 3,
      name: "Half Glass Cabinet — White",
    });
    assert.match(message, /Item #3/);
    assert.match(message, /Half Glass Cabinet/);
  });

  it("falls back to the stored item number", () => {
    assert.match(buildInquiryMessage({ itemNumber: 9, name: "Cabinet" }), /Item #9/);
  });
});

describe("whatsappInquiryUrl", () => {
  it("targets the configured number and encodes the message", () => {
    const url = whatsappInquiryUrl({ itemNumber: 1, name: "Cabinet" });
    assert.ok(url.startsWith(`https://wa.me/${SITE_CONTACT.whatsappNumber}?text=`));
    assert.ok(url.includes(encodeURIComponent("Item #1")));
  });
});

describe("getSiteHost", () => {
  it("returns a host without a protocol", () => {
    const host = getSiteHost();
    assert.ok(!host.startsWith("http"));
    assert.ok(host.length > 0);
  });
});
