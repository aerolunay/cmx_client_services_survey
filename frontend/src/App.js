// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "./App.css";
import "./index.css";
import CompanyHelpForm from "./Routes/CompanyHelpForm";

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-grow">
        <Routes>
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/company-survey" replace />} />

          {/* Company Survey Form */}
          <Route path="/company-survey" element={<CompanyHelpForm />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
