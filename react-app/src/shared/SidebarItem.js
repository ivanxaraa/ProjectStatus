import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

const SidebarItem = ({ Title, Icon, CurrrentTab, onClick }) => {  

  return (
    
        <div className={`sidebar-item ${CurrrentTab === Title ? 'active' : ''}`} onClick={onClick}>
          <div className="sidebar-item-content">
              <div className="sidebar-item-icon">{Icon}</div>
              <div className="sidebar-item-text">{Title}</div>
          </div>
        </div>
    
  );
};

export default SidebarItem;
