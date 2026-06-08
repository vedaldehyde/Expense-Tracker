import React from "react";
// import Login from "./pages/Login";
import Main from "./pages/Main";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <>
      {/* <Login/> */}
      <BrowserRouter>
        <Main/>
      </BrowserRouter>
    </>
  );
}

export default App;
