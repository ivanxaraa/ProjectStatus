import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import "../styles/login.css";
import Loading from "./shared/Loading";
import Cookies from "js-cookie";

const Login = ({ auth }) => {
  const [loading, setLoading] = useState(false);
  const client_id = "1000.FOYIAMQ0C3JOCRZG22UWI05JUUV9LG";
  const client_secret = "779f13ff418b6b5dfd22aee50c990c2b1d938f9238";
  const redirect = `http://localhost:3000/app`;
  // const redirect = `https://project-status-717255921.development.catalystserverless.com/app/index.html`;
  const btnLink = `https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id=${client_id}&scope=email,AaaServer.profile.READ,ZohoCliq.Webhooks.CREATE
  &redirect_uri=${redirect}`;
  const [code, setCode] = useState(null);

  const login = useCallback(async (code) => {
    setLoading(true);
    try {
      const response = await axios.post(`/server/project_status_function/login`, {
        code,
      });
      const authUser = response.data.data.fetchUser;
      Cookies.set("authUser", JSON.stringify(authUser), { expires: 7 });
      auth(authUser);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      setCode(code);
      login(code);
    }
  }, [login]);

  return (
    <>
      {loading && <Loading />}
      <div className="login-page">
        <div className="login-page-container">
          <div className="title">
            <span className="main-title">
              <h1 className="dasda">Project Status</h1>
            </span>
          </div>
          <button
            className="login-btn"
            onClick={() => (window.location.href = btnLink)}
          >
            Sign in with Zoho
          </button>
        </div>
      </div>
    </>
  );
};

export default Login;
