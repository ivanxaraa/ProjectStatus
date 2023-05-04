import React, { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import axios from "axios";
import "../styles/allFunctions.css";
import Loading from "./shared/Loading";
import Tabela from "./shared/Tabela";
import Notification from "./shared/Notification";

const FunctionFails = ({ AuthUser, projectSelected }) => {
  // Loading
  const [loading, setLoading] = useState(false);
  const [functionsFails, setFunctionsFails] = useState([]);

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([
    // {formatter:"rownum", hozAlign:"center", width:50, headerSort:false},
    // { title: "Project", field: "Project_Name", headerFilter: true },
    // {formatter:"rowSelection", titleFormatter:"rowSelection", hozAlign:"left", width:"2px", headerSort:false, cellClick:function(e, cell){
    //   cell.getRow().toggleSelect();
    //   console.log("boas");
    // }},
    { title: "Function Name", field: "function_name", headerFilter: true },
    { title: "Module", field: "module", headerFilter: true },
    { title: "Failed Time", field: "failed_time", headerFilter: true },
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
    if (!projectSelected) return;
    setLoading(true);
    axios
      .get(
        `/server/project_status_function/get-failFunctions/${projectSelected.ROWID}`
      )
      .then((response) => {
        const {
          data: { failFunctions },
        } = response.data;
        setFunctionsFails(failFunctions);
        console.log(failFunctions);
        const newData = failFunctions.map((item) => {
          return {
            // Project_Name: item.Projetos.Project_Name,
            function_name: item.FailFunctions.function_name,
            module: item.FailFunctions.module,
            failed_time: item.FailFunctions.failed_time,
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
    handleClickAnimation();
    setLoading(true);
    const onlyFails = true;
    axios
      .post("/server/project_status_function/refresh-project", {
        project,
        onlyFails,
        enviarMensagem,
      })
      .then((response) => {
        const {
          data: { allFunctions },
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

  const verificarArrayBell = (project) => {
    const { Notificar } = project;
    if (!Notificar) return;
    const array = JSON.parse(Notificar);
    return array.includes(AuthUser.ROWID);
  };

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
            <div
              className={`refresh-circle ${clicked ? "rotate-1" : ""}`}
              onClick={() => refreshProject(projectSelected)}
            >
              <RefreshCcw />
            </div>
          </div>
        </div>
        {projectSelected && (
          <div className="all-items-content">
            <div className="old-table">
              {/* <table>
            <thead>
              <tr>
                <td>Project</td>
                <td>Function Name</td>
                <td>Module</td>
                <td>Failed Time</td>
              </tr>
            </thead>
            <tbody>
              {functionsFails.map((fail) => {
                const { FailFunctions, Projetos } = fail;
                return (
                  <tr key={FailFunctions.ROWID}>
                    <td>{Projetos.Project_Name}</td>
                    <td>{FailFunctions.function_name}</td>
                    <td>{FailFunctions.module}</td>
                    <td>{FailFunctions.failed_time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table> */}
            </div>
            <Tabela data={data} columns={columns} />
          </div>
        )}
      </div>
    </>
  );
};

export default FunctionFails;
