import React from "react";

const SwitchButton = ({ application, changeApplication }) => {
  return (
    <button className="btn-switch" onClick={changeApplication}>
      Switch to {application === "CRM" ? "CREATOR" : "CRM"}
    </button>
  );
};

export default SwitchButton;
