## Problem
The "Perfil de redes sociales" (`organizer_instagram`) input in the admin market edit/create form is being auto-filled by browser password managers because it is detected as a login/email field.

## Fix
In `src/components/admin/MarketFormDrawer.tsx`, on the `<Input>` for `organizer_instagram` (line 336), add the following attributes:
- `autoComplete="new-password"`
- `data-lpignore="true"`
- `data-form-type="other"`

These explicitly tell LastPass and other password managers to ignore this field, while leaving all actual login/email/password fields untouched.

No other fields, validation logic, or save behavior will be changed.