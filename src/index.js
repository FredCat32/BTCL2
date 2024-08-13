import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import Navbar from "./Components/NavBar.js"; // Ensure the path is correct

const root = ReactDOM.createRoot(document.getElementById("root"));

const customTheme = extendTheme({
  colors: {
    brand: {
      900: "#1a365d",
      800: "#153e75",
      700: "#2a69ac",
      purple: "#712F79",
      pink: "#E08D79",
      green: "#C2F970",
      lightblue: "#48639C",
      darkblue: "#4C4C9D",
    },
  },
});
root.render(
  <React.StrictMode>
    <ChakraProvider theme={customTheme}>
      <Navbar />
      <App />
    </ChakraProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
