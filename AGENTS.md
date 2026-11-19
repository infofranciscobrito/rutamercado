# Architecture rules
- The Mesas Aliadas admin page reads contact fields through the existing administrator-only SELECT policy and joins by response ID, including test rows; no public or server read changes are needed. Funnel contact counts require interested respondents with nonempty contact fields.

- Homepage category previews use the browser-safe `selectCategoryPreview` helper; keep selection independent of card rendering so chronological limits are testable without altering market cards or category pages.
- Survey prices, spending and visit assumptions live in the browser-safe survey model shared by questions and analytics, preventing contradictory estimates.
- Survey aliases redirect to the single survey route preserving the original query string so printed QR attribution and test mode survive.
- Public business registration applies server-owned defaults from `businessRegistrationDefaults`; keep these separate from admin editing to prevent unrelated program enrollment, and accept test status only from the exact test=1 link parameter.