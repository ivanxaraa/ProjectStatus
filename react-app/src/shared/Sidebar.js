import {
  Command,
  Files,
  GitPullRequest,
  AlertTriangle,
  LogOut,
  Network,
} from "lucide-react";
import "../../styles/sidebar.css";
import "../../styles/main.css";
import SidebarItem from "./SidebarItem";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import SidebarItemCollapse from "./SidebarItem-Collapse";
import { verificarPerms } from "./GlobalFunctions";


const Sidebar = ({ AuthUser, handleTabClick, activeTab }) => {
  const Logout = () => {
    Cookies.remove("authUser");
    window.location.reload();
  };

  const perms_itemsSidebar = verificarPerms(AuthUser.Profile, [
    "1105000000182356",
  ]);

  return (
    <div>
      <div className="sidebar">
        <div className="sidebar-container">
          <div className="sidebar-header">
            <div className="sidebar-image">
              <img src={'https://source.unsplash.com/_M6gy9oHgII'} alt="" />
            </div>
            <div className="sidebar-text">
              <div className="sidebar-user">{AuthUser.Nome}</div>
              <div className="sidebar-user-desc">{AuthUser.Email}</div>
            </div>
          </div>
          <div className="sidebar-items">
            <div className="sidebar-items-top">
              <SidebarItem
                Title="Dashboard"
                Icon={<Command />}
                onClick={() => handleTabClick("Dashboard")}
                CurrrentTab={activeTab}
              />
              <SidebarItem
                Title="Projects"
                Icon={<Files />}
                onClick={() => handleTabClick("Projects")}
                CurrrentTab={activeTab}
              />
              <SidebarItemCollapse Title="Functions" Icon={<GitPullRequest />}>
                <div className="sidebar-item-inside">
                  <SidebarItem
                    Title="All Functions"
                    Icon={<Files />}
                    onClick={() => handleTabClick("All Functions")}
                    CurrrentTab={activeTab}
                  />
                  <SidebarItem
                    Title="Function Fails"
                    Icon={<AlertTriangle />}
                    onClick={() => handleTabClick("Function Fails")}
                    CurrrentTab={activeTab}
                  />
                </div>
              </SidebarItemCollapse>
              {perms_itemsSidebar && (
                <SidebarItem
                  Title="Roles"
                  Icon={<Network />}
                  onClick={() => handleTabClick("Roles")}
                  CurrrentTab={activeTab}
                />
              )}
            </div>
            <div className="sidebar-items-bottom">
              <SidebarItem
                onClick={() => Logout()}
                Title="Logout"
                CurrrentTab={"Logout"}
                Icon={<LogOut />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
