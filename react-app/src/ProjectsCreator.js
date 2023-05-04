import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import {
  RefreshCw,
  Plus,
  X,
  BellRing,
  Bell,
  AlarmClock,
  BellOff,
} from "lucide-react";
import PopUp from "./shared/PopUp";
import Tab from "./shared/Tab";
import Notification from "./shared/Notification";
import Loading from "./shared/Loading";
import ConfirmAlert from "./shared/ConfirmAlert";
import { verificarPerms } from "./shared/GlobalFunctions";

const ProjectsCreator = ({ AuthUser, application, re_render }) => {
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

  // Projects
  const [projects, setProjects] = useState([]);
  const [render, setRender] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/server/project_status_function/get-projects/${application}?fetchAll=true`)
      .then((response) => {
        const {
          data: { fetchedProjects },
        } = response.data;
        setProjects(fetchedProjects);
      })
      .catch((err) => {
        console.log(err.response);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [re_render, render]);

  const [newProject, setNewProject] = useState({
    Application: "CRM",
    Project_Name: "",
    Alert_Email: "",
    Functions_to_Alert: "",
    Domain: ".COM",
    Org: "",
    Token: "",
    Cookie: "",
  });
  const [defaultProject, setDefaultProject] = useState({ ...newProject });
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
  const [project_bell, setProject_bell] = useState(null);
  const [project_id_delete, setProject_id_delete] = useState(null);
  const [popup, setPopup] = useState(null);
  const handlePopUp = (popup, project) => {
    setSettingsNotification({});
    setProject_bell(null);
    setProject_id_delete(null);
    setPopup(popup);
    if (project) {
      setNewProject({ ...project });
      setDomain(project.Domain);
    }
    if (popup === "delete") {
      setProject_id_delete(project.ROWID);
    }
    if (popup === "bell") {
      setProject_bell(project);
    }
  };

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

  const deleteProject = (ROWID) => {
    setLoading(true);
    axios
      .delete(`/server/project_status_function/delete-project/${ROWID}`)
      .then((response) => {
        const {
          data: { deleted },
        } = response.data;
        if (!deleted) {
          handleNotification(false, "Error deleting project");
          return;
        }
        setProjects(projects.filter((project) => project.ROWID !== ROWID));
        handleNotification(true, "Project has been successfully deleted");
      })
      .catch((err) => {
        console.log(err.response);
        handleNotification(false, "Error deleting project");
      })
      .finally(() => {
        setLoading(false);
        handlePopUp();
      });
  };

  const updateProject = () => {
    if (!validate()) return;
    setLoading(true);
    axios
      .post("/server/project_status_function/update-project", {
        newProject,
      })
      .then((response) => {
        const {
          data: { updated },
        } = response.data;
        if (!updated) {
          handleNotification(false, "Error updating project");
          return;
        }
        setProjects(
          projects.map((project) => {
            if (project.ROWID === newProject.ROWID) {
              return newProject;
            }
            return project;
          })
        );
        handlePopUp();
        handleNotification(true, "Project has been successfully updated");
      })
      .catch((err) => {
        console.log(err.response);
        handleNotification(false, "Error updating project");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const refreshProject = async (project) => {
    let enviarMensagem = null;
    if (verificarArrayBell(project)) {
      enviarMensagem = { ROWID: AuthUser.ROWID, Email: AuthUser.Email };
    }
    handleClickAnimation(project.ROWID);
    setLoading(true);
    axios
      .post("/server/project_status_function/refresh-project-creator", {
        project,
        enviarMensagem,
      })
      .then((response) => {
        const {
          data: { updated },
        } = response.data;
        if (!updated) {
          handleNotification(false, `Error refreshing ${project.Project_Name}`);
          return;
        }
        setProjects(
          projects.map((project) => {
            if (project.ROWID === updated.ROWID) {
              return updated;
            }
            return project;
          })
        );
        handleNotification(
          true,
          `${project.Project_Name} has been successfully refreshed`
        );
      })
      .catch((err) => {
        console.log(err.response);
        handleNotification(false, `Error refreshing ${project.Project_Name}`);
      })
      .finally(() => {});
    setLoading(false);
  };

  const [clicked, setClicked] = useState(false);
  const handleClickAnimation = (ROWID) => {
    setClicked(ROWID);
    setTimeout(() => setClicked(false), 1000);
  };

  const verificarArrayBell = (project) => {
    const { Notificar } = project;
    if (!Notificar) return;
    const array = JSON.parse(Notificar);
    return array.includes(AuthUser.ROWID);
  };

  const verificarArrayBellDaily = (project) => {
    const { NotificarDaily } = project;
    if (!NotificarDaily) return;
    const array = JSON.parse(NotificarDaily);
    return array.includes(AuthUser.ROWID);
  };

  const [settingsNotification, setSettingsNotification] = useState({});
  const handleCheckBox = (e, project) => {
    const { name, checked } = e.target;
    setSettingsNotification({ ...settingsNotification, [name]: checked });
  };

  const saveNotificationSettings = (project) => {
    if (!settingsNotification) return;
    axios
      .post("/server/project_status_function/update-bell", {
        project,
        id_AuthUser: AuthUser.ROWID,
        settingsNotification,
      })
      .then((response) => {
        const {
          data: { updatedProject },
        } = response.data;
        if (!updateProject) {
          handleNotification(false, "Error updating Bell");
          return;
        }
        setProjects(
          projects.map((project) => {
            if (project.ROWID === updateProject.ROWID) {
              return updateProject;
            }
            return project;
          })
        );
        setRender(!render);
        handlePopUp();
        handleNotification(true, "Bell has been successfully updated");
      })
      .catch((err) => {
        console.log(err.response);
        handleNotification(false, "Error updating Bell");
      });
  };

  const switchEstadoProjeto = (project) => {
    setLoading(true);
    axios
      .post("/server/project_status_function/update-project-estado", {
        project,
      })
      .then((response) => {
        const {
          data: { updateProject },
        } = response.data;
        if (!updateProject) {
          handleNotification(false, "Error updating project");
          return;
        }
        setProjects(
          projects.map((project) => {
            if (project.ROWID === updateProject.ROWID) {
              return updateProject;
            }
            return project;
          })
        );
        handleNotification(true, "Project has been successfully updated");
      })
      .catch((err) => {
        console.log(err.response);
        handleNotification(false, "Error updating project");
      });
      setLoading(false);
  };

  const perms_delete = verificarPerms(AuthUser.Profile, ["1105000000182356"]);

  return (
    <>
      {loading && <Loading />}

      {showNotification && (
        <Notification Message={messageNoti} Status={statusNoti} />
      )}

      {/* detalhes projecto */}
      {popup === "detalhesProject" && (
        <PopUp onClose={handlePopUp}>
          <div className="form-popup">
            <div className="form-header">
              <h2 className="form-title">
                Project Details<span>&gt; CREATOR</span>
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
                    defaultValue={newProject.Admin_Name}
                    name="Admin_Name"
                    onChange={(e) => handleForm(e)}
                  />
                  <span className="form-error">{errors.Project_Name}</span>
                </div>
                <div className="form-row height-100">
                  <span className="form-row-title">Project Name</span>
                  <input
                    type="text"
                    placeholder="Project Name"
                    defaultValue={newProject.Project_Name}
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
                    defaultValue={newProject.Alert_Email}
                    name="Alert_Email"
                    onChange={(e) => handleForm(e)}
                  />
                  <span className="form-error">{errors.Alert_Email}</span>
                </div>
                <div className="form-row height-100">
                  <span className="form-row-title">Functions to Alert</span>
                  <input
                    type="text"
                    placeholder="Functions to Alert"
                    defaultValue={newProject.Functions_to_Alert}
                    name="Functions_to_Alert"
                    onChange={(e) => handleForm(e)}
                  />
                  <span className="form-error">
                    {errors.Functions_to_Alert}
                  </span>
                </div>
                <div className="form-row">
                  <span className="form-row-title">Cookie</span>
                  <input
                    type="text"
                    placeholder="Cookie"
                    defaultValue={newProject.Cookie}
                    name="Cookie"
                    onChange={(e) => handleForm(e)}
                  />
                  <span className="form-error">{errors.Cookie}</span>
                </div>
              </div>
            </div>
            <div className="form-buttons">
              <button className="btn-primary" onClick={() => updateProject()}>
                Edit Project
              </button>
            </div>
          </div>
        </PopUp>
      )}

      {popup === "delete" && project_id_delete && (
        <ConfirmAlert
          confirm={() => deleteProject(project_id_delete)}
          cancel={() => handlePopUp()}
        />
      )}

      {popup === "bell" && project_bell && (
        <PopUp onClose={handlePopUp}>
          <div className="form-popup">
            <div className="form-header">
              <h2 className="form-title">Notification</h2>
            </div>
            <div className="form-close" onClick={() => handlePopUp()}>
              <X />
            </div>
            <div className="bell-container">
              <div className="bell-container-row">
                <input
                  type="checkbox"
                  name="NotificarDaily"
                  defaultChecked={verificarArrayBellDaily(project_bell)}
                  onChange={(e) => handleCheckBox(e, project_bell)}
                />
                <label htmlFor="">Daily Report</label>
              </div>
              <div className="bell-container-row">
                <input
                  type="checkbox"
                  name="Notificar"
                  defaultChecked={verificarArrayBell(project_bell)}
                  onChange={(e) => handleCheckBox(e, project_bell)}
                />
                <label htmlFor="">Refresh</label>
              </div>
              <button
                className="btn-primary top-20"
                onClick={() => saveNotificationSettings(project_bell)}
              >
                Save Changes
              </button>
            </div>
          </div>
        </PopUp>
      )}

      <div className="all-items-content">
        <table>
          <thead>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td>Admin Name</td>
              <td>Project Name</td>
              <td>Domain</td>
              <td>Last Refresh</td>
              <td>Functions to Alert</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => (
              <tr className="row" key={project.ROWID}>
                <td className="table-mini">
                  <div
                    className={`projeto-status ${
                      project.Estado ? "active" : ""
                    }`}
                    onClick={() => switchEstadoProjeto(project)}
                  ></div>
                </td>
                <td>
                  <div
                    className="bell-btn"
                    onClick={() => handlePopUp("bell", project)}
                  >
                    <div
                      className={`bell-btn-icon ${
                        verificarArrayBell(project) ||
                        verificarArrayBellDaily(project)
                          ? "active"
                          : ""
                      }`}
                    >
                      {verificarArrayBell(project) &&
                      verificarArrayBellDaily(project) ? (
                        <BellRing />
                      ) : verificarArrayBell(project) ? (
                        <Bell />
                      ) : verificarArrayBellDaily(project) ? (
                        <AlarmClock />
                      ) : (
                        <BellOff />
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <div
                    className="refresh-btn"
                    onClick={() => refreshProject(project)}
                  >
                    <div
                      className={`refresh-btn-icon${
                        project.ROWID === clicked ? " rotate-1" : ""
                      }`}
                    >
                      <RefreshCw />
                    </div>
                  </div>
                </td>
                <td>{project.Admin_Name}</td>
                <td>{project.Project_Name}</td>
                <td>{project.Domain}</td>
                <td>{project.Last_Refresh}</td>
                <td>{project.Functions_to_Alert}</td>
                <td className="table-fit">
                  <div className="table-icons">
                    <div
                      className="table-icon view"
                      onClick={() => handlePopUp("detalhesProject", project)}
                    >
                      View Details
                    </div>
                    {perms_delete && (
                      <div
                        className="table-icon delete"
                        onClick={() => handlePopUp("delete", project)}
                      >
                        Delete
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ProjectsCreator;
