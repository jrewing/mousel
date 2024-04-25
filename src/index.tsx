import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

const theme = extendTheme({
  components: {
    Button: {
      defaultProps: {
        size: "xs",
      },
    },
  },
  config: {
    initialColorMode: "dark",
  },
});

root.render(
  <React.StrictMode>
    <ChakraProvider resetCSS theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
);
