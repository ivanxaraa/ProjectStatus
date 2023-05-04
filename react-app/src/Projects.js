import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { RefreshCw, Plus, X } from "lucide-react";
import PopUp from "./shared/PopUp";
import Tab from "./shared/Tab";
import Notification from "./shared/Notification";
import Loading from "./shared/Loading";
import ProjectsCRM from "./ProjectsCRM";
import ProjectsCreator from "./ProjectsCreator";
import SwitchButton from "./shared/SwitchButton";

const Projects = ({ AuthUser, ativarPopUp, handleAddProject }) => {
  console.log(ativarPopUp);
  // Loading
  const [loading, setLoading] = useState(false);

  // Notification
  const [showNotification, setShowNotification] = useState(false);
  const [messageNoti, setMessageNoti] = useState("");
  const [statusNoti, setStatusNoti] = useState(true);
  const handleNotification = (status, message) => {
    setMessageNoti(message);
    setStatusNoti(status);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  // Form data
  const handleForm = (e) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  const [domain, setDomain] = useState(".COM");
  const handleDomain = (dominio) => {
    setDomain(dominio);
    newProject.Domain = dominio;
  };
  // Pop up
  const [popup, setPopup] = useState(null);
  const handlePopUp = (popup, project) => {
    setErrors({});
    setNewProject(defaultProject);
    setPopup(popup);
    if (project) {
      setNewProject({ ...project });
      setDomain(project.Domain);
    }
  };

  useEffect(() => {
    if(ativarPopUp){
      handlePopUp("addProject");
      handleAddProject();
    }
  }, [])

  // Data validation
  const [errors, setErrors] = useState({});
  const validate = () => {
    const { Admin_Name, Project_Name, Org, Token, Cookie } = newProject;
    const errors = {};

    if (!Project_Name) {
      errors.Project_Name = "Project Name is required";
    }

    if (!Cookie) {
      errors.Cookie = "Cookie is required";
    }

    if (application === "CREATOR") {
      if (!Admin_Name) {
        errors.Admin_Name = "Admin Name is required";
      }
    }

    if (application === "CRM") {
      if (!Org) {
        errors.Org = "X-CRM-ORG is required";
      }

      if (!Token) {
        errors.Token = "X-ZCSRF-TOKEN is required";
      }
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const [re_render, setRe_render] = useState(!false);
  const addProject = () => {
    if (!validate()) return;
    setLoading(true);
    axios
      .post("/server/project_status_function/create-project", {
        newProject,
      })
      .then((response) => {
        const {
          data: { created },
        } = response.data;
        setRe_render(!re_render);
        addSucesso();
      })
      .catch((err) => {
        console.log(err.response);
        handleNotification(false, "Error adding project");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const addSucesso = () => {
    handlePopUp();
    setNewProject(defaultProject);
    setErrors({});
    handleNotification(true, "Project has been successfully added");
  };

  //SWITCH
  const [application, setApplication] = useState("CRM");

  const [newProject, setNewProject] = useState({
    Application: application,
    Domain: domain,
  });
  const [defaultProject, setDefaultProject] = useState({ ...newProject });

  const handleApplication = () => {
    setNewProject({
      ...newProject,
      Application: application === "CRM" ? "CREATOR" : "CRM",
    });
    setDefaultProject({
      ...defaultProject,
      Application: application === "CRM" ? "CREATOR" : "CRM",
    });
    setApplication(application === "CRM" ? "CREATOR" : "CRM");
  };
  //CREATOR

  const refreshAll = () => {

    axios
      .post("/server/project_status_function/teste")
      .then((response) => {
        console.log(response);
      })
      .catch((err) => {
        console.log(err.response);
      });

  }

  return (
    <>
      {loading && <Loading />}

      {showNotification && (
        <Notification Message={messageNoti} Status={statusNoti} />
      )}

      {/* adicionar projeto */}
      {popup === "addProject" && (
        <PopUp onClose={handlePopUp}>
          <div className="form-popup">
            <div className="form-header">
              <h2 className="form-title">
                New Project<span>&gt; CRM</span>
              </h2>
            </div>
            <div className="form-close" onClick={() => handlePopUp()}>
              <X />
            </div>
            <div className="form-content">
              <div className="form-content-left">
                <div className="form-row height-100">
                  <span className="form-row-title">Project Name</span>
                  <input
                    type="text"
                    placeholder="Project Name"
                    name="Project_Name"
                    onChange={(e) => handleForm(e)}
                  />
                  <span className="form-error">{errors.Project_Name}</span>
                </div>
                <div className="form-row height-100">
                  <span className="form-row-title">Alert Email</span>
                  <input
                    type="text"
                    placeholder="Alert Email"
                    name="Alert_Email"
                    onChange={(e) => handleForm(e)}
                  />
                  <span className="form-error">{errors.alertEmail}</span>
                </div>
                <div className="form-row height-100">
                  <span className="form-row-title">Functions to Alert</span>
                  <input
                    type="text"
                    placeholder="Functions to Alert"
                    name="Functions_to_Alert"
                    onChange={(e) => handleForm(e)}
                  />
                  <span className="form-error">{errors.functions}</span>
                </div>
                <div className="form-row">
                  <span className="form-row-title">Domain</span>
                  <div className="form-row-row">
                    <Tab
                      Name=".COM"
                      Active={domain}
                      Size={"Form"}
                      onClick={() => handleDomain(".COM")}
                    />
                    <Tab
                      Name=".EU"
                      Active={domain}
                      Size={"Form"}
                      onClick={() => handleDomain(".EU")}
                    />
                  </div>
                </div>
              </div>
              <div className="form-content-right">
                <div className="form-row height-100">
                  <span className="form-row-title">X-CRM-ORG</span>
                  <input
                    type="text"
                    placeholder="Code"
                    name="Org"
                    onChange={(e) => handleForm(e)}
                  />
                  <span className="form-error">{errors.Org}</span>
                </div>
                <div className="form-row height-100">
                  <span className="form-row-title">X-ZCSRF-TOKEN</span>
                  <input
                    type="text"
                    placeholder="Token"
                    name="Token"
                    onChange={(e) => handleForm(e)}
                  />
                  <span className="form-error">{errors.Token}</span>
                </div>
                <div className="form-row">
                  <span className="form-row-title">Cookie</span>
                  <input
                    type="text"
                    placeholder="Cookie"
                    name="Cookie"
                    onChange={(e) => handleForm(e)}
                  />
                  <span className="form-error">{errors.Cookie}</span>
                </div>
              </div>
            </div>
            <div className="form-buttons">
              <button className="btn-primary" onClick={() => addProject()}>
                Add Project
              </button>
            </div>
          </div>
        </PopUp>
      )}

      {popup === "addProjectCreator" && (
        <PopUp onClose={handlePopUp}>
          <div className="form-popup">
            <div className="form-header">
              <h2 className="form-title">
                New Project<span>&gt; CREATOR</span>
              </h2>
            </div>
            <div className="form-close" onClick={() => handlePopUp()}>
              <X />
            </div>
            <div className="form-content">
              <div className="form-content-left">
                <div className="form-row height-100">
                  <span className="form-row-title">Admin Name</span>
                  <input
                    type="text"
                    placeholder="Admin Name"
                    name="Admin_Name"
                    onChange={(e) => handleForm(e)}
                  />
                  <span className="form-error">{errors.Admin_Name}</span>
                </div>
                <div className="form-row height-100">
                  <span className="form-row-title">Project Name</span>
                  <input
                    type="text"
                    placeholder="Project Name"
                    name="Project_Name"
                    onChange={(e) => handleForm(e)}
                  />
                  <span className="form-error">{errors.Project_Name}</span>
                </div>
                <div className="form-row">
                  <span className="form-row-title">Domain</span>
                  <div className="form-row-row">
                    <Tab
                      Name=".COM"
                      Active={domain}
                      Size={"Form"}
                      onClick={() => handleDomain(".COM")}
                    />
                    <Tab
                      Name=".EU"
                      Active={domain}
                      Size={"Form"}
                      onClick={() => handleDomain(".EU")}
                    />
                  </div>
                </div>
              </div>
              <div className="form-content-right">
                <div className="form-row height-100">
                  <span className="form-row-title">Alert Email</span>
                  <input
                    type="text"
                    placeholder="Alert Email"
                    name="Alert_Email"
                    onChange={(e) => handleForm(e)}
                  />
                  <span className="form-error">{errors.alertEmail}</span>
                </div>
                <div className="form-row height-100">
                  <span className="form-row-title">Functions to Alert</span>
                  <input
                    type="text"
                    placeholder="Functions to Alert"
                    name="Functions_to_Alert"
                    onChange={(e) => handleForm(e)}
                  />
                  <span className="form-error">{errors.functions}</span>
                </div>
                <div className="form-row">
                  <span className="form-row-title">Cookie</span>
                  <input
                    type="text"
                    placeholder="Cookie"
                    name="Cookie"
                    onChange={(e) => handleForm(e)}
                  />
                  <span className="form-error">{errors.Cookie}</span>
                </div>
              </div>
            </div>
            <div className="form-buttons">
              <button className="btn-primary" onClick={() => addProject()}>
                Add Project
              </button>
            </div>
          </div>
        </PopUp>
      )}

      <div className="all-items">
        <div className="all-items-container">
          <div className="all-items-header">
            <div className="all-items-header-left">
              <h2 className="main-subtitle">
                Projects <span>&gt; {application}</span>
              </h2>
              <div
                className="all-items-add"
                onClick={() =>
                  application === "CRM"
                    ? handlePopUp("addProject")
                    : handlePopUp("addProjectCreator")
                }
              >
                <Plus />
              </div>
            </div>
            <SwitchButton
              application={application}
              changeApplication={() => handleApplication()}
            />
            {/* <button onClick={() => refreshAll()}>Refresh All</button> */}
          </div>
          {application === "CRM" ? (
            <ProjectsCRM AuthUser={AuthUser} application={application} re_render={re_render} />
          ) : (
            <ProjectsCreator AuthUser={AuthUser} application={application} re_render={re_render} />
          )}
        </div>
      </div>
    </>
  );
};

export default Projects;
