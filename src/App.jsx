import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import IndentFormPage from "./pages/IndentFormPage";
import LoginPage from "./pages/LoginPage";
import AddUserPage from "./pages/AddUserPage";
import PurchasePage from "./pages/PurchasePage";
import TransportPage from "./pages/TransportPage";
import EditPasswordPage from "./pages/EditPasswordPage";
const App = () => {
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
