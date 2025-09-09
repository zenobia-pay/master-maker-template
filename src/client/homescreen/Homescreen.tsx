import { Match, Switch } from "solid-js";
import { createAuthClient } from "better-auth/solid";
import { anonymousClient } from "better-auth/client/plugins";
import { Flex } from "~/components/ui/flex";
import MarketingLandingPage from "./MarketingLandingPage";

const authClient = createAuthClient({
  baseURL: window.location.origin,
  plugins: [anonymousClient()],
});

export default function Homescreen() {
  const session = authClient.useSession();

  return (
    <div class="min-h-screen font-manrope">
      <Switch>
        <Match when={session().isPending}>
          <Flex class="h-screen" justifyContent="center" alignItems="center">
            <div class="relative">
              <div
                class="border-t-2 border-b-2 border-l-transparent border-r-transparent border-primary h-32 w-32 animate-spin"
              />
            </div>
          </Flex>
        </Match>

        <Match when={session()?.data}>
          {/* Redirect to dashboard if logged in */}
          {(() => {
            window.location.href = "/dashboard/";
            return null;
          })()}
        </Match>

        <Match when={!session()?.data && !session().isPending}>
          <MarketingLandingPage />
        </Match>
      </Switch>
    </div>
  );
}
