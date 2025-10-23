import { createSignal, Show, createEffect, createMemo } from "solid-js";
import { createAuthClient } from "better-auth/solid";
import { anonymousClient } from "better-auth/client/plugins";
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
  plugins: [],
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

  return (
    <div class="h-screen font-manrope overflow-hidden">
      <Flex class="h-full">
        <div class="flex-1 relative overflow-hidden">
          <img
            src="/dolphin.jpeg"
            alt="Hero image"
            class="w-full h-full object-cover"
          />
        </div>

        <Flex
          class="w-[480px] px-12 border-l"
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
                      onSubmit={(e) => {
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
                          onInput={(e) => setEmail(e.currentTarget.value)}
                          required
                        />
                      </TextField>

                      <TextField>
                        <TextFieldLabel>Password</TextFieldLabel>
                        <TextFieldInput
                          type="password"
                          placeholder="Enter your password"
                          value={password()}
                          onInput={(e) => setPassword(e.currentTarget.value)}
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
