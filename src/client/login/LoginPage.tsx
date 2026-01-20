import { createSignal, Show, createEffect, createMemo } from "solid-js";
import { createAuthClient } from "better-auth/solid";
import { anonymousClient } from "better-auth/client/plugins";
import { genericOAuthClient } from "better-auth/client/plugins";
import { Button } from "~/components/ui/button";
import { Flex } from "~/components/ui/flex";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  TextField,
  TextFieldInput,
  TextFieldLabel,
} from "~/components/ui/text-field";
import { Separator } from "~/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { showToast } from "~/components/ui/toast";

const authClient = createAuthClient({
  baseURL: window.location.origin,
  plugins: [genericOAuthClient()],
});

export default function LoginPage() {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [isLogin, setIsLogin] = createSignal(true);
  const [loading, setLoading] = createSignal(false);

  // Check if already logged in
  const session = authClient.useSession();

  // If there's a redirect URL provided, use it. Otherwise, use a default.
  const redirectUrl = window.location.search.split("redirect=")[1] || "/";

  // Determine if user is logged in (not pending and has session data)
  const isLoggedIn = createMemo(
    () =>
      !session().isPending &&
      session().data != null &&
      session().data?.user != null
  );

  // Handle redirect with 3 second delay when logged in
  createEffect(() => {
    console.log("isLoggedIn", session());
    if (isLoggedIn()) {
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 3000);
    }
  });

  const handleEmailPasswordAuth = async (e: Event) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin()) {
        const result = await authClient.signIn.email({
          email: email(),
          password: password(),
        });

        if (result.error) {
          showToast({
            title: "Sign In Failed",
            description: result.error.message,
            variant: "error",
          });
        } else {
          window.location.href = redirectUrl;
        }
      } else {
        const result = await authClient.signUp.email({
          email: email(),
          password: password(),
          name: email().split("@")[0], // Use email prefix as name
        });

        if (result.error) {
          showToast({
            title: "Sign Up Failed",
            description: result.error.message,
            variant: "error",
          });
        } else {
          window.location.href = redirectUrl;
        }
      }
    } catch (error: unknown) {
      showToast({
        title: "Authentication Failed",
        description:
          error instanceof Error ? error.message : "Authentication failed",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Get the OAuth URL from better-auth without redirecting
    const result = await authClient.signIn.oauth2(
      {
        providerId: "google",
        callbackURL: redirectUrl,
        disableRedirect: true,
      },
      {
        throw: false,
      }
    );

    // The result should contain the redirect URL
    const url = result.data?.url ?? result.data?.redirect;
    console.log("OAuth result:", result);

    if (url && typeof url === "string") {
      // Open the OAuth URL in a popup
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        url,
        "google-oauth",
        `width=${width},height=${height},left=${left},top=${top},popup=1`
      );

      // Poll for popup close and check session
      const pollTimer = setInterval(() => {
        if (popup?.closed) {
          clearInterval(pollTimer);
          // Refresh session to check if auth succeeded
          void authClient.getSession().then(() => {
            const currentSession = session();
            if (currentSession.data?.user) {
              window.location.href = redirectUrl;
            }
          });
        }
      }, 500);
    }
  };

  return (
    <div class="h-screen font-manrope overflow-hidden">
      <Flex class="h-full">
        <div class="flex-1 relative overflow-hidden hidden md:block">
          <img
            src="/dolphin.jpeg"
            alt="Hero image"
            class="w-full h-full object-cover"
          />
        </div>

        <Flex
          class="w-full md:w-[480px] px-6 md:px-12 md:border-l"
          justifyContent="center"
          alignItems="center"
          flexDirection="col"
        >
          <Card class="w-full max-w-sm">
            <Show when={!isLoggedIn()}>
              <CardHeader class="text-center">
                <Show
                  when={session() && !session().isPending}
                  fallback={
                    <>
                      <Flex
                        alignItems="center"
                        justifyContent="center"
                        class="gap-2 mb-4"
                      >
                        <Skeleton class="w-8 h-8 rounded" />
                        <Skeleton class="h-5 w-20" />
                      </Flex>
                      <Skeleton class="h-8 w-32 mx-auto mb-2" />
                      <Skeleton class="h-4 w-48 mx-auto" />
                    </>
                  }
                >
                  <Flex
                    alignItems="center"
                    justifyContent="center"
                    class="gap-2 mb-4"
                  >
                    <div class="w-8 h-8 rounded bg-primary" />
                    <span class="font-semibold text-xl">Template</span>
                  </Flex>
                  <CardTitle class="text-2xl">
                    {isLogin() ? "Welcome back" : "Create account"}
                  </CardTitle>
                  <p class="text-muted-foreground">
                    {isLogin()
                      ? "Sign in to your account"
                      : "Get started with Template"}
                  </p>
                </Show>
              </CardHeader>
            </Show>

            <CardContent class="space-y-6">
              <Show
                when={isLoggedIn()}
                fallback={
                  <Show
                    when={session() && !session().isPending}
                    fallback={
                      <>
                        <div class="space-y-4">
                          <div class="space-y-2">
                            <Skeleton class="h-4 w-12" />
                            <Skeleton class="h-10 w-full" />
                          </div>
                          <div class="space-y-2">
                            <Skeleton class="h-4 w-16" />
                            <Skeleton class="h-10 w-full" />
                          </div>
                          <Skeleton class="h-10 w-full" />
                        </div>
                        <Skeleton class="h-4 w-40 mx-auto" />
                        <Skeleton class="h-10 w-full" />
                        <Skeleton class="h-4 w-24 mx-auto" />
                      </>
                    }
                  >
                    <form
                      onSubmit={(e: Event) => {
                        e.preventDefault();
                        void handleEmailPasswordAuth(e);
                      }}
                      class="space-y-4"
                    >
                      <TextField>
                        <TextFieldLabel>Email</TextFieldLabel>
                        <TextFieldInput
                          type="email"
                          placeholder="Enter your email"
                          value={email()}
                          onInput={(
                            e: InputEvent & { currentTarget: HTMLInputElement }
                          ) => setEmail(e.currentTarget.value)}
                          required
                        />
                      </TextField>

                      <TextField>
                        <TextFieldLabel>Password</TextFieldLabel>
                        <TextFieldInput
                          type="password"
                          placeholder="Enter your password"
                          value={password()}
                          onInput={(
                            e: InputEvent & { currentTarget: HTMLInputElement }
                          ) => setPassword(e.currentTarget.value)}
                          required
                        />
                      </TextField>

                      <Button type="submit" class="w-full" disabled={loading()}>
                        {loading()
                          ? "Please wait..."
                          : isLogin()
                            ? "Sign In"
                            : "Create Account"}
                      </Button>
                    </form>

                    <div class="text-center">
                      <Button
                        variant="link"
                        onClick={() => setIsLogin(!isLogin())}
                        class="text-sm"
                      >
                        {isLogin()
                          ? "Don't have an account? Create one"
                          : "Already have an account? Sign in"}
                      </Button>
                    </div>

                    <div class="relative">
                      <Separator />
                      <div class="absolute inset-0 flex items-center justify-center">
                        <span class="bg-background px-2 text-xs text-muted-foreground">
                          or
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => void handleGoogleSignIn()}
                      class="w-full"
                    >
                      <svg class="w-5 h-5 mr-2" viewBox="0 0 48 48">
                        <path
                          fill="#FFC107"
                          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                        />
                        <path
                          fill="#FF3D00"
                          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                        />
                        <path
                          fill="#4CAF50"
                          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                        />
                        <path
                          fill="#1976D2"
                          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                        />
                      </svg>
                      Sign in with Google
                    </Button>

                    <div class="text-center">
                      <Button
                        variant="link"
                        onClick={() => (window.location.href = "/")}
                        class="text-sm text-muted-foreground"
                      >
                        ← Back to home
                      </Button>
                    </div>
                  </Show>
                }
              >
                <div class="text-center space-y-4 py-12">
                  <svg
                    class="w-8 h-8 text-primary animate-spin mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <p class="text-sm text-muted-foreground">
                    Logged in, redirecting to {redirectUrl}...
                  </p>
                </div>
              </Show>
            </CardContent>
          </Card>
        </Flex>
      </Flex>
    </div>
  );
}
