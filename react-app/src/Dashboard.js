import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/dashboard.css";
import Loading from "./shared/Loading";
import DashboardCRM from "./DashboardCRM";
import DashboardCreator from "./DashboardCreator";
import SwitchButton from "./shared/SwitchButton";

const Dashboard = () => {

  const [application, setApplication] = useState("CRM");
  const handleApplication = () => {
    setApplication(application === "CRM" ? "CREATOR" : "CRM");
  };

  
  return (
    <>
      <div className="dashboard">
        <div className="all-items">
          <div className="all-items-container">
            <div className="main-btw">
              <h2 className="main-subtitle">Function Fails</h2>
              <SwitchButton
              application={application}
              changeApplication={() => handleApplication()}
            />
            </div>
            {application === "CRM" ? (<DashboardCRM />) : (<DashboardCreator />)}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
