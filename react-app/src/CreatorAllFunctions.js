import React, { useEffect, useState } from "react";
import Tabela from "./shared/Tabela";
import { RefreshCcw } from "lucide-react";
import Notification from "./shared/Notification";
import Loading from "./shared/Loading";
import axios from "axios";
import { verificarPerms } from "./shared/GlobalFunctions";

const CreatorAllFunctions = ({ AuthUser, projectSelected, appSelected }) => {
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

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([
    { title: "Function Name", field: "display_name", headerFilter: true },
    { title: "Event Date", field: "event_date", headerFilter: true },
    { title: "Function Type", field: "function_type", headerFilter: true },
  ]);

  const [reload, setReload] = useState(false);
  const handleReload = () => {
    setReload(!reload);
  };

  useEffect(() => {
    if (!projectSelected) return;
    setLoading(true);
    axios
      .post(`/server/project_status_function/get-allFunctions`, {
        projectSelected,
        appSelected,
      })
      .then((response) => {
        const {
          data: { allFunctions },
        } = response.data;
        const newData = allFunctions.map((item) => {
          return {
            display_name: item.AllFunctions.display_name,
            event_date: item.AllFunctions.event_date,
            function_type: item.AllFunctions.function_type,            
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
    handleClickAnimation();
    setLoading(true);
    const onlyAll = true;
    axios
      .post("/server/project_status_function/refresh-project-creator", {
        project,
        onlyAll,
      })
      .then((response) => {
        const {
          data: { writen_fails },
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
      })
      .finally(() => {});
    setLoading(false);
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
            <h2 className="main-subtitle">Functions</h2>
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

export default CreatorAllFunctions;
