import { render } from "solid-js/web";
import LoginPage from "./LoginPage";
import { Toaster } from "~/components/ui/toast";
import "../styles/app.css";

render(() => (
  <>
    <LoginPage />
    <Toaster />
  </>
), document.getElementById("root")!);
