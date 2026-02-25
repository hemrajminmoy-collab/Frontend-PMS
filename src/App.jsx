import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import IndentFormPage from "./pages/IndentFormPage";
import LoginPage from "./pages/LoginPage";
import AddUserPage from "./pages/AddUserPage";
import PurchasePage from "./pages/PurchasePage";
import TransportPage from "./pages/TransportPage";
import EditPasswordPage from "./pages/EditPasswordPage";
const App = () => {
  useEffect(() => {
    const isNumberInput = (el) =>
      el instanceof HTMLInputElement && el.type === "number";

    const handleWheel = (event) => {
      if (isNumberInput(event.target)) {
        event.target.blur();
      }

      const activeEl = document.activeElement;
      if (isNumberInput(activeEl)) {
        activeEl.blur();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  return (
      <BrowserRouter>
        <Routes>
          {/*Login Form */}
          {/* <Route path="/" element={<IndentFormPage />} /> */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/add-user" element={<AddUserPage />} />
          <Route path="/purchase" element={<PurchasePage />} />
          <Route path="/transport" element={<TransportPage />} />
          <Route path="/edit-password" element={<EditPasswordPage />} />
        </Routes>
      </BrowserRouter>    
  );
};

export default App;
