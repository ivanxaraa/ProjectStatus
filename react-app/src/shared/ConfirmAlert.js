import React from "react";
import "../../styles/confirmAlert.css";
import PopUp from "./PopUp";

const ConfirmAlert = ({ confirm, cancel, item }) => {
  return (
    <PopUp onClose={cancel}>
      <div className="confirm-alert">
        <h2>Are you sure?</h2>
        <p>
          Do you really want to delete {item ? <b>{item}</b> : ""} ? This process
          cannot be undone.
        </p>

        <div className="confirm-alert-buttons top-20">
          <button className="btn-confirm delete" onClick={confirm}>
            Delete
          </button>
          <button className="btn-confirm view" onClick={cancel}>
            Cancel
          </button>
        </div>
      </div>
    </PopUp>
  );
};

export default ConfirmAlert;
