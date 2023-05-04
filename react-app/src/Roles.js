import React, { useEffect, useState } from "react";
import axios from "axios";
import { Crown, User, UserCog } from "lucide-react";
import "../styles/roles.css";
import Notification from "./shared/Notification";


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
        const newUsers = fetchedUsers.map((user) => {
          if (user.ROWID === AuthUser.ROWID) {
            AuthUser.Profile = user.Profile;
          }
          return user;
        })
        setUsers(newUsers);
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

  const verificarPermissons = (user_Profile) => {
    if(user_Profile === AuthUser.Profile) return false; //Mesmo Cargo
    if(user_Profile === "1105000000182359") return false; //Owner
    if(AuthUser.Profile === "1105000000117726") return false; //Rookie
    return true;
  };

  const switchRole = (ROWID, Profile) => {
    if (!verificarPermissons(Profile)) {
      handleNotification(
        false,
        "You don't have permission to change the role of this user"
      );
      return;
    }
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

  return (
    <>
      {showNotification && (
        <Notification Message={messageNoti} Status={statusNoti} />
      )}

      <div className="all-items">
        <div className="all-items-container">
          <div className="all-items-header">
            <div className="all-items-header-left">
              <h2 className="main-subtitle">Manage Roles</h2>
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
                  const { ROWID, Nome, Email, Profile } = user;
                  return (
                    <tr className="row">
                      <td className="table-mini">
                        <button
                          className="switch-role"
                          onClick={() => switchRole(ROWID, Profile)}
                        >
                          {verificarRole(Profile) === "Owner" ? (
                            <Crown className="roles-icons" />
                          ) : verificarRole(Profile) === "Admin" ? (
                            <UserCog className="roles-icons" />
                          ) : (
                            <User className="roles-icons" />
                          )}
                        </button>
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
