import { createSignal } from "solid-js";
import { createAuthClient } from "better-auth/solid";
import { anonymousClient } from "better-auth/client/plugins";
import { Button } from "~/components/ui/button";
import { Flex } from "~/components/ui/flex";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";

const authClient = createAuthClient({
  baseURL: window.location.origin,
  plugins: [anonymousClient()],
});

export default function LandingPage() {
  const [error, setError] = createSignal<string>("");

  const loginAnonymously = async () => {
    try {
      await authClient.signIn.anonymous();
      setError("");
      // Redirect to dashboard after successful login
      window.location.href = "/dashboard/";
    } catch (error) {
      console.error("Anonymous login error:", error);
      setError("Anonymous login failed: " + (error as Error).message);
    }
  };

  return (
    <div class="min-h-screen font-manrope">
      <Dialog open={!!error()} onOpenChange={() => setError("")}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Error</DialogTitle>
            <DialogDescription>{error()}</DialogDescription>
          </DialogHeader>
          <Button onClick={() => setError("")} class="w-full" variant="outline">
            Close
          </Button>
        </DialogContent>
      </Dialog>

      <Flex class="h-screen">
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
          <div class="w-full max-w-sm">
            <h1 class="text-4xl font-bold mb-4">TEMPLATE!!!</h1>
            <p class="text-lg mb-2">Ride the wave.</p>
            <p class="text-sm mb-8 text-muted-foreground">
              Everybody else is making GPT wrappers. We made a tool to help you
              make yours. Ride the wave, while you can.
            </p>
            <Button
              onClick={loginAnonymously}
              class="w-full"
              size="lg"
            >
              Try Anonymously
            </Button>
          </div>
        </Flex>
      </Flex>
    </div>
  );
}
