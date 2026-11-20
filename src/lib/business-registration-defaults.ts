/** Directory profile writes cannot enroll businesses, even with legacy input. */
export function businessProfileProgramDefaults(_legacyInput?: unknown) {
  return {
    discount_willing: null,
    discount_offer: null,
    discount_offer_other: null,
    participation_needs: null,
    participation_needs_other: null,
    wants_founder: null,
  };
}

/** Public directory registration never enrolls a business in RutaLover. */
export function businessRegistrationDefaults(testQuery?: string | null) {
  return {
    is_test: testQuery === "1",
    ...businessProfileProgramDefaults(),
  };
}