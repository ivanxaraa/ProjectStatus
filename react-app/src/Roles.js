import React, { useEffect, useState } from "react";
import axios from "axios";
import { GripVertical, Plus, Settings, Trash, User } from "lucide-react";
import "../styles/roles.css";
import Notification from "./shared/Notification";
import Loading from "./shared/Loading";
import { X } from "lucide-react";
import PopUp from "./shared/PopUp";
import Tab from "./shared/Tab";
import { CirclePicker } from "react-color";
import ConfirmAlert from "./shared/ConfirmAlert";

const Roles = ({ AuthUser }) => {
  //loading
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const [render, setRender] = useState(false);

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
  useEffect(() => {
    setLoading(true);
    axios
      .get(`/server/project_status_function/all-users`)
      .then((response) => {
        const {
          data: { fetchedUsers },
        } = response.data;
        // const newUsers = fetchedUsers.map((user) => {
        //   if (user.ROWID === AuthUser.ROWID) {
        //     AuthUser.Profile = user.Profile;
        //   }
        //   return user;
        // });
        setUsers(fetchedUsers);
      })
      .catch((err) => {
        console.log(err.response);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [render]);

  //OWNER - 1105000000182359
  //ADMIN - 1105000000182356
  //ROOKIE - 1105000000117726

  const verificarRole = (user_Profile) => {
    if (user_Profile === "1105000000182359") {
      return "Owner";
    } else if (user_Profile === "1105000000182356") {
      return "Admin";
    } else if (user_Profile === "1105000000117726") {
      return "Rookie";
    }
  };

  const switchRole = (ROWID, Profile) => {
    axios
      .post(`/server/project_status_function/switch-role`, {
        ROWID,
        Profile,
      })
      .then((response) => {
        const {
          data: { updateUser },
        } = response.data;
        // const newUsers = users.map((user) => {
        //   if (user.ROWID === updateUser.ROWID) {
        //     return updateUser;
        //   }
        //   return user;
        // });
        // setUsers(newUsers);
        setRender(!render);
      })
      .catch((err) => {
        console.log(err.response);
      });
  };

  const [popup, setPopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUser_beforeUpdate, setSelectedUser_beforeUpdate] =
    useState(null);
  const [userRole, setUserRole] = useState(null);
  const handlePopUp = (popup, user) => {
    if (user) {
      setSelectedUser(user);
      setSelectedUser_beforeUpdate(user);
    }
    setPopup(popup);
  };

  //FOREIGN KEY DO CARGO & PROFILES TUDO NO USER

  // const [data, setData] = useState([
  //   {
  //     section: "Projects",
  //     content: [
  //       { ROWID: "82743247322", Perm: "Refresh Project" },
  //       { ROWID: "82743247323", Perm: "Edit Project" },
  //       { ROWID: "82743247323", Perm: "Delete Project" },
  //     ],
  //   },
  //   {
  //     section: "Functions",
  //     content: [
  //       { ROWID: "82743247322", Perm: "Delete Functions" },
  //     ],
  //   },
  //   {
  //     section: "Roles",
  //     content: [
  //       { ROWID: "82743247322", Perm: "Manage Roles" },
  //     ],
  //   },
  // ]);

  function groupProfilesBySection(profiles) {
    const sections = {};

    // Group data by section
    profiles.forEach((profile) => {
      if (!sections[profile.Section]) {
        sections[profile.Section] = [];
      }
      sections[profile.Section].push(profile);
    });

    // Create output array
    const output = [];
    for (const sectionName in sections) {
      output.push({
        Section: sectionName,
        Content: sections[sectionName],
      });
    }

    return output;
  }

  const [profiles, setProfiles] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#292727");

  const [confirmDelete, setConfirmDelete] = useState(false);

  const colors = [
    "#292727",
    "#ff0000",
    "#ff6600",
    "#ffa500",
    "#ffd700",
    "#ffff00",
    "#adff2f",
    "#00ff00",
    "#00ffff",
    "#0000ff",
    "#8a2be2",
    "#ff00ff",
    "#ff69b4",
    "#f54272",
  ];

  // Adding two new colors

  const handleForm = (e) => {
    const { name, value } = e.target;
    setSelectedRole({ ...selectedRole, [name]: value });
  };

  const handlePermissions = (ROWID_PERM) => {
    const { Profiles } = selectedRole;
    if (Profiles) {
      const arrayPerms = JSON.parse(Profiles);
      if (arrayPerms.includes(ROWID_PERM)) {
        const newArray = arrayPerms.filter((perm) => perm !== ROWID_PERM);
        setSelectedRole({
          ...selectedRole,
          Profiles: JSON.stringify(newArray),
        });
      } else {
        setSelectedRole({
          ...selectedRole,
          Profiles: JSON.stringify([...arrayPerms, ROWID_PERM]),
        });
      }
    } else {
      setSelectedRole({
        ...selectedRole,
        Profiles: JSON.stringify([ROWID_PERM]),
      });
    }
  };

  function handleColorChange(color) {
    setSelectedRole({ ...selectedRole, Color: color.hex });
    setSelectedColor(color.hex);
  }

  const handleSelectedRole = (role) => {
    setActiveTab("Display");
    setSelectedRole(role);
    setSelectedColor(role.Color);
  };

  const [activeTab, setActiveTab] = useState("Display");
  const handleActiveTab = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    //Roles
    axios
      .get(`/server/project_status_function/get-allRoles/`)
      .then((response) => {
        const {
          data: { fetchedRoles },
        } = response.data;
        setSelectedRole(fetchedRoles[0]);
        setRoles(fetchedRoles);
      })
      .catch((err) => {
        console.log(err.response);
      });

    //profiles
    axios
      .get(`/server/project_status_function/get-profiles/`)
      .then((response) => {
        const {
          data: { fetchedProfiles },
        } = response.data;
        setProfiles(groupProfilesBySection(fetchedProfiles));
      })
      .catch((err) => {
        console.log(err.response);
      });
  }, []);

  const verifyPerm = (id_perm) => {
    const { Profiles } = selectedRole;
    const arrayPerms = JSON.parse(Profiles);
    if (!arrayPerms || arrayPerms.length < 1) return false;
    const perm = arrayPerms.find((perm) => String(perm) === id_perm);
    return !!perm;
  };

  const saveRoleChanges = () => {
    if (selectedRole.Name.length > 12) {
      return handleNotification(
        false,
        "Role name must be less than 12 characters"
      );
    }
    axios
      .post(`/server/project_status_function/update-role`, {
        selectedRole,
        AuthUser,
      })
      .then((response) => {
        const { status } = response.data;
        if (status === "failure") {
          return handleNotification(
            false,
            "You do not have permission to update this role"
          );
        }
        const {
          data: { updatedRole },
        } = response.data;
        const newRoles = roles.map((role) => {
          if (role.ROWID === updatedRole.ROWID) {
            return updatedRole;
          }
          return role;
        });
        setRoles(newRoles);
        handleNotification(true, "Role updated successfully");
      })
      .catch((err) => {
        console.log(err.response);
        handleNotification(false, "Error updating role");
      });
  };

  const saveUserChanges = () => {
    axios
      .post(`/server/project_status_function/update-user`, {
        selectedUser_beforeUpdate,
        selectedUser,
        AuthUser,
      })
      .then((response) => {
        const { status } = response.data;
        if (status === "failure") {
          return handleNotification(
            false,
            "You do not have permission to update this user"
          );
        }
        const {
          data: { updatedUser },
        } = response.data;
        const newUsers = users.map((user) => {
          if (user.ROWID === updatedUser.ROWID) {
            return updatedUser;
          }
          return user;
        });
        setUsers(newUsers);
        if (AuthUser.ROWID === updatedUser.ROWID) {
          AuthUser = updatedUser;
        }
        handlePopUp();
        handleNotification(true, "User updated successfully");
      })
      .catch((err) => {
        console.log(err.response);
        handleNotification(false, "Error updating user");
      });
  };

  const createRole = () => {
    axios
      .post(`/server/project_status_function/create-role`, {roles})
      .then((response) => {
        const {
          data: { createdRole },
        } = response.data;
        setRoles([...roles, createdRole].sort((a, b) => a.Power - b.Power));
        handleNotification(true, "Role created successfully");
      })
      .catch((err) => {
        console.log(err.response);
        handleNotification(false, "Error creating role");
      });
  };

  const deleteRole = (selectedRole) => {
    setConfirmDelete(false);
    axios
      .post(`/server/project_status_function/delete-role`, {
        selectedRole,
        AuthUser,
      })
      .then((response) => {
        const { status } = response.data;
        if (status === "failure") {
          return handleNotification(
            false,
            "You do not have permission to delete this role"
          );
        }
        const {
          data: { deletedRole },
        } = response.data;

        const newRoles = roles.filter(
          (role) => role.ROWID !== selectedRole.ROWID
        );
        setRoles(newRoles);
        setSelectedRole(roles[0]);
        handleNotification(true, "Role deleted successfully");
      })
      .catch((err) => {
        console.log(err.response);
        handleNotification(false, "Error deleting role");
      });
  };

  const getRoleColor = (user_role) => {
    const role = roles.find((role) => role.ROWID === user_role);
    return role ? role.Color : "#292727";
  };

  const handleChangeUserRole = (role) => {
    const { ROWID, Profiles } = role;
    setSelectedUser({ ...selectedUser, Role: ROWID, Role_Profiles: Profiles });
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("index", index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, index) => {
    e.preventDefault();
    const sourceIndex = e.dataTransfer.getData("index");
    const draggedRole = roles[sourceIndex];

    if (
      draggedRole.ROWID === "1105000000220001" ||
      draggedRole.ROWID === "1105000000230006"
    ) {
      return handleNotification(false, "This role cannot be changed");
    }

    if (draggedRole.ROWID === AuthUser.Role) {
      return handleNotification(
        false,
        "You do not have permission to update your role"
      );
    }

    const newRoles = [...roles];
    const [removed] = newRoles.splice(sourceIndex, 1);
    newRoles.splice(index, 0, removed);
    // quando pega em outro Role e tentas substitir pelo Rookie
    if (newRoles[sourceIndex].ROWID === "1105000000230006") {
      return handleNotification(false, "This role cannot be changed");
    }

    //same item
    if (index === parseInt(sourceIndex)) return;

    await axios
      .post(`/server/project_status_function/update-roles`, {
        AuthUser,
        newRoles,
        draggedRole,
      })
      .then((response) => {
        const { status } = response.data;
        if (status === "failure") {
          return handleNotification(
            false,
            "You do not have permission to update this role"
          );
        }
        const {
          data: { updatedRoles },
        } = response.data;
        if (!updatedRoles) return;
        setRoles(updatedRoles.sort((a, b) => a.Power - b.Power));
        handleNotification(true, "Roles updated successfully");
      })
      .catch((err) => {
        console.log(err.response);
        handleNotification(false, "Error updating roles");
      });
  };

  return (
    <>
      {loading && <Loading />}

      {showNotification && (
        <Notification Message={messageNoti} Status={statusNoti} />
      )}

      {/* {popup === "roles" && selectedUser && (
        <PopUp onClose={handlePopUp}>
          <div className="form-popup">
            <div className="form-header">
              <h2 className="form-title">
                Permissions<span>&gt; {selectedUser.Nome}</span>
              </h2>
            </div>
            <div className="form-content-roles">
              {data.map((item) => {
                return (
                  <div className="section-box">
                    <div className="section-box-header">
                      <span className="section-box-title">{item.section}</span>
                    </div>
                    <div className="section-content">
                      {item.content.map((content) => (
                        <div className="bell-container-row">
                          <input type="checkbox" />
                          <label htmlFor="">{content.Perm}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="form-close">
              <X />
            </div>
            <div className="form-content"></div>
            <div className="form-buttons">
              <button className="btn-primary">Save Changes</button>
            </div>
          </div>
        </PopUp>
      )} */}

      {popup === "roles" && (
        <PopUp onClose={handlePopUp}>
          <div className="form-popup">
            <div className="roles-popup">
              <div className="form-header">
                <div className="form-antibtw">
                  <h2 className="form-title">Roles</h2>
                  <div className="all-items-add" onClick={() => createRole()}>
                    <Plus />
                  </div>
                </div>
              </div>
              <div className="form-close" onClick={() => handlePopUp()}>
                <X />
              </div>
              <div className="form-contente">
                <div className="content-container">
                  <div className="content-roles">
                    <div className="content-roles-container">
                      {roles.map((item, index) => {
                        const { ROWID, Name, Color, Power } = item;
                        return (
                          <div
                            key={ROWID}
                            className={`role-row ${
                              selectedRole && selectedRole.ROWID === ROWID
                                ? "active"
                                : ""
                            }`}
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e)}
                            onDrop={(e) => handleDrop(e, index)}
                            onClick={() => handleSelectedRole(item)}
                          >
                            <div className="role-drag">
                              <GripVertical />
                            </div>
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
                  <div className="container-button">
                    <div className="content-edit">
                      <div className="content-edit-header">
                        <Tab
                          Name="Display"
                          Active={activeTab}
                          Size={"Form"}
                          onClick={() => handleActiveTab("Display")}
                        />
                        {selectedRole.ROWID !== "1105000000220001" && (
                          // selectedRole.ROWID !== "1105000000230006" && (
                          <Tab
                            Name="Permissions"
                            Active={activeTab}
                            Size={"Form"}
                            onClick={() => handleActiveTab("Permissions")}
                          />
                        )}
                      </div>
                      <div className="edit-content">
                        {activeTab === "Display" && (
                          <div className="display">
                            <div className="form-row height-100">
                              <span className="form-row-title">Role Name</span>
                              <input
                                type="text"
                                placeholder="Role Name"
                                value={selectedRole.Name}
                                name="Name"
                                onChange={(e) => handleForm(e)}
                              />
                            </div>
                            <div className="form-row height-100">
                              <span className="form-row-title">Role Color</span>
                              <div className="form-color">
                                <div
                                  className="color-viewer"
                                  style={{ backgroundColor: selectedColor }}
                                ></div>
                                <CirclePicker
                                  colors={colors}
                                  onChange={handleColorChange}
                                  circleSize={32}
                                  circleSpacing={8}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        {activeTab === "Permissions" && (
                          <div className="permissions">
                            {profiles.map((item) => {
                              const { Content, Section } = item;
                              if (Section === "null") return;
                              return (
                                <div className="section-box">
                                  <div className="section-box-header">
                                    <span className="form-row-title">
                                      {Section}
                                    </span>
                                  </div>
                                  <div className="section-content">
                                    {Content.map((item) => {
                                      const { ROWID, Nome } = item;
                                      return (
                                        <div className="bell-container-row">
                                          <input
                                            type="checkbox"
                                            onClick={() =>
                                              handlePermissions(ROWID)
                                            }
                                            checked={verifyPerm(ROWID)}
                                          />
                                          <label htmlFor="">{Nome}</label>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="form-buttons">
                      <div className="buttons-side">
                        <button
                          className="btn-primary"
                          onClick={() => saveRoleChanges()}
                        >
                          Save Changes
                        </button>
                        {selectedRole.ROWID !== "1105000000220001" &&
                          selectedRole.ROWID !== "1105000000230006" && (
                            <button
                              className="btn-delete"
                              onClick={() => setConfirmDelete(true)}
                            >
                              <Trash strokeWidth={1.5} />
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PopUp>
      )}

      {confirmDelete && (
        <ConfirmAlert
          item={selectedRole.Name}
          confirm={() => deleteRole(selectedRole)}
          cancel={() => setConfirmDelete(false)}
        />
      )}

      {popup === "role-user" && selectedUser && (
        <PopUp onClose={handlePopUp}>
          <div className="form-popup">
            <div className="role-popup">
              <div className="form-header">
                <div className="form-antibtw">
                  <h2 className="form-title">{selectedUser.Nome}</h2>
                </div>
              </div>
              <div className="form-close" onClick={() => handlePopUp()}>
                <X />
              </div>
              <div className="form-contente">
                <div className="content-container">
                  <div className="content-roles">
                    <div className="content-roles-container">
                      {roles.map((item) => {
                        const { ROWID, Name, Color, Power } = item;
                        return (
                          <div
                            key={ROWID}
                            className={`role-row ${
                              selectedUser.Role === ROWID ? "active" : ""
                            }`}
                            onClick={() => handleChangeUserRole(item)}
                          >
                            <div
                              className="role-color"
                              style={{ backgroundColor: Color }}
                            ></div>
                            <div className="role-name">{Name}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-buttons">
                <div className="buttons-side">
                  <button
                    className="btn-primary"
                    onClick={() => saveUserChanges()}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </PopUp>
      )}

      <div className="all-items">
        <div className="all-items-container">
          <div className="all-items-header">
            <div className="all-items-header-left">
              <h2 className="main-subtitle">
                Manage Roles
                <Settings
                  className="title-icon"
                  strokeWidth={1.5}
                  onClick={() => handlePopUp("roles")}
                />
              </h2>
            </div>
          </div>
          <div className="all-items-content">
            <table>
              <thead>
                <tr>
                  <td></td>
                  <td>Name</td>
                  <td>Email</td>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const { ROWID, Nome, Email, Role } = user;
                  return (
                    <tr
                      className="click"
                      onClick={() => handlePopUp("role-user", user)}
                    >
                      {/* <td className="table-mini">
                        <button
                          className="switch-role"
                          onClick={() => handlePopUp("roles", user)}
                        >
                          <Settings className="roles-icons" />
                          {verificarRole(Profile) === "Owner" ? (
                            <Crown className="roles-icons" />
                          ) : verificarRole(Profile) === "Admin" ? (
                            <UserCog className="roles-icons" />
                          ) : (
                            <User className="roles-icons" />
                          )}
                        </button>
                      </td> */}
                      <td>
                        <div
                          className="role-color"
                          style={{ backgroundColor: getRoleColor(Role) }}
                        ></div>
                      </td>
                      <td>{Nome}</td>
                      <td>{Email}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Roles;
