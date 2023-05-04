import React, { useState } from "react";
import '../../styles/tab.css'

const Tab = ({ Name, Active, Size, onClick }) => {

  return (
    
    <div className={`tab ${Size === 'Normal' ? 'tabNormal' : 'tabForm'} ${Active === Name ? 'active' : ''}`} onClick={onClick}>
      <span>{Name}</span>
    </div>
    
  );
};

export default Tab;
