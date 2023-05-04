import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/dashboard.css";
import Loading from "./shared/Loading";

const DashboardCRM = () => {
  // Loading
  const [loading, setLoading] = useState(false);

  const [dashboardErros, setDashboardErros] = useState([]);

  //boxes
  const [errosTotal, setErrosTotal] = useState(0);
  const [erros7dias, setErros7dias] = useState(0);
  const [errosToday, setErrosToday] = useState(0);

  //top 5
  const [allTime, setAllTime] = useState([]);
  const [last7days, setLast7days] = useState([]);
  const [today, setToday] = useState([]);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/server/project_status_function/get-dashboard-erros/CRM`)
      .then((response) => {
        const {
          data: { dashboardErros },
        } = response.data;
        setDashboardErros(dashboardErros);
        databoxes(dashboardErros);
        setAllTime(getTop5ErrorFunctions(dashboardErros, "all"));
        setLast7days(getTop5ErrorFunctions(dashboardErros, "last7days"));
        setToday(getTop5ErrorFunctions(dashboardErros, "today"));
      })
      .catch((err) => {
        console.log(err.response);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const databoxes = (dashboardErros) => {
    //7 days
    const filteredErrors = dashboardErros.filter((error) => {
      return selecinar_ultimos7dias(error.FailFunctions.failed_time);
    });
    //today
    const filteredErrorsToday = dashboardErros.filter((error) => {
      return selecionar_hoje(error.FailFunctions.failed_time);
    });
    setErrosTotal(dashboardErros.length);
    setErros7dias(filteredErrors.length);
    setErrosToday(filteredErrorsToday.length);
  };

  function getTop5ErrorFunctions(dashboardErros, quais) {
    const newArray = [];

    dashboardErros.forEach((fail) => {
      const { FailFunctions } = fail;
      const Project_Name = fail.Projetos.Project_Name;

      if (quais === "last7days") {
        if (!selecinar_ultimos7dias(FailFunctions.failed_time)) {
          return;
        }
      }

      if (quais === "today") {
        if (!selecionar_hoje(FailFunctions.failed_time)) {
          return;
        }        
      }

      const projectExists = newArray.find(
        (project) => project.Project_Name === Project_Name
      );
      if (projectExists) {
        const functionExists = projectExists.functions.find(
          (func) => func.function_name === FailFunctions.function_name
        );
        if (functionExists) {
          functionExists.count++;
        } else {
          projectExists.functions.push({
            function_name: FailFunctions.function_name,
            count: 1,
          });
        }
      } else {
        newArray.push({
          Project_Name,
          functions: [
            {
              function_name: FailFunctions.function_name,
              count: 1,
            },
          ],
        });
      }

      newArray.forEach((project) => {
        project.functions.sort((a, b) => b.count - a.count);
        project.functions = project.functions.slice(0, 5); //top 5 only
      });
    });

    return newArray;
  }

  const selecionar_hoje = (date) => {
    const today = new Date();
    const failedTime = new Date(date);

    // Format the dates to compare only the date part
    const failedDate = failedTime.toLocaleDateString();
    const todayDate = today.toLocaleDateString();

    return failedDate === todayDate;
  };

  const selecinar_ultimos7dias = (date) => {
    const lastSevenDays = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const failedTime = new Date(date);

    // Format the dates to compare only the date part
    const failedDate = failedTime.toLocaleDateString();
    const lastSevenDaysDate = lastSevenDays.toLocaleDateString();

    return failedDate >= lastSevenDaysDate;
  };

  return (
    <>
      {loading && <Loading />}

      <div className="dashboard-boxes top-20">
        <div className="dashboard-box">
          <div className="dashboard-box-title">Total Errors</div>
          <div className="dashboard-box-info">{errosTotal}</div>
        </div>
        <div className="dashboard-box">
          <div className="dashboard-box-title">Errors in the last 7 days</div>
          <div className="dashboard-box-info">{erros7dias}</div>
        </div>
        <div className="dashboard-box">
          <div className="dashboard-box-title">Errors Today</div>
          <div className="dashboard-box-info">{errosToday}</div>
        </div>
      </div>
      <div className="dashboard-tables">
        {today.length >= 1 && (
          <div className="dashboard-top7days width-100 top-50">
            <h2 className="main-subtitle">Today</h2>
            <div className="dashboard-table top-20">
              <table border="1">
                <thead>
                  <tr>
                    <th rowspan="">Projects</th>
                    <th rowspan="">Functions with Most Errors</th>
                    <th colspan="">Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {today.map((project) => {
                    return (
                      <>
                        <tr>
                          <td rowspan={project.functions.length + 1}>
                            {project.Project_Name}
                          </td>
                        </tr>
                        {project.functions.map((func) => {
                          return (
                            <tr>
                              <td>{func.function_name}</td>
                              <td>{func.count}</td>
                            </tr>
                          );
                        })}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {last7days.length >= 1 && (
          <div className="dashboard-top7days width-100 top-50">
            <h2 className="main-subtitle">Last 7 days</h2>
            <div className="dashboard-table top-20">
              <table border="1">
                <thead>
                  <tr>
                    <th rowspan="">Projects</th>
                    <th rowspan="">Functions with Most Errors</th>
                    <th colspan="">Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {last7days.map((project) => {
                    return (
                      <>
                        <tr>
                          <td rowspan={project.functions.length + 1}>
                            {project.Project_Name}
                          </td>
                        </tr>
                        {project.functions.map((func) => {
                          return (
                            <tr>
                              <td>{func.function_name}</td>
                              <td>{func.count}</td>
                            </tr>
                          );
                        })}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {allTime.length >= 1 && (
          <div className="dashboard-topAllTime width-100 top-50">
            <h2 className="main-subtitle">All Time</h2>
            <div className="dashboard-table top-20">
              <table border="1">
                <thead>
                  <tr>
                    <th rowspan="">Projects</th>
                    <th rowspan="">Functions with Most Errors</th>
                    <th colspan="">Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {allTime.map((project) => {
                    return (
                      <>
                        <tr>
                          <td rowspan={project.functions.length + 1}>
                            {project.Project_Name}
                          </td>
                        </tr>
                        {project.functions.map((func) => {
                          return (
                            <tr>
                              <td>{func.function_name}</td>
                              <td>{func.count}</td>
                            </tr>
                          );
                        })}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardCRM;
