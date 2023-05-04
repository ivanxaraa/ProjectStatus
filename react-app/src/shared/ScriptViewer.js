import React from "react";
import Prism from "prismjs"; // import the syntax highlighting library
import "prismjs/themes/prism.css"; // import the Prism CSS file
import "../../styles/code.css";

const ScriptViewer = ({ script, isDeluge }) => {
  // Use Prism to highlight the code syntax
  const highlightedCode = Prism.highlight(
    script,
    Prism.languages.javascript,
    "javascript"
  );

  return (
    <div className={isDeluge ? "deluge" : "javascript"}>
      <pre className="language-javascript">
        <code dangerouslySetInnerHTML={{ __html: highlightedCode }}></code>
      </pre>
    </div>
  );
};

export default ScriptViewer;
