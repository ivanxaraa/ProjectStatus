import React, { useEffect } from "react";
import hotkeys from "hotkeys-js";
import "../../styles/popup.css";

const PopUp = ({ children, onClose }) => {
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    hotkeys("escape", closeOnEscape);

    return () => {
      hotkeys.unbind("escape", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div className="modal" onClick={(e) => {
      if(e?.target.closest(".pop-up-content")) return;
      onClose();
      }}>
      <div className="pop-up-content">
        <div className="pop-up-content-container">
        {children}
        </div>
      </div>
    </div>
  );
};

export default PopUp;
