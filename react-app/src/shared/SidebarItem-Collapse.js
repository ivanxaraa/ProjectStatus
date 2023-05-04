import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

const SidebarItemCollapse = ({ Title, Icon, Open, children}) => {
    const [IsOpen, setIsOpen] = useState(Open || false);

    function toggleOpen() {
        setIsOpen(!IsOpen);
      }

      return (
        <>
            <div className={`sidebar-item`} onClick={() => toggleOpen()}>
            <div className="sidebar-item-content">
                <div className="sidebar-item-icon">{Icon}</div>
                <div className="sidebar-item-text">{Title}</div>
            </div>
            {children && (
                <div className={`sidebar-item-arrow ${IsOpen ? "arrow-rotate" : ""}`}>
                    <ChevronRight />
                </div>
            )}
            </div>
            {IsOpen && children}
        </>
      );
}

export default SidebarItemCollapse;
