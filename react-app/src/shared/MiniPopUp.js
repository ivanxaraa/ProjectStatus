import { Check, Clipboard } from "lucide-react";
import React, { useState, useEffect } from "react";

function MiniPopUp({ Copy }) {
  const [showCopied, setShowCopied] = useState(false);
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => {
      setShowCopied(false);
    }, 1000);
  };

  return (
    <>
      {showCopied ? (
        <Check
          className="input-icon checked"
          onClick={() => copyToClipboard(Copy)}
        />
      ) : (
        <Clipboard
          className="input-icon"
          onClick={() => copyToClipboard(Copy)}
        />
      )}
    </>
  );
}

export default MiniPopUp;
