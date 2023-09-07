import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { Plus, X, EyeOff, Eye, Dices, Minus } from "lucide-react";
import PopUp from "./shared/PopUp";
import Tab from "./shared/Tab";
import Notification from "./shared/Notification";
import Loading from "./shared/Loading";
import ProjectsCRM from "./ProjectsCRM";
import ProjectsCreator from "./ProjectsCreator";
import SwitchButton from "./shared/SwitchButton";
import CollapseItem from "./shared/CollapseItem";

const Projects = ({ AuthUser, ativarPopUp, clearPopUp_AddProject, handleAddProject }) => {
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

  const handleFormNormal = (e, application, index) => {
    const { name, value } = e.target;
    if (index === undefined || index === null) {
      setNewProject((prevProject) => ({
        ...prevProject,
        AppsDetails: {
          ...prevProject.AppsDetails,
          [application]: {
            ...prevProject.AppsDetails[application],
            [name]: value,
          },
        },
      }));
    } else {
      setNewProject((prevProject) => ({
        ...prevProject,
        AppsDetails: {
          ...prevProject.AppsDetails,
          [application]: [
            ...prevProject.AppsDetails[application].slice(0, index),
            {
              ...prevProject.AppsDetails[application][index],
              [name]: value,
            },
            ...prevProject.AppsDetails[application].slice(index + 1),
          ],
        },
      }));
    }
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

  const [editProject, setEditProject] = useState(null);
  useEffect(() => {
    if (ativarPopUp?.ativar) {   
      if(ativarPopUp?.project){
        setEditProject(ativarPopUp?.project);  
        clearPopUp_AddProject();
        return;   
      }
      handlePopUp("addProject");
      handleAddProject();
    }
  }, []);

  const clearEditProject = () => {
    setEditProject(null);
  };

  // Data validation
  const [errors, setErrors] = useState({});
  const validate = () => {
    const {
      Project_Name,
      AppsDetails,
      SuperAdmin_Email,
      SuperAdmin_Password,
      Admin_Name,
    } = newProject;
    const errors = {};

    if (!Project_Name) errors.Project_Name = "Project name is required";
    if (!SuperAdmin_Email)
      errors.SuperAdmin_Email = "Super admin email is required";
    if (!SuperAdmin_Password)
      errors.SuperAdmin_Password = "Super admin password is required";

    let preenchido = false;
    //CRM
    if (
      AppsDetails?.CRM?.Org ||
      AppsDetails?.CRM?.Admin_Name ||
      AppsDetails?.CRM?.Token
    ) {
      preenchido = true;
      //algum esta preenchido
      if (!AppsDetails?.CRM?.Org) errors.CRM_Org = "Org is required";
      if (!AppsDetails?.CRM?.Cookie) errors.CRM_Cookie = "Cookie is required";
      if (!AppsDetails?.CRM?.Token) errors.CRM_Token = "Token is required";
    }

    //CREATOR
    if (
      Admin_Name ||
      AppsDetails["CREATOR"][0]?.App_Name ||
      AppsDetails["CREATOR"][0]?.Cookie
    ) {
      preenchido = true;
      if (!Admin_Name) errors.Admin_Name = "Admin name is required";
    }
    AppsDetails["CREATOR"].map((app, index) => {
        if (!app.App_Name)
          errors[`CREATOR_App_Name_${index}`] = "App name is required";
        if (!app.Cookie)
          errors[`CREATOR_Cookie_${index}`] = "Cookie is required";
    });

    if (!preenchido) {
      handleNotification(false, "At least one application must be filled in");
      return false;
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
  // const [application, setApplication] = useState("CRM");

  const [newProject, setNewProject] = useState({
    AppsDetails: {
      CREATOR: [],
    },
    Domain: domain,
    CreatedBy: parseInt(AuthUser.ROWID),
  });
  const [defaultProject, setDefaultProject] = useState({ ...newProject });

  // const handleApplication = () => {
  //   setNewProject({
  //     ...newProject,
  //     Application: application === "CRM" ? "CREATOR" : "CRM",
  //   });
  //   setDefaultProject({
  //     ...defaultProject,
  //     Application: application === "CRM" ? "CREATOR" : "CRM",
  //   });
  //   setApplication(application === "CRM" ? "CREATOR" : "CRM");
  // };
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
  };

  const [showPassword, setShowPassword] = useState(false);
  const handleShowPassoword = () => {
    setShowPassword(!showPassword);
  };

  const generateStrongPassword = () => {
    const length = 24;
    const charset = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?`;
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };
  const generatePassword = () => {
    const newPassword = generateStrongPassword();
    setNewProject({
      ...newProject,
      SuperAdmin_Password: newPassword,
    });
  };

  const handleAdicionarCreatorApp = () => {
    const newCreator = {
      App_Name: "",
      Cookie: "",
    };
    setNewProject({
      ...newProject,
      AppsDetails: {
        ...newProject.AppsDetails,
        CREATOR: [...newProject.AppsDetails.CREATOR, newCreator],
      },
    });
  };

  const handleRemoverCreatorApp = () => {
    //removes the last one
    const newCreator = newProject.AppsDetails.CREATOR;
    if (newCreator.length === 1) {
      handleNotification(false, "You must have at least one application");
      return;
    }
    newCreator.pop();
    setNewProject({
      ...newProject,
      AppsDetails: {
        ...newProject.AppsDetails,
        CREATOR: newCreator,
      },
    });
  };

  return (
    <>
      {loading && <Loading />}

      {showNotification && (
        <Notification Message={messageNoti} Status={statusNoti} />
      )}

      {popup === "addProject" && (
        <PopUp onClose={handlePopUp}>
          <div className="form-popup">
            <div className="form-header">
              <h2 className="form-title">New Project</h2>
            </div>
            <div className="form-close" onClick={() => handlePopUp()}>
              <X />
            </div>
            <div className="form-scroll">
              <div className="form-content-fixed top-15">
                <div className="form-fixed-row" id="first-row">
                  <div className="form-row height-100">
                    <span className="form-row-title">Project Name</span>
                    <input
                      type="text"
                      placeholder="Project Name"
                      name="Project_Name"
                      value={
                        newProject.Project_Name ? newProject.Project_Name : ""
                      }
                      onChange={(e) => handleForm(e)}
                    />
                    <span className="form-error">{errors.Project_Name}</span>
                  </div>
                  <div className="form-row height-100">
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
                <div className="form-fixed-row" id="second-row">
                  <div className="form-row height-100">
                    <span className="form-row-title">SuperAdmin Email</span>
                    <input
                      type="text"
                      placeholder="Email"
                      name="SuperAdmin_Email"
                      value={
                        newProject.SuperAdmin_Email
                          ? newProject.SuperAdmin_Email
                          : ""
                      }
                      onChange={(e) => handleForm(e)}
                    />
                    <span className="form-error">
                      {errors.SuperAdmin_Email}
                    </span>
                  </div>
                  <div className="form-row height-100">
                    <span className="form-row-title">SuperAdmin Password</span>
                    <div className="input-with-icon">
                      <input
                        type={`${showPassword ? "text" : "password"}`}
                        placeholder="Password"
                        name="SuperAdmin_Password"
                        style={{ paddingRight: "75px" }}
                        value={
                          newProject.SuperAdmin_Password
                            ? newProject.SuperAdmin_Password
                            : ""
                        }
                        onChange={(e) => handleForm(e)}
                      />
                      <div className="multi-icon">
                        <Dices
                          className="input-icon"
                          onClick={() => generatePassword()}
                        />
                        {showPassword ? (
                          <EyeOff
                            className="input-icon"
                            onClick={() => handleShowPassoword()}
                          />
                        ) : (
                          <Eye
                            className="input-icon"
                            onClick={() => handleShowPassoword()}
                          />
                        )}
                      </div>
                    </div>
                    <span className="form-error">
                      {errors.SuperAdmin_Password}
                    </span>
                  </div>
                </div>
              </div>
              <div className="collapse-section">
                <CollapseItem title="CRM">
                  <div className="form-fixed-row" id="first-row">
                    <div className="form-row height-100">
                      <span className="form-row-title">X-CRM-ORG</span>
                      <input
                        type="text"
                        placeholder="Code"
                        name="Org"
                        value={
                          newProject.AppsDetails?.CRM?.Org
                            ? newProject.AppsDetails.CRM.Org
                            : ""
                        }
                        onChange={(e) => handleFormNormal(e, "CRM")}
                      />
                      <span className="form-error">{errors.CRM_Org}</span>
                    </div>
                    <div className="form-row height-100">
                      <span className="form-row-title">X-ZCSRF-TOKEN</span>
                      <input
                        type="text"
                        placeholder="Token"
                        name="Token"
                        value={
                          newProject.AppsDetails?.CRM?.Token
                            ? newProject.AppsDetails.CRM.Token
                            : ""
                        }
                        onChange={(e) => handleFormNormal(e, "CRM")}
                      />
                      <span className="form-error">{errors.CRM_Token}</span>
                    </div>
                  </div>

                  <div className="form-row height-100">
                    <span className="form-row-title">Cookie</span>
                    <input
                      type="text"
                      placeholder="Cookie"
                      name="Cookie"
                      value={
                        newProject.AppsDetails?.CRM?.Cookie
                          ? newProject.AppsDetails.CRM.Cookie
                          : ""
                      }
                      onChange={(e) => handleFormNormal(e, "CRM")}
                    />
                    <span className="form-error">{errors.CRM_Cookie}</span>
                  </div>
                </CollapseItem>
                <CollapseItem title="CREATOR">
                  <div className="form-row height-100">
                    <span className="form-row-title">Admin Name</span>
                    <input
                      type="text"
                      placeholder="Admin Name"
                      name="Admin_Name"
                      value={newProject.Admin_Name ? newProject.Admin_Name : ""}
                      onChange={(e) => handleForm(e)}
                    />
                    <span className="form-error">{errors.Admin_Name}</span>
                  </div>
                  <div className="form-fixed-row" id="first-row">
                      <div className="form-row height-100">
                        <span className="form-row-title">App Name</span>
                        <input
                          type="text"
                          placeholder="Application Name"
                          name="App_Name"
                          value={newProject.AppsDetails?.CREATOR[0]?.App_Name ? newProject.AppsDetails?.CREATOR[0]?.App_Name : ""}
                          onChange={(e) =>
                            handleFormNormal(e, "CREATOR", 0)
                          }
                        />
                        <span className="form-error">
                          {errors[`CREATOR_App_Name_${0}`]}
                        </span>
                      </div>
                      <div className="form-row height-100">
                        <span className="form-row-title">Cookie</span>
                        <input
                          type="text"
                          placeholder="Cookie"
                          name="Cookie"
                          value={newProject.AppsDetails?.CREATOR[0]?.Cookie ? newProject.AppsDetails?.CREATOR[0]?.Cookie : ""}
                          onChange={(e) =>
                            handleFormNormal(e, "CREATOR", 0)
                          }
                        />
                        <span className="form-error">
                          {errors[`CREATOR_Cookie_${0}`]}
                        </span>
                      </div>
                    </div>
                  {newProject.AppsDetails.CREATOR.map((creator, index) => {
                    if(index === 0) return;
                    return(
                    <div className="form-fixed-row" id="first-row" key={index}>
                      <div className="form-row height-100">
                        <span className="form-row-title">App Name</span>
                        <input
                          type="text"
                          placeholder="Application Name"
                          name="App_Name"
                          value={creator.App_Name ? creator.App_Name : ""}
                          onChange={(e) =>
                            handleFormNormal(e, "CREATOR", index)
                          }
                        />
                        <span className="form-error">
                          {errors[`CREATOR_App_Name_${index}`]}
                        </span>
                      </div>
                      <div className="form-row height-100">
                        <span className="form-row-title">Cookie</span>
                        <input
                          type="text"
                          placeholder="Cookie"
                          name="Cookie"
                          value={creator.Cookie ? creator.Cookie : ""}
                          onChange={(e) =>
                            handleFormNormal(e, "CREATOR", index)
                          }
                        />
                        <span className="form-error">
                          {errors[`CREATOR_Cookie_${index}`]}
                        </span>
                      </div>
                    </div>
                  )})}
                  <div className="adicionar-mais">
                    <div
                      className="adicionar-mais-icon menos"
                      onClick={() => handleRemoverCreatorApp()}
                    >
                      <Minus />
                    </div>
                    <div
                      className="adicionar-mais-icon mais"
                      onClick={() => handleAdicionarCreatorApp()}
                    >
                      <Plus />
                    </div>
                  </div>
                </CollapseItem>
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
          <div className="all-items-header  ">
            <div className="all-items-header-left">
              <h2 className="main-subtitle">Projects</h2>
              <div
                className="all-items-add"
                onClick={() => handlePopUp("addProject")}
              >
                <Plus />
              </div>
            </div>
            {/* <SwitchButton
              application={application}
              changeApplication={() => handleApplication()}
            /> */}
            <button onClick={() => refreshAll()}>Refresh All</button>
          </div>
          {/* {application === "CRM" ? (
            <ProjectsCRM
              AuthUser={AuthUser}
              application={application}
              re_render={re_render}
            />
          ) : (
            <ProjectsCreator
              AuthUser={AuthUser}
              application={application}
              re_render={re_render}
            />
          )} */}
          <ProjectsCRM
            AuthUser={AuthUser}
            re_render={re_render}
            editProject={editProject}
            clearEditProject={clearEditProject}
            // application={application}
          />
        </div>
      </div>
    </>
  );
};

export default Projects;
