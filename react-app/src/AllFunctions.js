import React, { useState, useEffect } from "react";
import axios from "axios";
import { Check, Eye, RefreshCcw, Trash } from "lucide-react";
import "../styles/allFunctions.css";
import "../styles/popup-code.css";
import PopUp from "./shared/PopUp";
import ScriptViewer from "./shared/ScriptViewer";
import Tab from "./shared/Tab";
import { X } from "lucide-react";
import Loading from "./shared/Loading";
import Notification from "./shared/Notification";
import Tabela from "./shared/Tabela";
import ConfirmAlert from "./shared/ConfirmAlert";
import { verificarPerms } from "./shared/GlobalFunctions";

const AllFunctions = ({ AuthUser, projectSelected, cookie, token, org }) => {
  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [permissions, setPermissions] = useState({});
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    async function checkPermissions() {
      try {
        const perms_deleteFunction = await verificarPerms(
          AuthUser,
          "1105000000219624",
          projectSelected
        );
        const perms_refreshProject = await verificarPerms(
          AuthUser,
          "1105000000219615",
          projectSelected
        );
        setPermissions({
          deleteFunction: perms_deleteFunction,
          refreshProject: perms_refreshProject,
        });
        setColumns(
          [
            perms_deleteFunction && {
              formatter: "rowSelection",
              titleFormatter: "rowSelection",
              hozAlign: "left",
              headerSort: false,
              width: "2px",
            },
            {
              title: "Function Name",
              field: "display_name",
              headerFilter: true,
            },
            { title: "Category", field: "category", headerFilter: true },
            { title: "Return", field: "returnType", headerFilter: true },
            { title: "Language", field: "language", headerFilter: true },
            { title: "Updated Time", field: "updatedTime", headerFilter: true },
          ].filter(Boolean)
        );
      } catch (error) {
        console.error(error);
      }
    }

    checkPermissions();
  }, []);

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

  const [popup, setPopup] = useState(false);
  const [functionSelected, setFunctionSelected] = useState(null);
  const [code, setCode] = useState(null);

  const handlePopUp = (popup) => {
    setPopup(popup);
  };

  const [isDeluge, setIsDeluge] = useState(false);
  const handleDeluge = () => {
    setIsDeluge(!isDeluge);
  };

  const handleViewCode = (function_id, language) => {
    setLoading(true);
    setFunctionSelected(null);
    setCode(null);
    language === "deluge" ? setIsDeluge(true) : setIsDeluge(false);
    axios
      .post(`/server/project_status_function/function-viewcode`, {
        projectSelected,
        function_id,
      })
      .then((response) => {
        const {
          data: { function_code },
        } = response.data;
        const func = function_code?.functions[0];
        const script = func?.script;
        if (script) {
          setFunctionSelected(func);
          setCode(script);
          handlePopUp("viewcode");
        } else {
          handleNotification(false, `Script not found`);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const [reload, setReload] = useState(false);
  const handleReload = () => {
    setReload(!reload);
  };

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
      .post("/server/project_status_function/refresh-project", {
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

  const [dataSelected, setDataSelected] = useState([]);
  const handleSelectedData = (data) => {
    setDataSelected(data);
  };

  const deleteFunctions = () => {
    const functionsToDelete = dataSelected.map((item) => {
      return { ROWID: item.ROWID, function_id: item.function_id };
    });
    axios
      .post(`/server/project_status_function/delete-functions`, {
        projectSelected,
        functionsToDelete,
        cookie,
        token,
        org,
      })
      .then((response) => {
        const {
          data: { resp },
        } = response.data;
        if (resp) {
          handleNotification(true, "Functions deleted successfully");
          // const newData = data.filter((item) => {
          //   return dataSelected.some((item2) => {
          //     return item.function_id !== item2.function_id;
          //   });
          // });
          // setData(newData);
          handleReload();
          handlePopUp();
        } else {
          handleNotification(false, "Error deleting functions");
        }
      })
      .catch((err) => {
        console.log(err.response);
        handleNotification(false, "Error deleting functions");
      });
  };

  useEffect(() => {
    if (!projectSelected) return;
    setLoading(true);
    axios
      .post(`/server/project_status_function/get-allFunctions`, {
        projectSelected,
      })
      .then((response) => {
        const {
          data: { allFunctions },
        } = response.data;
        setFunctions(allFunctions);
        const newData = allFunctions.map((item) => {
          return {
            ROWID: item.AllFunctions.ROWID,
            function_id: item.AllFunctions.function_id,
            display_name: item.AllFunctions.display_name,
            category: item.AllFunctions.category,
            returnType: item.AllFunctions.returnType,
            language: item.AllFunctions.language,
            updatedTime: item.AllFunctions.updatedTime,
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
  }, [projectSelected, reload]);

  return (
    <>
      {loading && <Loading />}

      {showNotification && (
        <Notification Message={messageNoti} Status={statusNoti} />
      )}

      {popup === "viewcode" && (
        <PopUp onClose={handlePopUp}>
          <div className="form-close" onClick={() => handlePopUp()}>
            <X />
          </div>
          <div className="popup-code">
            <div className="popup-code-header">
              <h2 className="main-subtitle">
                {functionSelected.display_name ? functionSelected.display_name : functionSelected.name}() 
              </h2>
            </div>
            <div className="popup-code-content">
              <ScriptViewer script={code} isDeluge={isDeluge} />
            </div>
          </div>
        </PopUp>
      )}

      {popup === "delete" && (
        <ConfirmAlert
          confirm={() => deleteFunctions()}
          cancel={() => handlePopUp()}
        />
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
          {dataSelected.length >= 1 && (
            <div
              className="table-icon delete"
              onClick={() => handlePopUp("delete")}
            >
              Delete {dataSelected.length}
            </div>
          )}
        </div>
        {projectSelected && (
          <div className="all-items-content">
            <div className="old-table">
              {/* <table>
            <thead>
              <tr>
                <td>Project</td>
                <td>Name</td>
                <td>Category</td>
                <td>Return</td>
                <td>Language</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {functions.map((func) => {
                const { AllFunctions, Projetos } = func;
                return (
                  <tr key={AllFunctions.ROWID}>
                    <td>{Projetos.Project_Name}</td>
                    <td>{AllFunctions.display_name}</td>
                    <td>{AllFunctions.category}</td>
                    <td>{AllFunctions.returnType}</td>
                    <td>{AllFunctions.language}</td>
                    <td>
                      <div className="table-icons">
                        <div
                          className="table-icon view"
                          onClick={() =>
                            handleViewCode(
                              AllFunctions.function_id,
                              AllFunctions.language
                            )
                          }
                        >
                          View Code
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>             */}
            </div>
            <Tabela
              data={data}
              columns={columns}
              handleSelectedData={handleSelectedData}
              handleViewCode={handleViewCode}
              type={"delete"}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default AllFunctions;
