const express = require("express");
const catalystSDK = require("zcatalyst-sdk-node");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");

const app = express();
app.use(express.json());

function initializeCatalyst(req, res, next) {
  const catalyst = catalystSDK.initialize(req);
  res.locals.catalyst = catalyst;
  next();
}

function decodeJWT(token) {
  const decoded = jwt.decode(token);
  return decoded;
}

async function getAllProjects(req, res) {
  try {
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();

    const projetos = await zcql.executeZCQLQuery(`SELECT * FROM Projetos`);
    const fetchedProjects = projetos.map((row) => row.Projetos);

    res.status(200).send({
      status: "success",
      data: { fetchedProjects },
    });

    return fetchedProjects;
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
}

async function getProjects(req, res) {
  try {
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();
    const { APPLICATION } = req.params;
    const { fetchAll = false } = req.query;

    const projetos = await zcql.executeZCQLQuery(
      `SELECT * FROM Projetos WHERE Application = ${APPLICATION} ${fetchAll ? '' : 'AND Estado = true'}`
    );
    const fetchedProjects = projetos.map((row) => row.Projetos);

    res.status(200).send({
      status: "success",
      data: { fetchedProjects },
    });

    return fetchedProjects;
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
}

async function createProject(req, res) {
  try {
    const { catalyst } = res.locals;
    const { newProject } = req.body;

    const tableProjects = catalyst.datastore().table("Projetos");
    const created = await tableProjects.insertRow(newProject);

    if (!created) return;

    res.status(200).send({
      status: "success",
      data: {
        created,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
}

async function deleteProject(req, res) {
  try {
    const { catalyst } = res.locals;
    const { ROWID } = req.params;

    const tableProjects = catalyst.datastore().table("Projetos");
    const deleted = await tableProjects.deleteRow(ROWID);

    if (!deleted) return;

    res.status(200).send({
      status: "success",
      data: {
        deleted,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
}

async function updateProject(req, res) {
  try {
    const { catalyst } = res.locals;
    const { newProject } = req.body;

    const tableProjects = catalyst.datastore().table("Projetos");
    const updated = await tableProjects.updateRow(newProject);

    if (!updated) return;

    res.status(200).send({
      status: "success",
      data: {
        updated,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
}

//sendMessage() function
async function sendMessage(req, res, project, enviarMensagem, writen_fails) {
  try {
    //project.Application
    const { catalyst } = res.locals;

    let mensagem = `## 🔄️ Manual Refresh \n\n`;
    if (writen_fails) {
      const totalErros = writen_fails.length;
      const arrayFunctions = writen_fails.reduce((acc, fail) => {
        let function_name = fail.function_name
          ? fail.function_name
          : fail.module;
        const functionIndex = acc.findIndex(
          (item) => item.function_name === function_name
        );
        if (functionIndex !== -1) {
          acc[functionIndex].count++;
        } else {
          const newObj = { function_name: function_name, count: 1 };
          acc.push(newObj);
        }
        return acc;
      }, []);

      mensagem += `### ${project.Application} - ${
        project.Project_Name
      } - ${totalErros} New ${totalErros === 1 ? "Error" : "Errors"}`;
      arrayFunctions.forEach((item) => {
        mensagem += `\n*${item.function_name} - ${item.count} ${
          item.count === 1 ? "Error" : "Errors"
        }*`;
      });
    } else {
      mensagem += `✅ Everything looks good! No errors to report ✅`;
    }
    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
    mensagem += `\n\n⏰ Refresh Time - ${now} ⏰`;

    const Email_User = enviarMensagem.Email;
    const response = await axios.get(
      "https://tokens-698969518.development.catalystserverless.com/server/tokengenerator/token/producao"
    );
    const token = response.data.token;

    const sendMessageURL = `https://cliq.zoho.com/api/v2/buddies/${Email_User}/message`;
    const messageToChatResponse = await axios.post(
      sendMessageURL,
      {
        text: mensagem,
      },
      {
        headers: {
          Authorization: token,
          connection_name: "producao",
        },
      }
    );
    if (!messageToChatResponse) return;
    return "mensagem enviada!";
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
}

async function refreshProject(req, res) {
  try {
    const { catalyst } = res.locals;
    const {
      project,
      onlyFails = false,
      onlyAll = false,
      enviarMensagem = null,
    } = req.body;

    const headers = {
      cookie: project.Cookie,
      "x-crm-org": project.Org,
      "x-zcsrf-token": project.Token,
    };

    if (!onlyAll) {
      const urlFails = `https://crm.zoho${project.Domain}/crm/v2/settings/functions/failures?language=deluge&start=1&limit=100&componentType=all`;
      const failFunctions = await axios
        .get(urlFails, {
          headers: headers,
        })
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          console.error(error);
        });
      //writen_fails array com os novos erros
      const writen_fails = await write_failFunctions(
        req,
        res,
        failFunctions,
        project
      );

      if (enviarMensagem)
        sendMessage(req, res, project, enviarMensagem, writen_fails);
    }

    if (!onlyFails) {
      //passos
      let allFunctions = "começar";
      let start = 0;
      let limit = 100;
      while (allFunctions) {
        const urlAll = `https://crm.zoho${project.Domain}/crm/v2/settings/functions?type=org&start=${start}&limit=${limit}&componentType=all`;
        allFunctions = await axios
          .get(urlAll, {
            headers: headers,
          })
          .then((response) => {
            return response.data;
          })
          .catch((error) => {
            console.error(error);
          });

        if (!allFunctions) continue;

        const writen_all = await write_allFunctions(
          req,
          res,
          allFunctions,
          project
        );
        start += limit;
      }

      //fim passos
    }

    const date = new Date();
    const newDate = date.toISOString().replace(/T/, " ").replace(/\..+/, "");
    project.Last_Refresh = newDate;

    const tableProjects = catalyst.datastore().table("Projetos");
    const updated = await tableProjects.updateRow(project);

    res.status(200).send({
      status: "success",
      data: {
        updated,
      },
    });
  } catch (err) {
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
}
async function extractFailedFunctions(req, res, project, str) {
  const { catalyst } = res.locals;
  const zcql = catalyst.zcql();

  const indexStart = str.indexOf('[{"details');
  const indexEnd = str.indexOf(',"logColHeaders":[');
  const strJSON = str.substring(indexStart, indexEnd);
  const dataJSON = JSON.parse(strJSON);

  let limit = 200;
  let count = 1;
  let adicionarFunctions = [];

  //get all functions fails
  const failFunctions = await zcql.executeZCQLQuery(
    `SELECT FailFunctions.*, Projetos.Project_Name FROM FailFunctions
    INNER JOIN Projetos ON FailFunctions.Projeto = Projetos.ROWID
    WHERE FailFunctions.Projeto = ${project.ROWID}`
  );

  dataJSON.forEach(async (func) => {
    count++;
    if (count >= limit) return;
    const { details, time, message, type, user, full_log } = func;
    const new_details = details
      .replace(/<[^>]*>/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
    const time_pased = new Date(Date.parse(time));
    const new_time = time_pased
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/, "");
    let existe_erro = false;
    message.includes("Error") ? (existe_erro = true) : (existe_erro = false);
    if (!existe_erro) return;

    //verify if the message, details, time exists in failFunctions
    const exists = failFunctions.find((fail) => {
      const { FailFunctions, Projetos } = fail;
      return (
        FailFunctions.reason === message &&
        FailFunctions.module === new_details &&
        FailFunctions.failed_time === new_time &&
        Projetos.Project_Name === project.Project_Name
      );
    });

    if (exists) return;

    adicionarFunctions.push({
      Projeto: project.ROWID,
      reason: message,
      failed_time: new_time,
      module: new_details,
      type: type,
      Utilizador: user,
    });
  });

  if (adicionarFunctions.length < 1) return;
  const tableFailFunctions = catalyst.datastore().table("FailFunctions");
  const created = await tableFailFunctions.insertRows(adicionarFunctions);

  return adicionarFunctions;
}
async function refreshProjectCreator(req, res) {
  try {
    const { catalyst } = res.locals;
    const {
      project,
      onlyFails = false,
      onlyAll = false,
      enviarMensagem = null,
    } = req.body;
    const { Admin_Name, Project_Name, Domain, Cookie } = project;

    const headers = {
      cookie: Cookie,
    };

    //erros
    if (!onlyAll) {
      const urlFunctionsLogs = `https://creator.zoho${Domain}/appbuilder/${Admin_Name}/${Project_Name}/usagelog/edit?targetElem=setting&logLimit=50`;
      const functionsLogs = await axios
        .get(urlFunctionsLogs, {
          headers: headers,
        })
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          console.error(error);
        });

      const writen_fails = await extractFailedFunctions(
        req,
        res,
        project,
        functionsLogs
      );
      if (enviarMensagem)
        sendMessage(req, res, project, enviarMensagem, writen_fails);
    }

    if (!onlyFails) {
      //all
      const urlAllFunctions = `https://creator.zoho${Domain}/appbuilder/${Admin_Name}/${Project_Name}/fetchAccordian?`;
      const allFunctions = await axios
        .get(urlAllFunctions, {
          headers: headers,
        })
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          console.error(error);
        });

      const all_workflows = allFunctions.workflows.workflowList.workflowList;
      await write_allFunctionsCreator(req, res, all_workflows, project);
    }

    const date = new Date();
    const newDate = date.toISOString().replace(/T/, " ").replace(/\..+/, "");
    project.Last_Refresh = newDate;

    const tableProjects = catalyst.datastore().table("Projetos");
    const updated = await tableProjects.updateRow(project);

    res.status(200).send({
      status: "success",
      data: {
        updated,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
}

async function write_allFunctionsCreator(req, res, all_workflows, project) {
  const { catalyst } = res.locals;
  const zcql = catalyst.zcql();
  const tableAllFunctions = catalyst.datastore().table("AllFunctions");

  try {
    //read all the functions fails
    const allFunctionsFetched = await zcql.executeZCQLQuery(
      `SELECT * FROM AllFunctions WHERE Projeto = ${project.ROWID}`
    );
    const fetchedAllFunctions = allFunctionsFetched.map(
      // delete
      (row) => row.AllFunctions.ROWID
    );

    const AllFunctionsFunctionId = allFunctionsFetched.map(
      (row) => row.AllFunctions.api_name
    );

    let limit = 100;
    let count = 1;
    let adicionarFunctions = [];
    all_workflows.map((functionObj) => {
      count++;
      if (count >= limit) return;
      const { WFLinkName, WFName, type, eventDate } = functionObj;
      if (AllFunctionsFunctionId.includes(String(WFLinkName))) return;
      adicionarFunctions.push({
        Projeto: project.ROWID,
        api_name: WFLinkName,
        display_name: WFName,
        function_type: type,
        event_date: eventDate,
      });
    });

    if (adicionarFunctions.length < 1) return;
    const created = await tableAllFunctions.insertRows(adicionarFunctions);

    //delete
    // const deleted = await tableAllFunctions.deleteRows(fetchedAllFunctions);
  } catch (err) {
    console.error("An error occurred:", err);
  }
}

async function write_allFunctions(req, res, allFunctions, project) {
  const { catalyst } = res.locals;
  const zcql = catalyst.zcql();
  const tableAllFunctions = catalyst.datastore().table("AllFunctions");
  const functions = allFunctions.functions;

  try {
    //read all the functions fails
    const allFunctionsFetched = await zcql.executeZCQLQuery(
      `SELECT * FROM AllFunctions WHERE Projeto = ${project.ROWID} LIMIT 200`
    );
    const fetchedAllFunctions = allFunctionsFetched.map(
      // delete
      (row) => row.AllFunctions.ROWID
    );
    const AllFunctionsFunctionId = allFunctionsFetched.map(
      (row) => row.AllFunctions.function_id
    );

    let limit = 50;
    let count = 1;
    let adicionarFunctions = [];
    functions.map((functionObj) => {
      count++;
      if (count >= limit) return;
      const {
        id,
        rest_api,
        description,
        language,
        display_name,
        category,
        updatedTime,
        workflow,
      } = functionObj;
      const newUpdatedTime = dayjs(updatedTime).format("YYYY-MM-DD HH:mm:ss");
      if (AllFunctionsFunctionId.includes(String(id))) return;
      adicionarFunctions.push({
        Projeto: project.ROWID,
        function_id: id,
        rest_api,
        description,
        language,
        display_name,
        category,
        returnType: workflow.returnType,
        updatedTime: newUpdatedTime,
      });
    });

    if (adicionarFunctions.length < 1) return;
    const adicionados = await tableAllFunctions.insertRows(adicionarFunctions);

    //delete
    // const deleted = await tableAllFunctions.deleteRows(fetchedAllFunctions);
  } catch (err) {
    console.error("An error occurred:", err);
  }
}

async function write_failFunctions(req, res, failFunctions, project) {
  const { catalyst } = res.locals;
  const zcql = catalyst.zcql();
  const function_failures = failFunctions.custom_function_failures;
  const tableFailFunctions = catalyst.datastore().table("FailFunctions");
  try {
    //read all the functions fails
    const allFailFunctions = await zcql.executeZCQLQuery(
      `SELECT * FROM FailFunctions WHERE Projeto = ${project.ROWID}`
    );
    const fetchedFailFunctions = allFailFunctions.map(
      // delete
      (row) => row.FailFunctions.ROWID
    );
    const FailFunctionsFailuresId = allFailFunctions.map(
      //existe
      (row) => row.FailFunctions.failure_id
    );

    let limit = 100;
    let count = 1;
    let adicionarFunctions = [];
    function_failures.map((fail) => {
      count++;
      if (count >= limit) return;
      const { failure_id, module, reason, function_info, failed_time } = fail;
      if (FailFunctionsFailuresId.includes(String(failure_id))) return;
      const function_name = function_info.name;
      const newFailed_time = new Date(parseInt(failed_time))
        .toISOString()
        .replace("T", " ")
        .slice(0, 19);
      adicionarFunctions.push({
        Projeto: project.ROWID,
        failure_id,
        module,
        reason,
        function_name,
        failed_time: newFailed_time,
      });
    });

    if (adicionarFunctions.length < 1) return;
    await tableFailFunctions.insertRows(adicionarFunctions);

    return adicionarFunctions;
    //delete
    // const deleted = await tableFailFunctions.deleteRows(fetchedFailFunctions);
  } catch (err) {
    console.error("An error occurred:", err);
  }
}
async function read_AllFunctions(req, res) {
  try {
    const { PROJECT_ID } = req.params;
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();

    //select from AllFunctions where projectSelected.ROWID
    const allFunctions = await zcql.executeZCQLQuery(
      `SELECT AllFunctions.*, Projetos.Project_Name FROM AllFunctions
      INNER JOIN Projetos ON AllFunctions.Projeto = Projetos.ROWID
      WHERE AllFunctions.Projeto = ${PROJECT_ID}`
    );

    res.status(200).send({
      status: "success",
      data: {
        allFunctions,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
}

async function read_FailFunctions(req, res) {
  try {
    const { PROJECT_ID } = req.params;
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();

    //select from AllFunctions where projectSelected.ROWID
    const failFunctions = await zcql.executeZCQLQuery(
      `SELECT FailFunctions.*, Projetos.Project_Name FROM FailFunctions
      INNER JOIN Projetos ON FailFunctions.Projeto = Projetos.ROWID
      WHERE FailFunctions.Projeto = ${PROJECT_ID}`
    );

    res.status(200).send({
      status: "success",
      data: {
        failFunctions,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
}
async function viewCode(req, res) {
  try {
    const { projectSelected, function_id, cookie, token, org } = req.body;
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();

    const url = `https://crm.zoho${projectSelected.Domain}/crm/v2/settings/functions/${function_id}?source=crm&language=deluge`;

    const headers = {
      cookie: cookie,
      "x-crm-org": org,
      "x-zcsrf-token": token,
    };

    const function_code = await axios
      .get(url, {
        headers: headers,
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(error);
      });
    res.status(200).send({
      status: "success",
      data: {
        function_code,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
}

async function dashboardErros(req, res) {
  try {
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();
    const { APPLICATION } = req.params;

    const dashboardErros = await zcql.executeZCQLQuery(
      `SELECT FailFunctions.*, Projetos.Project_Name FROM FailFunctions
      INNER JOIN Projetos ON FailFunctions.Projeto = Projetos.ROWID
      WHERE Projetos.Application = '${APPLICATION}' AND Projetos.Estado = true
      ORDER BY Projetos.Project_Name, FailFunctions.failed_time`
    );

    res.status(200).send({
      status: "success",
      data: {
        dashboardErros,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
}

async function login(req, res) {
  try {
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();
    const { code } = req.body;

    const client_id = "1000.FOYIAMQ0C3JOCRZG22UWI05JUUV9LG";
    const client_secret = "779f13ff418b6b5dfd22aee50c990c2b1d938f9238";
    const redirect = "http://localhost:3000/app";
    // const redirect = "https://project-status-717255921.development.catalystserverless.com/app/index.html";
    const url = `https://accounts.zoho.com/oauth/v2/token?grant_type=authorization_code&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect}&code=${code}`;

    //get token
    const response = await axios.post(url);
    const token = decodeJWT(response.data.id_token);
    const access_token = response.data.access_token;
    const user_email = token.email;

    //get user data
    const userInfoURL = `https://accounts.zoho.com/oauth/user/info`;
    const responta = await axios.get(userInfoURL, {
      headers: {
        Authorization: `Zoho-oauthtoken ${access_token}`,
      },
    });
    const user_nome = responta.data.Display_Name;

    // //userImage
    // const userImageURL = `https://profile.zoho.com/file?fs=thumb&ID=${responta.data.ZUID}`;
    // const imagem64base = await axios.post(userImageURL, {
    //   headers: {
    //     Authorization: `Zoho-oauthtoken ${access_token}`,
    //   },
    // });
    // const imagem = imagem64base.data;

    //verificar se já existe
    let fetchUser = await zcql
      .executeZCQLQuery(`SELECT * FROM Users WHERE Email = '${user_email}'`)
      .then((rows) =>
        rows.map((row) => ({
          ROWID: row.Users.ROWID,
          Email: row.Users.Email,
          Nome: row.Users.Nome,
          Profile: row.Users.Profile,
        }))
      );

    if (fetchUser.length === 0) {
      const tableUsers = catalyst.datastore().table("Users");

      //fetchUser nao da
      fetchUser = await tableUsers.insertRow({
        Email: user_email,
        Nome: user_nome,
        Profile: 1105000000117726,
      });
    } else {
      fetchUser = fetchUser[0];
    }

    res.status(200).send({
      status: "success",
      data: {
        isLogged: true,
        fetchUser,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
}

async function updateBell(req, res) {
  try {
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();
    const { project, id_AuthUser, settingsNotification } = req.body;

    const updateProperty = async (propertyName) => {
      if (settingsNotification.hasOwnProperty(propertyName)) {
        // Get the current value of the property
        let currentValue = await zcql
          .executeZCQLQuery(
            `SELECT ${propertyName} FROM Projetos WHERE ROWID = '${project.ROWID}'`
          )
          .then((rows) => rows.map((row) => row.Projetos[propertyName]));
        currentValue = currentValue[0];
        let stringArray = currentValue ? currentValue : "[]";

        let array = JSON.parse(stringArray);
        const exists = array.includes(id_AuthUser);
        const indexToRemove = array.indexOf(id_AuthUser);
        // If the value is already correct, no need to update
        if (
          (exists && settingsNotification[propertyName]) ||
          (!exists && !settingsNotification[propertyName])
        )
          return;

        // Update the property
        if (exists) {
          array.splice(indexToRemove, 1);
        } else {
          array.push(id_AuthUser);
        }

        const tableProjects = catalyst.datastore().table("Projetos");
        const updateProject = await tableProjects.updateRow({
          ROWID: project.ROWID,
          [propertyName]: JSON.stringify(array),
        });
        return updateProject;
      }
      return updateProject;
    };

    // Update Notificar property
    const updateProjectNotificar = await updateProperty("Notificar");

    // Update NotificarDaily property
    const updatedProject = await updateProperty("NotificarDaily");

    res.status(200).send({
      status: "success",
      data: {
        updatedProject,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: err.message,
    });
  }
}

//delete function
async function deleteFunctions(req, res) {
  try {
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();
    const { projectSelected, functionsToDelete } = req.body;

    if (functionsToDelete.length < 1) return;

    const array_function_ids = functionsToDelete.map((item) => {
      return item.function_id;
    });

    const array_ROWIDs = functionsToDelete.map((item) => {
      return parseInt(item.ROWID);
    });

    //delete in CRM
    array_function_ids.forEach(async (functionToDelete) => {
      const deleteURL = `https://crm.zoho.com/crm/v2/settings/functions/${functionToDelete}?language=deluge`;

      const headers = {
        cookie: projectSelected.Cookie,
        "x-crm-org": projectSelected.Org,
        "x-zcsrf-token": projectSelected.Token,
      };
      //delete request
      const response = await axios.delete(deleteURL, {
        headers: headers,
      });
    });

    //delete in Database
    const tableAllFunctions = catalyst.datastore().table("AllFunctions");
    const deleteFunctions = await tableAllFunctions.deleteRows(array_ROWIDs);

    const resp = true;
    res.status(200).send({
      status: "success",
      data: {
        resp,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
}

async function getAllUsers(req, res) {
  try {
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();

    const users = await zcql.executeZCQLQuery(
      `SELECT * FROM Users ORDER BY Profile DESC`
    );
    const fetchedUsers = users.map((row) => row.Users);

    res.status(200).send({
      status: "success",
      data: { fetchedUsers },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
}

async function updateRole(req, res) {
  try {
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();
    const { ROWID, Profile } = req.body;

    const role =
      Profile === "1105000000117726" ? "1105000000182356" : "1105000000117726";
    if (!role) return;

    const tableUsers = catalyst.datastore().table("Users");
    const updateUser = await tableUsers.updateRow({
      ROWID: ROWID,
      Profile: role,
    });

    res.status(200).send({
      status: "success",
      data: {
        updateUser,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
}

//updateProjectEstado()
async function updateProjectEstado(req, res) {
  try {
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();
    const { project } = req.body;
    const { ROWID, Estado } = project;

    const tableProjetos = catalyst.datastore().table("Projetos");
    const updateProject = await tableProjetos.updateRow({
      ROWID: ROWID,
      Estado: !Estado,
    });

    res.status(200).send({
      status: "success",
      data: {
        updateProject,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
}

// Rotas
app.use(initializeCatalyst);
app.post("/login", login);
app.get("/all-users", getAllUsers);
app.post("/switch-role", updateRole);

app.get("/get-projects/:APPLICATION", getProjects);
app.get("/all-projects", getAllProjects);
app.post("/create-project", createProject);
app.delete("/delete-project/:ROWID", deleteProject);
app.post("/update-project", updateProject);
app.post("/update-project-estado", updateProjectEstado);
app.post("/refresh-project", refreshProject);
app.post("/refresh-project-creator", refreshProjectCreator);

app.post("/update-bell", updateBell);

app.get("/get-failFunctions/:PROJECT_ID", read_FailFunctions);

app.get("/get-allFunctions/:PROJECT_ID", read_AllFunctions);

app.post("/function-viewcode", viewCode);

app.get("/get-dashboard-erros/:APPLICATION", dashboardErros);

app.post("/delete-functions", deleteFunctions);
module.exports = app;

app.post("/teste", twentyFour);

//teste schedule 24 Hours
async function twentyFour(req, res) {
  try {
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();

    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const ago24Hours = dayjs().subtract(1, "day").format("YYYY-MM-DD HH:mm:ss");
    // const ago24Hours = "2024-12-02 01:12:36";

    //select from FailFunctions where failed_time is 24 hours ago from now
    const failFunctions = await zcql.executeZCQLQuery(
      `SELECT * FROM FailFunctions WHERE failed_time >= '${ago24Hours}' AND failed_time <= '${now}'`
    );
    let existemErros = true;
    const fetchedFailFunctions = failFunctions.map((row) => row.FailFunctions);
    fetchedFailFunctions.length === 0
      ? (existemErros = false)
      : (existemErros = true);

    let errorsPerProjeto = {};
    //projetos com o numero de erros nas ultimas 24 horas
    for (let i = 0; i < fetchedFailFunctions.length; i++) {
      const fail = fetchedFailFunctions[i];
      const { Projeto } = fail;

      if (errorsPerProjeto[Projeto]) {
        errorsPerProjeto[Projeto] += 1;
        continue;
      }
      errorsPerProjeto[Projeto] = 1;
    }

    let usersToNotify = {};
    const fetchedProjects = await fetchAllProject(req, res);
    for (let i = 0; i < fetchedProjects.length; i++) {
      const project = fetchedProjects[i];
      const { NotificarDaily } = project;
      if (!NotificarDaily) continue;
      const users = JSON.parse(NotificarDaily);
      for (let j = 0; j < users.length; j++) {
        const userId = users[j];
        if (usersToNotify[userId]) {
          usersToNotify[userId].push(project.ROWID);
          continue;
        }
        usersToNotify[userId] = [project.ROWID];
      }
    }

    for (let i = 0; i < Object.keys(usersToNotify).length; i++) {
      const userId = Object.keys(usersToNotify)[i];
      const projects = usersToNotify[userId];
      let messages = "## 📝 Daily Report \n\n";

      if (existemErros) {
        const messagePromises = projects.map(async (projectROWID) => {
          const tableProjetos = catalyst.datastore().table("Projetos");
          const projeto = await tableProjetos.getRow(projectROWID);
          const { Project_Name, Application } = projeto;

          //antigo = return;
          if (!errorsPerProjeto[projectROWID]) {
            errorsPerProjeto[projectROWID] = 0;
          }

          const errorMessage = `*${Application} - ${Project_Name} - ${errorsPerProjeto[projectROWID]} New Errors*`;

          if (
            errorMessage.includes("CRM -") ||
            errorMessage.includes("CREATOR -")
          ) {
            return errorMessage;
          }
        });

        const messagesArray = await Promise.all(messagePromises);
        const crmMessages = messagesArray
          .filter((el) => el?.includes("CRM -"))
          .join("\n")
          .split("CRM - ")
          .join("");
        const creatorMessages = messagesArray
          .filter((el) => el?.includes("CREATOR -"))
          .join("\n")
          .split("CREATOR - ")
          .join("");

        if (crmMessages !== "") {
          messages += "### CRM\n";
          messages += crmMessages;
        }

        if (creatorMessages !== "") {
          messages += "\n\n### CREATOR\n";
          messages += creatorMessages;
        }
      } else {
        messages += `✅ Everything looks good! No errors to report ✅`;
      }

      messages += `\n\n⏰ Errors between ${ago24Hours} - ${now} ⏰`;

      //get user email
      const tableUsers = catalyst.datastore().table("Users");
      const user = await tableUsers.getRow(userId);
      const { Email } = user;
      await sendMessage_schedule(Email, messages);
    }

  } catch (err) {
    console.log(err);
  }
}

//teste schedule 2 in 2 Hours
async function fetchAllProject(req, res) {
  const { catalyst } = res.locals;
  const zcql = catalyst.zcql();
  const projetos = await zcql.executeZCQLQuery(`SELECT * FROM Projetos WHERE Estado = true`);
  const fetchedProjects = projetos.map((row) => row.Projetos);

  return fetchedProjects;
}

async function createMessage_schedule(req, res, project, writen_fails) {
  try {
    //project.Application
    const { catalyst } = res.locals;
    const totalErros = writen_fails.length;
    const arrayFunctions = writen_fails.reduce((acc, fail) => {
      let function_name = fail.function_name ? fail.function_name : fail.module;
      const functionIndex = acc.findIndex(
        (item) => item.function_name === function_name
      );
      if (functionIndex !== -1) {
        acc[functionIndex].count++;
      } else {
        const newObj = { function_name: function_name, count: 1 };
        acc.push(newObj);
      }
      return acc;
    }, []);
    const sortedArray = arrayFunctions.sort((a, b) => b.count - a.count);

    let mensagem = `*${project.Application} - ${
      project.Project_Name
    } - ${totalErros} New ${totalErros === 1 ? "Error" : "Errors"}*`;

    //mensagem Antiga
    // sortedArray.forEach((item) => {
    //   mensagem += `\n- *${
    //     project.Application === "CRM" ? "Function" : "Module"
    //   }:* ${item.function_name} - ${item.count} ${
    //     item.count === 1 ? "Error" : "Errors"
    //   }`;
    // });

    return mensagem;
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
}

async function sendMessage_schedule(email, mensagem) {
  try {
    const response = await axios.get(
      "https://tokens-698969518.development.catalystserverless.com/server/tokengenerator/token/producao"
    );
    const token = response.data.token;

    const sendMessageURL = `https://cliq.zoho.com/api/v2/buddies/${email}/message`;
    const messageToChatResponse = await axios.post(
      sendMessageURL,
      {
        text: mensagem,
      },
      {
        headers: {
          Authorization: token,
          connection_name: "producao",
        },
      }
    );
    return messageToChatResponse;
  } catch {
    return "erro";
  }
}

async function write_failFunctions_schedule(req, res, failFunctions, project) {
  const { catalyst } = res.locals;
  const zcql = catalyst.zcql();
  const function_failures = failFunctions.custom_function_failures;
  const tableFailFunctions = catalyst.datastore().table("FailFunctions");
  try {
    //read all the functions fails
    const allFailFunctions = await zcql.executeZCQLQuery(
      `SELECT * FROM FailFunctions WHERE Projeto = ${project.ROWID}`
    );
    const fetchedFailFunctions = allFailFunctions.map(
      // delete
      (row) => row.FailFunctions.ROWID
    );
    const FailFunctionsFailuresId = allFailFunctions.map(
      //existe
      (row) => row.FailFunctions.failure_id
    );

    let limit = 100;
    let count = 1;
    let adicionarFunctions = [];
    function_failures.map((fail) => {
      count++;
      if (count >= limit) return;
      const { failure_id, module, reason, function_info, failed_time } = fail;
      if (FailFunctionsFailuresId.includes(String(failure_id))) return;
      const function_name = function_info.name;
      const newFailed_time = new Date(parseInt(failed_time))
        .toISOString()
        .replace("T", " ")
        .slice(0, 19);
      adicionarFunctions.push({
        Projeto: project.ROWID,
        failure_id,
        module,
        reason,
        function_name,
        failed_time: newFailed_time,
      });
    });

    if (adicionarFunctions.length < 1) return;
    await tableFailFunctions.insertRows(adicionarFunctions);

    return adicionarFunctions;
    //delete
    // const deleted = await tableFailFunctions.deleteRows(fetchedFailFunctions);
  } catch (err) {
    console.error("An error occurred:", err);
  }
}

async function refreshProjectCRM(req, res, project, filtro) {
  try {
    const { catalyst } = res.locals;

    const headers = {
      cookie: project.Cookie,
      "x-crm-org": project.Org,
      "x-zcsrf-token": project.Token,
    };

    const urlFails = `https://crm.zoho${project.Domain}/crm/v2/settings/functions/failures?language=deluge&start=1&limit=100&componentType=all`;
    const failFunctions = await axios
      .get(urlFails, {
        headers: headers,
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(error);
      });

    const writen_fails = await write_failFunctions_schedule(
      req,
      res,
      failFunctions,
      project
    );

    if (writen_fails) {
      const newMessage = await createMessage_schedule(
        req,
        res,
        project,
        writen_fails
      );
      filtro[project.Project_Name] = newMessage;
    }

    const date = new Date();
    const newDate = date.toISOString().replace(/T/, " ").replace(/\..+/, "");
    project.Last_Refresh = newDate;

    const tableProjects = catalyst.datastore().table("Projetos");
    const updated = await tableProjects.updateRow(project);

    return filtro;
  } catch (err) {
    console.log(err);
  }
}

async function extractFailedFunctions_schedule(req, res, project, str) {
  const { catalyst } = res.locals;
  const zcql = catalyst.zcql();

  const indexStart = str.indexOf('[{"details');
  const indexEnd = str.indexOf(',"logColHeaders":[');
  const strJSON = str.substring(indexStart, indexEnd);
  const dataJSON = JSON.parse(strJSON);

  let limit = 200;
  let count = 1;
  let adicionarFunctions = [];

  //get all functions fails
  const failFunctions = await zcql.executeZCQLQuery(
    `SELECT FailFunctions.*, Projetos.Project_Name FROM FailFunctions
		INNER JOIN Projetos ON FailFunctions.Projeto = Projetos.ROWID
		WHERE FailFunctions.Projeto = ${project.ROWID}`
  );

  dataJSON.forEach(async (func) => {
    count++;
    if (count >= limit) return;
    const { details, time, message, type, user, full_log } = func;
    const new_details = details
      .replace(/<[^>]*>/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
    const time_pased = new Date(Date.parse(time));
    const new_time = time_pased
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/, "");
    let existe_erro = false;
    message.includes("Error") ? (existe_erro = true) : (existe_erro = false);
    if (!existe_erro) return;

    //verify if the message, details, time exists in failFunctions
    const exists = failFunctions.find((fail) => {
      const { FailFunctions, Projetos } = fail;
      return (
        FailFunctions.reason === message &&
        FailFunctions.module === new_details &&
        FailFunctions.failed_time === new_time &&
        Projetos.Project_Name === project.Project_Name
      );
    });

    if (exists) return;

    adicionarFunctions.push({
      Projeto: project.ROWID,
      reason: message,
      failed_time: new_time,
      module: new_details,
      type: type,
      Utilizador: user,
    });
  });

  if (adicionarFunctions.length < 1) return;
  const tableFailFunctions = catalyst.datastore().table("FailFunctions");
  const created = await tableFailFunctions.insertRows(adicionarFunctions);

  return adicionarFunctions;
}
async function refreshProjectCreator_schedule(req, res, project, filtro) {
  try {
    const { catalyst } = res.locals;
    const { Admin_Name, Project_Name, Domain, Cookie } = project;

    const headers = {
      cookie: Cookie,
    };

    const urlFunctionsLogs = `https://creator.zoho${Domain}/appbuilder/${Admin_Name}/${Project_Name}/usagelog/edit?targetElem=setting&logLimit=50`;
    const functionsLogs = await axios
      .get(urlFunctionsLogs, {
        headers: headers,
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(error);
      });

    const writen_fails = await extractFailedFunctions_schedule(
      req,
      res,
      project,
      functionsLogs
    );

    if (writen_fails) {
      const newMessage = await createMessage_schedule(
        req,
        res,
        project,
        writen_fails
      );
      filtro[project.Project_Name] = newMessage;
    }

    const date = new Date();
    const newDate = date.toISOString().replace(/T/, " ").replace(/\..+/, "");
    project.Last_Refresh = newDate;

    const tableProjects = catalyst.datastore().table("Projetos");
    const updated = await tableProjects.updateRow(project);

    return filtro;
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
}

async function callFunctions(req, res) {
  try {
    const { catalyst } = res.locals;
    const fetchedProjects = await fetchAllProject(req, res);

    let msgsPerProject = {};
    let usersToNotify = {};

    for (let i = 0; i < fetchedProjects.length; i++) {
      const project = fetchedProjects[i];
      if (project.Application === "CRM") {
        let newFiltro = await refreshProjectCRM(
          req,
          res,
          project,
          msgsPerProject
        );
        msgsPerProject = newFiltro;
      }
      if (project.Application === "CREATOR") {
        let newFiltro = await refreshProjectCreator_schedule(
          req,
          res,
          project,
          msgsPerProject
        );
        msgsPerProject = newFiltro;
      }
    }

    for (let i = 0; i < fetchedProjects.length; i++) {
      const project = fetchedProjects[i];
      const { Notificar } = project;
      if (!Notificar) continue;
      const users = JSON.parse(Notificar);
      for (let j = 0; j < users.length; j++) {
        const userId = users[j];
        if (usersToNotify[userId]) {
          usersToNotify[userId].push(project.Project_Name);
          continue;
        }
        usersToNotify[userId] = [project.Project_Name];
      }
    }

    for (let i = 0; i < Object.keys(usersToNotify).length; i++) {
      const userId = Object.keys(usersToNotify)[i];
      const projects = usersToNotify[userId];
      let messages = "## ⌛ 2 Hours Refresh Report \n\n";

      // CRM
      const crmMessages = projects
        .map((projectName) => {
          return msgsPerProject[projectName];
        })
        .filter((el) => el?.includes("CRM -"))
        .join("\n")
        .split("CRM - ")
        .join("");

      if (crmMessages !== "") {
        messages += `### CRM\n`;
        messages += crmMessages;
      }

      // CREATOR
      const creatorMessages = projects
        .map((projectName) => {
          return msgsPerProject[projectName];
        })
        .filter((el) => el?.includes("CREATOR -"))
        .join("\n")
        .split("CREATOR - ")
        .join("");

      if (creatorMessages !== "") {
        messages += `\n\n### CREATOR\n`;
        messages += creatorMessages;
      }

      if (!crmMessages && !creatorMessages) {
        messages += `✅ Everything looks good! No errors to report ✅`;
      }

      //get user email
      const tableUsers = catalyst.datastore().table("Users");
      const user = await tableUsers.getRow(userId);
      const { Email } = user;
      sendMessage_schedule(Email, messages);
    }

    //for each projecto procurar quais são os projectos que o user está e guardar num array com o nome do projecto
    //DEPOIS O FOREACH ANTERIOR vai dar todos os que ele está "subscrito"
    //"selecionar" os filtros e guardar numa nova variavel mensagem
    //enviar a mensagem para o user
    //fechar foreach user Notifcar
    //fechar foreach projectos
  } catch (err) {
    console.log(err);
  }
}
