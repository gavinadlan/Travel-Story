import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import React from "react";

import Login from "./pages/Auth/login";
import SignUp from "./pages/Auth/signup";
import Home from "./pages/Home/Home";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Signup" element={<SignUp />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
