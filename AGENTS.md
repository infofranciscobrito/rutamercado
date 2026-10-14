# Architecture rules

- Homepage category previews use the browser-safe `selectCategoryPreview` helper; keep selection independent of card rendering so chronological limits are testable without altering market cards or category pages.