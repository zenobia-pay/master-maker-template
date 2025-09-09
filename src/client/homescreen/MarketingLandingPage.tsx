import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Flex } from "~/components/ui/flex";

export default function MarketingLandingPage() {
  return (
    <div class="min-h-screen font-manrope">
      {/* Hero Section */}
      <section
        class="min-h-screen flex items-center justify-center"
        style="background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-surface-primary) 100%)"
      >
        <div class="container mx-auto px-6 text-center">
          <Flex flexDirection="col" alignItems="center" class="gap-8">
            <div class="w-16 h-16 rounded-xl bg-primary" />
            <h1 class="text-6xl font-bold mb-6">
              Build Your <span class="text-primary">GPT Wrapper</span>
              <br />
              In Minutes, Not Months
            </h1>
            <p class="text-xl text-muted-foreground max-w-2xl mb-8">
              Stop building the same authentication, database, and deployment
              boilerplate. Focus on what makes your AI tool unique. Get to
              market faster.
            </p>
            <Flex class="gap-4">
              <Button
                size="lg"
                onClick={() => (window.location.href = "/login/")}
              >
                Get Started Free
              </Button>
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </Flex>
            <p class="text-sm text-muted-foreground">
              No credit card required • 5 projects free forever
            </p>
          </Flex>
        </div>
      </section>

      {/* Features Section */}
      <section
        class="py-24"
        style="background: var(--color-bg-surface-secondary)"
      >
        <div class="container mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold mb-4">Why Choose Template?</h2>
            <p class="text-xl text-muted-foreground">
              Everything you need to launch your AI tool, nothing you don't.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded bg-primary" />
                  Lightning Fast Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-muted-foreground">
                  Deploy your AI wrapper in under 10 minutes with our
                  pre-configured stack. Authentication, database, and hosting
                  included.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded bg-primary" />
                  Built-in Auth & Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-muted-foreground">
                  User management, session handling, and security best practices
                  out of the box. Focus on your AI, not user systems.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded bg-primary" />
                  Scale Ready
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-muted-foreground">
                  Built on Cloudflare Workers and modern web standards. Handle
                  millions of requests without breaking a sweat.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section class="py-24">
        <div class="container mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p class="text-xl text-muted-foreground">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <div class="text-3xl font-bold">Free</div>
                <p class="text-muted-foreground">
                  Perfect for testing and small projects
                </p>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="space-y-2">
                  <p class="flex items-center gap-2">
                    <span class="text-green-500">✓</span> 5 projects
                  </p>
                  <p class="flex items-center gap-2">
                    <span class="text-green-500">✓</span> 1,000 API calls/month
                  </p>
                  <p class="flex items-center gap-2">
                    <span class="text-green-500">✓</span> Community support
                  </p>
                </div>
                <Button
                  class="w-full"
                  variant="outline"
                  onClick={() => (window.location.href = "/login/")}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card class="border-2 border-primary">
              <CardHeader>
                <div class="text-sm font-semibold px-3 py-1 rounded-full w-fit bg-primary text-primary-foreground">
                  Most Popular
                </div>
                <CardTitle>Pro</CardTitle>
                <div class="text-3xl font-bold">
                  $29
                  <span class="text-lg font-normal text-muted-foreground">
                    /month
                  </span>
                </div>
                <p class="text-muted-foreground">
                  Everything you need to scale
                </p>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="space-y-2">
                  <p class="flex items-center gap-2">
                    <span class="text-green-500">✓</span> Unlimited projects
                  </p>
                  <p class="flex items-center gap-2">
                    <span class="text-green-500">✓</span> 100,000 API
                    calls/month
                  </p>
                  <p class="flex items-center gap-2">
                    <span class="text-green-500">✓</span> Priority support
                  </p>
                  <p class="flex items-center gap-2">
                    <span class="text-green-500">✓</span> Custom domains
                  </p>
                  <p class="flex items-center gap-2">
                    <span class="text-green-500">✓</span> Analytics & monitoring
                  </p>
                </div>
                <Button
                  class="w-full"
                  onClick={() => (window.location.href = "/login/")}
                >
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <div class="text-3xl font-bold">Custom</div>
                <p class="text-muted-foreground">For teams and organizations</p>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="space-y-2">
                  <p class="flex items-center gap-2">
                    <span class="text-green-500">✓</span> Everything in Pro
                  </p>
                  <p class="flex items-center gap-2">
                    <span class="text-green-500">✓</span> Unlimited API calls
                  </p>
                  <p class="flex items-center gap-2">
                    <span class="text-green-500">✓</span> Dedicated support
                  </p>
                  <p class="flex items-center gap-2">
                    <span class="text-green-500">✓</span> On-premise options
                  </p>
                  <p class="flex items-center gap-2">
                    <span class="text-green-500">✓</span> SLA guarantee
                  </p>
                </div>
                <Button class="w-full" variant="outline">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        class="py-24"
        style="background: var(--color-bg-surface-primary)"
      >
        <div class="container mx-auto px-6 text-center">
          <h2 class="text-4xl font-bold mb-4">
            Ready to Build the Next Big AI Tool?
          </h2>
          <p class="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of developers who chose Template to launch their AI
            applications faster.
          </p>
          <Button size="lg" onClick={() => (window.location.href = "/login/")}>
            Start Building Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer class="py-12 border-t">
        <div class="container mx-auto px-6">
          <Flex justifyContent="between" alignItems="center">
            <Flex alignItems="center" class="gap-2">
              <div class="w-8 h-8 rounded bg-primary" />
              <span class="font-semibold text-lg">Template</span>
            </Flex>
            <p class="text-muted-foreground text-sm">
              © 2024 Template. All rights reserved.
            </p>
          </Flex>
        </div>
      </footer>
    </div>
  );
}
