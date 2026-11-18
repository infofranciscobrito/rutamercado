/** Public directory registration never enrolls a business in RutaLover. */
export function businessRegistrationDefaults() {
  return {
    is_test: false,
    discount_willing: null,
    discount_offer: null,
    discount_offer_other: null,
    participation_needs: null,
    participation_needs_other: null,
    wants_founder: null,
  };
}