import { test } from "node:test";
import assert from "node:assert/strict";
import { businessRegistrationDefaults } from "./business-registration-defaults";

test("public business registrations are not tests", () => {
  assert.equal(businessRegistrationDefaults().is_test, false);
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