import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { RefreshCw, Plus, X } from "lucide-react";
import PopUp from "./shared/PopUp";
import Tab from "./shared/Tab";
import Notification from "./shared/Notification";
import Loading from "./shared/Loading";
import FunctionFails from "./FunctionFails";
import AllFunctions from "./AllFunctions";
import CreatorAllFunctions from "./CreatorAllFunctions";
import CreatorFunctionFails from "./CreatorFunctionFails";
import SwitchButton from "./shared/SwitchButton";

const Functions = ({ AuthUser, handleAddProject, type }) => {
  // Loading
  const [loading, setLoading] = useState(false);
  const [projectSelected, setProjectSelected] = useState(false);
  const [projects, setProjects] = useState([]);

  const [cookie, setCookie] = useState(null);
  const [token, setToken] = useState(null);
  const [org, setOrg] = useState(null);

  const [application, setApplication] = useState("CRM");
  const handleApplication = () => {
    setApplication(application === "CRM" ? "CREATOR" : "CRM");
  };
  //tabs
  useEffect(() => {
    setLoading(true);
    axios
      .get(`/server/project_status_function/get-projects/${application}`)
      .then((response) => {
        const {
          data: { fetchedProjects },
        } = response.data;
        setProjects(fetchedProjects);
        if (fetchedProjects) {
          handleTabProjects(fetchedProjects[0]);
        }
      })
      .catch((err) => {
        console.log(err.response);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [application]);

  const handleTabProjects = (project) => {
    setProjectSelected(project);
    setCookie(project.Cookie);
    setToken(project.Token);
    setOrg(project.Org);
  };

  return (
    <div>
      {loading && <Loading />}

      <div className="all-items">
        <div className="all-items-container">
          <div className="main-flex">
            <div className="all-items-header-left">
              <h2 className="main-subtitle">
                Projects <span>&gt; {application}</span>
              </h2>
            </div>
            <SwitchButton
              application={application}
              changeApplication={() => handleApplication()}
            />
          </div>
          <div className="projects-tabs top-20">
            <Tab Name="+" Size={"tabForm"} onClick={handleAddProject} />
            {projects.map((project) => (
              <Tab
                Name={project?.Project_Name}
                Active={projectSelected?.Project_Name}
                Size={"tabForm"}
                onClick={() => handleTabProjects(project)}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="all-items top-50">
        {type === "All Functions" ? (
          application === "CRM" ? (
            <AllFunctions
              AuthUser={AuthUser}
              projectSelected={projectSelected}
              cookie={cookie} // viewcode
              token={token} // viewcode
              org={org} // viewcode
            />
          ) : (
            <CreatorAllFunctions
              AuthUser={AuthUser}
              projectSelected={projectSelected}
            />
          )
        ) : application === "CRM" ? (
          <FunctionFails
            AuthUser={AuthUser}
            projectSelected={projectSelected}
          />
        ) : (
          <CreatorFunctionFails
            AuthUser={AuthUser}
            projectSelected={projectSelected}
          />
        )}
      </div>
    </div>
  );
};

export default Functions;
