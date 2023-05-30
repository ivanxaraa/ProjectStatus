import React, { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import axios from "axios";
import "../styles/allFunctions.css";
import Loading from "./shared/Loading";
import Tabela from "./shared/Tabela";
import Notification from "./shared/Notification";
import { verificarPerms } from "./shared/GlobalFunctions";

const CreatorFunctionFails = ({ AuthUser, projectSelected, appSelected }) => {
  // Loading
  const [loading, setLoading] = useState(false);
  const [functionsFails, setFunctionsFails] = useState([]);

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([
    { title: "Module", field: "module", headerFilter: true },
    { title: "Reason", field: "reason", headerFilter: true },
    { title: "Type", field: "type", headerFilter: true },
    { title: "Failed Time", field: "failed_time", headerFilter: true },
    { title: "User", field: "user", headerFilter: true },
  ]);

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

  const [reload, setReload] = useState(false);
  const handleReload = () => {
    setReload(!reload);
  };

  //function fails
  useEffect(() => {
    if (!projectSelected || !appSelected) return;
    setLoading(true);
    axios
      .post(`/server/project_status_function/get-failFunctions`, {
        projectSelected,
        appSelected,
      })
      .then((response) => {
        const {
          data: { failFunctions },
        } = response.data;
        setFunctionsFails(failFunctions);
        const newData = failFunctions.map((item) => {
          return {
            module: item.FailFunctions.module,
            reason: item.FailFunctions.reason,
            failed_time: item.FailFunctions.failed_time,
            type: item.FailFunctions.type,
            user: item.FailFunctions.Utilizador,
          };
        });
        setData(newData);
      })
      .catch((err) => {
        console.log(err.response);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectSelected, appSelected, reload]);

  const [clicked, setClicked] = useState(false);
  const handleClickAnimation = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 1000);
  };

  const refreshProject = async (project) => {
    let enviarMensagem = null;
    if (verificarArrayBell(project)) {
      enviarMensagem = { ROWID: AuthUser.ROWID, Email: AuthUser.Email };
    }
    handleClickAnimation(project.ROWID);
    setLoading(true);
    const onlyFails = true;
    axios
      .post("/server/project_status_function/refresh-project", {
        project,
        onlyFails,
        appSelected,
        enviarMensagem,
      })
      .then((response) => {
        const {
          data: { updated },
        } = response.data;
        handleNotification(
          true,
          `${project?.Project_Name} has been successfully refreshed`
        );
        handleReload();
      })
      .catch((err) => {
        console.log(err.response);
        handleNotification(false, `Error refreshing ${project?.Project_Name}`);
      });
    setLoading(false);
  };

  const verificarArrayBell = (project) => {
    const { Notificar } = project;
    if (!Notificar) return;
    const array = JSON.parse(Notificar);
    return array.includes(AuthUser.ROWID);
  };

  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    async function checkPermissions() {
      try {
        const perms_refreshProject = await verificarPerms(
          AuthUser,
          "1105000000219615",
          projectSelected
        );
        setPermissions({
          refreshProject: perms_refreshProject,
        });
      } catch (error) {
        console.error(error);
      }
    }
    checkPermissions();
  }, []);

  return (
    <>
      {loading && <Loading />}

      {showNotification && (
        <Notification Message={messageNoti} Status={statusNoti} />
      )}

      <div className="all-items-container">
        <div className="main-flex">
          <div className="main-left">
            <h2 className="main-subtitle">Functions Fails</h2>
            {permissions["refreshProject"] && (
              <div
                className={`refresh-circle ${clicked ? "rotate-1" : ""}`}
                onClick={() => refreshProject(projectSelected)}
              >
                <RefreshCcw />
              </div>
            )}
          </div>
        </div>
        {projectSelected && (
          <div className="all-items-content">
            <Tabela data={data} columns={columns} />
          </div>
        )}
      </div>
    </>
  );
};

export default CreatorFunctionFails;
