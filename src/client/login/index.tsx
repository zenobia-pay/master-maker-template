import { render } from "solid-js/web";
import LoginPage from "./LoginPage";
import { Toaster, showToast } from "~/components/ui/toast";
import "../styles/app.css";

// Intercept console.error to show toasts
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  // Still call the original console.error so errors appear in console
  originalConsoleError.apply(console, args);

  // Show toast with the error message
  const errorMessage = args
    .map(arg => {
      if (arg instanceof Error) return arg.message;
      if (typeof arg === 'object') return JSON.stringify(arg);
      return String(arg);
    })
    .join(' ');

  showToast({
    title: "Error",
    description: errorMessage,
    variant: "error",
    duration: 5000, // 5 seconds
  });
};

render(() => (
  <>
    <LoginPage />
    <Toaster />
  </>
), document.getElementById("root")!);
