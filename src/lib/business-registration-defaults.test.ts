import { test } from "node:test";
import assert from "node:assert/strict";
import { businessRegistrationDefaults } from "./business-registration-defaults";

test("public business registrations are not tests", () => {
  assert.equal(businessRegistrationDefaults().is_test, false);
});

test("test mode is enabled only by test=1", () => {
  assert.equal(businessRegistrationDefaults("1").is_test, true);
  for (const value of [null, "", "0", "true", "2"]) {
    assert.equal(businessRegistrationDefaults(value).is_test, false);
  }
});

test("test registrations also do not enroll in Mesas Aliadas", () => {
  const { is_test, ...fields } = businessRegistrationDefaults("1");
  assert.equal(is_test, true);
  assert.deepEqual(fields, {
    discount_willing: null,
    discount_offer: null,
    discount_offer_other: null,
    participation_needs: null,
    participation_needs_other: null,
    wants_founder: null,
  });
});

test("public business registrations do not enroll in Mesas Aliadas", () => {
  const { is_test: _, ...fields } = businessRegistrationDefaults();
  assert.deepEqual(fields, {
    discount_willing: null,
    discount_offer: null,
    discount_offer_other: null,
    participation_needs: null,
    participation_needs_other: null,
    wants_founder: null,
  });
});