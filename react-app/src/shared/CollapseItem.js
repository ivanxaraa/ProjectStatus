import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState } from "react";

export default function CollapseItem({ title, children, isOpenedProp }) {

  const [isOpened, setIsOpened] = useState(isOpenedProp !== null ? isOpenedProp : false); 

  const handleCollapse = () => {
    setIsOpened(!isOpened);
  };

  return (
    <div className={`collapse-item`}>
      <div className="collapse-item-container" onClick={() => handleCollapse()}>
        <span>{title}</span>
        {isOpened ? <ChevronUp /> : <ChevronDown />}
      </div>
      {isOpened && <div className="collapse-item-content">{children}</div>}
    </div>
  );
}
