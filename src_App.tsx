import React from "react";
import "antd/dist/reset.css"; // AntD v5+ reset
import JsonSchemaBuilder from "./components/JsonSchemaBuilder";

const App: React.FC = () => (
  <div>
    <h2 style={{ textAlign: "center", margin: "2rem 0 0.5rem" }}>
      JSON Schema Builder Demo
    </h2>
    <JsonSchemaBuilder />
  </div>
);

export default App;