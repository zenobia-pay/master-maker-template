import { render } from "solid-js/web";
import Homescreen from "./Homescreen";
import "../styles/index.css";
import "../styles/app.css";
// Trigger re-transformation

render(() => <Homescreen />, document.getElementById("root")!);
