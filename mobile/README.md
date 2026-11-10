# AgriDrone Hub

AgriDrone Hub is an Expo and React Native demonstration marketplace connecting South African farm owners with agricultural drone operators. It is an interactive prototype; it does not authenticate users or connect to a production service.

## Run the app

```bash
npm install
npm run web
```

For a device or emulator, use `npm run android` or `npm run ios`.
The web build uses client-side routing so the local AsyncStorage demo data is rendered in the browser.

## Explore the demo

Sign in using a sample account email from the login screen. Any non-empty password satisfies the form, but passwords are not verified or stored:

- Farm owner: `thabo@example.test`
- Drone operator: `lerato@skyharvest.example.test`
- Administrator: `admin@agridrone.example.test`

The administrator account is pre-provisioned and available from the sign-in screen; it does not need to register or sign up. This local demo flow is not authentication: any non-empty password is accepted and there is no protected administrator credential. **Create Account** adds a local demo farmer profile. Password reset is unavailable because no authentication service is connected.

Use **Profile → Switch demonstration account** to switch between farmer and operator demos without resetting saved jobs, applications, bookings, messages, or reviews. Administrator access is not exposed as a shortcut.

## Prototype data and limitations

The app seeds stable fictional farmers, operators, jobs, applications, bookings, conversations, and notifications. Changes are saved locally with AsyncStorage. They are not shared between devices.

Credential selection saves only a local filename and simulated review status; it does not upload or securely store a document. Verification, administrator access, operator ratings, weather, messaging, and marketplace actions are demonstrations only. Demo roles, including the administrator role, are not protected authorization. Hiding the admin shortcut only reduces visibility; it does not secure the account. A production release needs a secure backend for identity, authorization, protected documents, messaging, payments, and audit trails.

The shared farm-inspired design palette is maintained in `src/constants/theme.ts` and reused by the marketplace components and screens. It defines brand greens, cream and soft-green surfaces, accessible status colors, and subtle category accents.

The bundled login hero photo is sourced from [Unsplash](https://images.unsplash.com/photo-1473968512647-3e447244af8f) and used under the [Unsplash License](https://unsplash.com/license). Explore's golden-field and seedling photos are sourced from Unsplash ([golden field](https://images.unsplash.com/photo-1500382017468-9049fed747ef), [seedlings](https://images.unsplash.com/photo-1466692476868-aef1dfb1e735)) and used under the [Unsplash License](https://unsplash.com/license). The rice-field photo is “Agricultural drone in use on rice field near Nisoshi, Aomori” by [Benlisquare](https://commons.wikimedia.org/wiki/User:Benlisquare), licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/); the Explore image is a crop of this photo.

The landing-page hero video is “Aerial Drone Spraying Technology on Farm Field” by [Magda Ehlers on Pexels](https://www.pexels.com/video/aerial-drone-spraying-technology-on-farm-field-34182418/) and is used under the [Pexels Free License](https://www.pexels.com/license/).

## Checks

```bash
npm run lint
npx tsc --noEmit
```

The lint script targets the marketplace app source. The unused Expo starter color-scheme hook still reports an existing React effect lint warning when linting the entire template `src` directory.
