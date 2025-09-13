// Dashboard.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import DesignList from "./DesignList";
import DesignEdit from "./DesignEdit";

const Dashboard: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DesignList />} />
      <Route path="/design/new" element={<DesignEdit />} />
      <Route path="/design/:designId" element={<DesignEdit />} />
    </Routes>
  );
};

export default Dashboard;
