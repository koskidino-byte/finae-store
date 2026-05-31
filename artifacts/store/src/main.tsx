import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
<<<<<<< Updated upstream
=======
import { setBaseUrl } from "@workspace/api-client-react";

setBaseUrl("https://finae-api.onrender.com");
>>>>>>> Stashed changes

createRoot(document.getElementById("root")!).render(<App />);
