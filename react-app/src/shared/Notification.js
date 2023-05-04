import React, { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import "../../styles/notification.css";

const Notification = ({ Status = true, Message }) => {
  return (
    <>      
        <div class="notification" id="noti">
          <div class="notification-container">
            <div class="notification-left">
              <div class={`notification-circle ${Status ? 'success' : 'error'}`}>
                {Status ? (<Check size={18}/>) : (<X size={24}/>)}                
              </div>
            </div>
            <div class="notification-right">
              <span className="notification-status">{Status ? 'Sucesso!' : 'Erro!'}</span>
              <span className="notification-message">{Message}</span>
            </div>
          </div>
          <div class={`notification-bar ${Status ? 'success' : 'error'}`} />
        </div>
      
    </>
  );
};

export default Notification;
