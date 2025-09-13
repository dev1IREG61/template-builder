// components/Dashboard/index.js - Dashboard routing
import React from "react";
import { Routes, Route } from "react-router-dom";
import DesignList from "./DesignList";
import DesignEdit from "./Dashboard/DesignEdit";

const Dashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<DesignList />} />
      <Route path="/design/new" element={<DesignEdit />} />
      <Route path="/design/edit/:designId" element={<DesignEdit />} />
    </Routes>
  );
};

export default Dashboard;
