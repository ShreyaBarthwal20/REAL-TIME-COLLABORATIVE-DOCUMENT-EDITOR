import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Editor from "./Editor";

function App() {
  return (
    <Routes>
      {/* Redirect "/" to a new document */}
      <Route path="/" element={<Navigate to={`/document/${Math.random().toString(36).substring(2, 10)}`} />} />
      <Route path="/document/:id" element={<Editor />} />
    </Routes>
  );
}

export default App;
