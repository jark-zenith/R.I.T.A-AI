# R.I.T.A Authentication

## Email/password

The application uses Supabase Auth through the server-side SSR boundary. R.I.T.A never stores passwords in application tables.

Production setup:
1. Configure email/password authentication in the Supabase project.
2. Configure the project's Site URL and redirect URLs.
3. Add the Render/public application origin as an allowed redirect.
4. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in Render.

## Google sign-in

The UI and callback flow are implemented, but Google sign-in is not considered enabled until the Google provider is configured in Supabase.

Configure the Google OAuth client in the Google provider console, then enter the provider configuration in the Supabase Auth provider settings. Keep the OAuth client secret in the provider/server configuration; never commit it or place it in browser code.

The application redirects through:
- /auth/callback?next=/dashboard
- /auth/callback?next=/reset-password

The callback rejects external redirect destinations to reduce open-redirect risk.

## Password recovery

Users request a reset link from /login. Supabase sends the recovery email and returns the user through /auth/callback to /reset-password.

The application intentionally returns generic authentication errors rather than exposing provider-specific account or credential details.

## Rate limiting

The authentication boundary delegates password protection and authentication-request throttling to the hosted Supabase Auth service. The application does not implement a second in-memory limiter because that would not reliably cover multiple application instances or restarts.

Operational rate-limit configuration should be reviewed in the Supabase project before public launch.
