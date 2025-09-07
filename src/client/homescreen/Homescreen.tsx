import { createSignal, Show, Match, Switch } from "solid-js";
import { createAuthClient } from "better-auth/solid";
import ProjectSelector from "./ProjectSelector";

const authClient = createAuthClient({
  baseURL: window.location.origin,
});

export default function Homescreen() {
  const session = authClient.useSession();
  const [error, setError] = createSignal<string>("");

  const loginWithGoogle = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
      });
      setError("");
    } catch (error) {
      console.error("Google login error:", error);
      setError("Google login failed: " + (error as Error).message);
    }
  };

  return (
    <div
      class="min-h-screen font-manrope"
      style={{
        background: "var(--color-bg-primary)",
        color: "var(--color-text-primary)",
      }}
    >
      <Show when={error()}>
        <div
          class="fixed inset-0 z-50 backdrop-blur-sm transition-opacity duration-200"
          style={{ background: "rgba(243, 244, 240, 0.8)" }}
        >
          <div
            class="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg p-6 shadow-lg transition-all duration-200"
            style={{
              background: "var(--color-bg-surface-primary)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div class="flex flex-col space-y-2 text-center">
              <h2
                class="text-lg font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Login Error
              </h2>
              <p
                class="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {error()}
              </p>
            </div>
            <button
              onClick={() => setError("")}
              class="mt-4 w-full px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{
                transition: "all 200ms",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </Show>

      <Switch>
        <Match when={session().isPending}>
          <div
            class="fixed inset-0 flex items-center justify-center backdrop-blur-sm"
            style={{ background: "rgba(243, 244, 240, 0.8)" }}
          >
            <div class="relative">
              <div class="border-t-2 border-b-2 border-l-transparent border-r-transparent border-t-orange-500 border-b-orange-500 h-32 w-32" />
            </div>
          </div>
        </Match>

        <Match when={session()?.data}>
          {/* Full-screen project selector (contains its own layout + sidebar) */}
          <ProjectSelector />
        </Match>

        <Match when={!session()?.data && !session().isPending}>
          <div
            class="fixed inset-0 flex"
            style={{ background: "var(--color-bg-primary)" }}
          >
            {/* Left column - Hero image (wider) */}
            <div class="flex-1 relative overflow-hidden">
              <img
                src="/dolphin.jpeg"
                alt="Hero image"
                class="w-full h-full object-cover"
              />
            </div>

            {/* Right column - Sign in content (narrower) */}
            <div
              class="w-[480px] flex items-center justify-center px-12 border-l"
              style={{
                background: "var(--color-bg-surface-primary)",
                "border-color": "var(--color-border)",
              }}
            >
              <div class="w-full max-w-sm">
                <h1
                  class="text-4xl font-bold mb-4"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  TEMPLATE!!!
                </h1>
                <p
                  class="text-lg mb-2"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Ride the wave.
                </p>
                <p
                  class="text-sm mb-8"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Everybody else is making GPT wrappers. We made a tool to help
                  you make yours. Ride the wave, while you can.
                </p>
                <button
                  onClick={loginWithGoogle}
                  class="cursor-pointer w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                >
                  Sign in with Google
                </button>
              </div>
            </div>
          </div>
        </Match>
      </Switch>
    </div>
  );
}
