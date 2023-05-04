import React from "react";
import "../../styles/loading.css";

const Loading = () => {
  return (
    <div className="loading">
      <div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    </div>
  );
};

export default Loading;
