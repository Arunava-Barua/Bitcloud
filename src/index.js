import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import { CloudProvider } from "./context/CloudContext";

ReactDOM.render(
  <React.StrictMode>
    <CloudProvider>
      <App />
    </CloudProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
