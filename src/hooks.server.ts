import {
  PUBLIC_SUPABASE_ANON_KEY,
  PUBLIC_SUPABASE_URL,
} from "$env/static/public";
import { createServerClient } from "@supabase/ssr";
import type { Handle } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return event.cookies.getAll();
        },
        setAll(cookiesToSet) {
          /**
           * Note: You have to add the `path` variable to the
           * set and remove method due to sveltekit's cookie API
           * requiring this to be set, setting the path to an empty string
           * will replicate previous/standard behavior (https://kit.svelte.dev/docs/types#public-types-cookies)
           */
          cookiesToSet.forEach(({ name, value, options }) =>
            event.cookies.set(name, value, {
              ...options,
              path: "/",
            })
          );
        },
      },
    },
  );

  /**
   * Unlike `supabase.auth.getSession()`, which returns the session _without_
   * validating the JWT, this function also calls `getUser()` to validate the
   * JWT before returning the session.
   */
  event.locals.safeGetSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession();
    if (!session) {
      return { session: null, user: null };
    }

    const {
      data: { user },
      error,
    } = await event.locals.supabase.auth.getUser();
    if (error) {
      // JWT validation has failed
      return { session: null, user: null };
    }

    return { session, user };
  };

  // Redirect to /auth if user is not authenticated and tries to access /lessons
  if (
    (await event.locals.safeGetSession()).session == null &&
    event.url.pathname.startsWith("/lessons")
  ) {
    redirect(303, "/auth");
  }

  // Redirect to home if user is authenticated and tries to access /auth
  if (
    (await event.locals.safeGetSession()).session &&
    event.url.pathname === "/auth"
  ) {
    redirect(303, "/");
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === "content-range" || name === "x-supabase-api-version";
    },
  });
};
