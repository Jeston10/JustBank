// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

// Temporarily disabled to stop logging
// import * as Sentry from "@sentry/nextjs";

// export async function register() {
//   if (process.env.NEXT_RUNTIME === 'client') {
//     Sentry.init({
//       dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
//       tracesSampleRate: 1.0,
//       debug: false,
//       replaysOnErrorSampleRate: 1.0,
//       replaysSessionSampleRate: 0.1,
//       integrations: [
//         Sentry.replayIntegration({
//           maskAllText: true,
//           blockAllMedia: true,
//         }),
//       ],
//     });
//   }
// }

// Sentry.init({
//   dsn: "https://0938294a2b03385aa707fe86c77eee73@o4509593702825984.ingest.us.sentry.io/4509593705381888",
//
//   // Add optional integrations for additional features
//   integrations: [
//     Sentry.replayIntegration(),
//   ],
//
//   // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
//   tracesSampleRate: 1,
//
//   // Define how likely Replay events are sampled.
//   // This sets the sample rate to be 10%. You may want this to be 100% while
//   // in development and sample at a lower rate in production
//   replaysSessionSampleRate: 0.1,
//
//   // Define how likely Replay events are sampled when an error occurs.
//   // replaysOnErrorSampleRate: 1.0,
//
//   // Setting this option to true will print useful information to the console while you're setting up Sentry.
//   debug: false,
// });

// export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;