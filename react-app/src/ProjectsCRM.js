import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import {
  RefreshCw,
  X,
  Bell,
  BellRing,
  BellOff,
  AlarmClock,
  Eye,
  Minus,
  Plus,
  Share2Icon,
} from "lucide-react";
import PopUp from "./shared/PopUp";
import Tab from "./shared/Tab";
import Notification from "./shared/Notification";
import Loading from "./shared/Loading";
import ConfirmAlert from "./shared/ConfirmAlert";
import { EyeOff } from "lucide-react";
import MiniPopUp from "./shared/MiniPopUp";
import {
  verificarPerms,
  sharedProjects,
  shareProjectWith,
} from "./shared/GlobalFunctions";
import CollapseItem from "./shared/CollapseItem";
import Tabela, { ref } from "./shared/Tabela";

const ProjectsCRM = ({ AuthUser, re_render, editProject, clearEditProject }) => {
  // Loading
  const [loading, setLoading] = useState(false);

  const [permissions, setPermissions] = useState({});
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function checkPermissions() {
      try {
        const perms_refreshProject = await verificarPerms(
          AuthUser,
          "1105000000219615"
        );
        const perms_editProject = await verificarPerms(
          AuthUser,
          "1105000000219618"
        );
        const perms_deleteProject = await verificarPerms(
          AuthUser,
          "1105000000219621"
        );
        setPermissions({
          refreshProject: perms_refreshProject,
          editProject: perms_editProject,
          deleteProject: perms_deleteProject,
        });
      } catch (error) {
        console.error(error);
      }
    }
    checkPermissions();
  }, []);


  //auto edit project when editProject is true
  useEffect(() => {
    if (editProject) {
      handlePopUp("detalhesProject", {...editProject});
      clearEditProject();
    }
  }, [editProject]);

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

  const [projectOwner, setProjectOwner] = useState([]);
  const verify_createdby = (projects) => {
    const projectOwned = projects.filter(
      (project) => project.CreatedBy === AuthUser.ROWID
    );
    setProjectOwner(projectOwned.map((project) => project.ROWID));
  };

  const verify_Owner = (project) => {
    return projectOwner.includes(project.ROWID);
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/server/project_status_function/all-projects`)
      .then((response) => {
        const {
          data: { fetchedProjects },
        } = response.data;
        const filteredProjects = fetchedProjects.filter((project) =>
          sharedProjects(AuthUser, project)
        );
        setProjects(filteredProjects);
        verify_createdby(filteredProjects);
      })
      .catch((err) => {
        console.log(err.response);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [re_render, render]);

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

  const [newProject, setNewProject] = useState({
    AppsDetails: {
      CREATOR: [
        {
          App_Name: "",
          Cookie: "",
        },
      ],
    },
    Domain: domain,
  });
  const [defaultProject, setDefaultProject] = useState({ ...newProject });

  const [selectedUsersRoles, setSelectedUsersRoles] = useState([]);
  const handleSelectedUser = (item) => {
    const { ROWID } = item;
    if (selectedUsersRoles.find((id) => id === ROWID)) {
      setSelectedUsersRoles((prevUsers) =>
        prevUsers.filter((id) => id !== ROWID)
      );
    } else {
      setSelectedUsersRoles((prevUsers) => [...prevUsers, item.ROWID]);
    }
  };

  const handleSelectAll = () => {
    setSelectedUsersRoles([]);
  }

  const saveChangesShareProject = () => {
    project_selected.Users = JSON.stringify(selectedUsersRoles);
    axios
      .post(`/server/project_status_function/update-project`, {
        newProject: project_selected,
      })
      .then((response) => {
        const {
          data: { updated },
        } = response.data;
        if (updated) {
          handleNotification(true, "Project sucessfully updated");
          setRender(!render);
        }
        handlePopUp();
      })
      .catch((err) => {
        console.log(err.response);
        handleNotification(false, "Error updating project");
      });
  };

  // Pop up
  const [project_selected, setProject_selected] = useState(null);
  const [popup, setPopup] = useState(null);
  const handlePopUp = (popup, project) => {
    setSettingsNotification({});
    setProject_selected(null);
    setPopup(popup);

    if (project) {
      setProject_selected(project);

      if (popup === "shareProject") {
        if (!check_fetch?.users) fetchUsers();
        setSelectedUsersRoles(project.Users ? JSON.parse(project.Users) : []);
      }

      const updatedProject = {
        ...project,
        AppsDetails:
          typeof project.AppsDetails !== "object"
            ? JSON.parse(project.AppsDetails)
            : project.AppsDetails,
      };
      setNewProject(updatedProject);
      setDomain(updatedProject.Domain);
    }
  };

  console.log("TESTE");

  const [check_fetch, setCheck_fetch] = useState({});
  const fetchUsers = () => {
    //fetch users
    setLoading(true);
    axios
      .get(`/server/project_status_function/all-users`)
      .then((response) => {
        const {
          data: { fetchedUsers },
        } = response.data;
        setUsers(fetchedUsers);
        setCheck_fetch({ ...check_fetch, users: true });
      })
      .catch((err) => {
        console.log(err.response);
      });
    setLoading(false);
  };

  const [roles, setRoles] = useState([]);
  const fetchRoles = () => {
    //fetch roles
    axios
      .get(`/server/project_status_function/get-allRoles/`)
      .then((response) => {
        const {
          data: { fetchedRoles },
        } = response.data;
        setRoles(fetchedRoles);
        setCheck_fetch({ ...check_fetch, roles: true });
      })
      .catch((err) => {
        console.log(err.response);
      });
  };

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
      if (app.App_Name || app.Cookie || Admin_Name) {
        preenchido = true;
        //algum esta preenchido
        if (!app.App_Name)
          errors[`CREATOR_App_Name_${index}`] = "App name is required";
        if (!app.Cookie)
          errors[`CREATOR_Cookie_${index}`] = "Cookie is required";
      }
    });

    if (!preenchido) {
      handleNotification(false, "At least one application must be filled in");
      return false;
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const deleteProject = (project) => {
    const { ROWID } = project;
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
    if (!project.Estado) {
      handleNotification(false, `${project.Project_Name} is not active`);
      return;
    }
    const { Functions_to_Alert } = project;
    let enviarMensagem = null;
    if (verificarArrayBell(project)) {
      enviarMensagem = { ROWID: AuthUser.ROWID, Email: AuthUser.Email };
    }
    handleClickAnimation(project.ROWID);
    setLoading(true);
    axios
      .post("/server/project_status_function/refresh-project", {
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

  const [showPassword, setShowPassword] = useState(false);
  const handleShowPassoword = () => {
    setShowPassword(!showPassword);
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

  const [searchbar, setSearchBar] = useState("");
  const handleSearchBar = (e) => {
    const { value } = e.target;
    setSearchBar(value);
  };

  const [activeTab, setActiveTab] = useState("Users");
  const handleActiveTab = (tab) => {
    setActiveTab(tab);
    if (tab === "Roles" && !check_fetch?.roles) {
      fetchRoles();
    }
  };
  

  return (
    <>
      {loading && <Loading />}

      {showNotification && (
        <Notification Message={messageNoti} Status={statusNoti} />
      )}

      {/* detalhes projecto */}
      {popup === "detalhesProject" && project_selected && (
        <PopUp onClose={handlePopUp}>
          <div className="form-popup">
            <div className="form-header">
              <h2 className="form-title">
                Project Details{" "}
                <span>&gt; {project_selected?.Project_Name}</span>
              </h2>
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
                    <div className="input-with-icon">
                      <input
                        type="text"
                        placeholder="Email"
                        name="SuperAdmin_Email"
                        defaultValue={newProject.SuperAdmin_Email}
                        onChange={(e) => handleForm(e)}
                      />
                      <div className="multi-icon">
                        <MiniPopUp Copy={newProject.SuperAdmin_Email} />
                      </div>
                    </div>
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
                        <MiniPopUp Copy={newProject.SuperAdmin_Password} />
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
                <CollapseItem title="CREATOR" isOpenedProp={!!editProject}>
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
                        value={
                          newProject.AppsDetails?.CREATOR[0]?.App_Name
                            ? newProject.AppsDetails?.CREATOR[0]?.App_Name
                            : ""
                        }
                        onChange={(e) => handleFormNormal(e, "CREATOR", 0)}
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
                        value={
                          newProject.AppsDetails?.CREATOR[0]?.Cookie
                            ? newProject.AppsDetails?.CREATOR[0]?.Cookie
                            : ""
                        }
                        onChange={(e) => handleFormNormal(e, "CREATOR", 0)}
                      />
                      <span className="form-error">
                        {errors[`CREATOR_Cookie_${0}`]}
                      </span>
                    </div>
                  </div>
                  {newProject.AppsDetails.CREATOR.map((creator, index) => {
                    if (index === 0) return;
                    return (
                      <div
                        className="form-fixed-row"
                        id="first-row"
                        key={index}
                      >
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
                    );
                  })}
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
              <button className="btn-primary" onClick={() => updateProject()}>
                Edit Project
              </button>
            </div>
          </div>
        </PopUp>
      )}

      {popup === "shareProject" && project_selected && (
        <PopUp onClose={handlePopUp}>
          <div className="form-popup">
            <div className="form-header">
              <h2 className="form-title">
                Share Project <span>&gt; {project_selected.Project_Name}</span>
              </h2>
            </div>
            <div className="form-close" onClick={() => handlePopUp()}>
              <X />
            </div>
            <div className="share-project all-items-content">
              <div className="content-edit-header">
                <Tab
                  Name="Users"
                  Active={activeTab}
                  Size={"Form"}
                  onClick={() => handleActiveTab("Users")}
                />
                <Tab
                  Name="Roles"
                  Active={activeTab}
                  Size={"Form"}
                  onClick={() => handleActiveTab("Roles")}
                />
              </div>
              {activeTab === "Users" ? (
                <div className="tab-users">
                  <input
                    className="top-20"
                    type="text"
                    placeholder="Search User"
                    style={{ width: "100%" }}
                    onChange={(e) => handleSearchBar(e)}
                  />
                  <div
                    className="form-scroll padding-0 top-20 min-height-350
              "
                  >
                    <table style={{ width: "100%" }}>
                      <thead>
                        <tr>
                          <th className="table-checkbox">
                            <input type="checkbox" onChange={handleSelectAll}/>
                          </th>
                          <th>Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users
                          .filter((user) =>
                            user.Nome.toLowerCase().includes(
                              searchbar.toLowerCase()
                            )
                          )
                          .map((user) => (
                            <tr key={user.id}>
                              <td>
                                <input
                                  type="checkbox"
                                  defaultChecked={selectedUsersRoles.includes(
                                    user.ROWID
                                  )}
                                  onClick={() => handleSelectedUser(user)}
                                />
                              </td>
                              <td>{user.Nome}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="tab-roles">
                  <div
                    className="form-scroll padding-0 top-20 min-height-350
              "
                  >
                    <div className="content-roles">
                      <div className="content-roles-container">
                        {roles.map((role) => {
                          const { ROWID, Name, Color, Power } = role;
                          return (
                            <div
                              className={`role-row big ${
                                selectedUsersRoles.includes(ROWID)
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() => handleSelectedUser(role)}
                            >
                              <div
                                className="role-color"
                                style={{ backgroundColor: Color }}
                              />
                              <div className="role-name">{Name}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="form-buttons">
              <button
                className="btn-primary"
                onClick={() => saveChangesShareProject()}
              >
                Save Changes
              </button>
            </div>
          </div>
        </PopUp>
      )}

      {popup === "delete" && project_selected && (
        <ConfirmAlert
          item={project_selected.Project_Name}
          confirm={() => deleteProject(project_selected)}
          cancel={() => handlePopUp()}
        />
      )}

      {popup === "bell" && project_selected && (
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
                  defaultChecked={verificarArrayBellDaily(project_selected)}
                  onChange={(e) => handleCheckBox(e, project_selected)}
                />
                <label htmlFor="">Daily Report</label>
              </div>
              <div className="bell-container-row">
                <input
                  type="checkbox"
                  name="Notificar"
                  defaultChecked={verificarArrayBell(project_selected)}
                  onChange={(e) => handleCheckBox(e, project_selected)}
                />
                <label htmlFor="">Refresh</label>
              </div>
              <button
                className="btn-primary top-20"
                onClick={() => saveNotificationSettings(project_selected)}
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
              {permissions["refreshProject"] && <td></td>}
              <td>Admin Name</td>
              <td>Project Name</td>
              <td>Domain</td>
              <td>Last Refresh</td>
              {/* <td>Functions to Alert</td> */}
              {(permissions["editProject"] || permissions["deleteProject"]) && (
                <td></td>
              )}
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => {
              const isOwner = verify_Owner(project);
              return (
                <tr className="row" key={project.ROWID}>
                  <td className="table-mini">
                    <div
                      className={`projeto-status ${
                        project.Estado ? "active" : ""
                      }`}
                      onClick={() => switchEstadoProjeto(project)}
                    ></div>
                  </td>
                  <td id="relogio">
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
                  {(permissions["refreshProject"] || isOwner) && (
                    <td id="refresh">
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
                  )}
                  <td>{project.Admin_Name}</td>
                  <td>{project.Project_Name}</td>
                  <td>{project.Domain}</td>
                  <td>{project.Last_Refresh}</td>
                  {/* <td>{project.Functions_to_Alert}</td> */}
                  {(permissions["editProject"] ||
                    permissions["deleteProject"] ||
                    isOwner) && (
                    <td className="table-fit">
                      <div className="table-icons">
                        {shareProjectWith(AuthUser, project) && (
                          <div
                            className="table-icon"
                            onClick={() => handlePopUp("shareProject", project)}
                          >
                            <Share2Icon strokeWidth={1.4} size={18} />
                          </div>
                        )}
                        {(permissions["editProject"] || isOwner) && (
                          <div
                            className="table-icon view"
                            onClick={() =>
                              handlePopUp("detalhesProject", project)
                            }
                          >
                            Details
                          </div>
                        )}
                        {(permissions["deleteProject"] || isOwner) && (
                          <div
                            className="table-icon delete"
                            onClick={() => handlePopUp("delete", project)}
                          >
                            Delete
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ProjectsCRM;
