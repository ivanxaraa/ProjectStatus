import "../styles/sidebar.css";
import "../styles/main.css";
import React, { useState, useEffect } from "react";
import Projects from "./Projects";
import Functions from "./Functions";
import Dashboard from "./Dashboard";
import Login from "./Login";
import Cookies from "js-cookie";
import Sidebar from "./shared/Sidebar";
import Roles from "./Roles";

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [AuthUser, setAuthUser] = useState(null);

  const handleLogin = (userData) => {
    setAuthUser(userData);
    setIsAuth(true);
  };

  const [activeTab, setActiveTab] = useState("Dashboard");

  function handleTabClick(tabName) {
    setActiveTab(tabName);
  }

  useEffect(() => {
    const isLogged = Cookies.get("authUser");
    if (isLogged) {
      handleLogin(JSON.parse(isLogged));
    }

    //redirect avaliar
    const params = new URLSearchParams(window.location.search);
    const idEvento = params.get("idEvento");
    const mostrarAvaliar = params.get("mostrarAvaliar");
    if (idEvento) {
      Cookies.set("idEvento", idEvento, { expires: 1 });
      Cookies.set("mostrarAvaliar", mostrarAvaliar, { expires: 1 });
    }
  }, []);

  const [ativarPopUp_AddProject, setAtivarPopUp_AddProject] = useState({
    ativar: false,
    project: null,
  });
  const handleAddProject = (project) => {
    console.log("handleAddProject");
    setAtivarPopUp_AddProject({ ativar: true, project });
    setActiveTab("Projects");
  };

  const clearPopUp_AddProject = () => {
    setAtivarPopUp_AddProject({ ativar: false, project: null });
  };


  return (
    <>
      {!isAuth ? (
        <Login auth={handleLogin} />
      ) : (
        <div className="App">
          <Sidebar
            AuthUser={AuthUser}
            handleTabClick={handleTabClick}
            activeTab={activeTab}
          />
          <div className="main">
            <div className="main-container">
              {(() => {
                switch (activeTab) {
                  case "Dashboard":
                    return <Dashboard />;
                  case "Projects":
                    return (
                      <Projects
                        AuthUser={AuthUser}
                        handleAddProject={handleAddProject}
                        ativarPopUp={ativarPopUp_AddProject}
                        clearPopUp_AddProject={clearPopUp_AddProject}
                      />
                    );
                  case "All Functions":
                    return (
                      <Functions
                        AuthUser={AuthUser}
                        handleAddProject={handleAddProject}
                        type="All Functions"
                      />
                    );
                  case "Function Fails":
                    return (
                      <Functions
                        AuthUser={AuthUser}
                        handleAddProject={handleAddProject}
                        type="Function Fails"
                      />
                    );
                  case "Roles":
                    return <Roles AuthUser={AuthUser} />;
                  default:
                    return <h1>Default Content</h1>;
                }
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
