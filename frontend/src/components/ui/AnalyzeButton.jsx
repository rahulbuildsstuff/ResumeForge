import * as React from "react";
import "./AnalyzeButton.css";

export const AnalyzeButton = React.forwardRef(
  ({ loading: _loading = false, children, className, ...props }, ref) => {
    return (
      <button ref={ref} {...props} className={`anl-outer-cont ${className ?? ""}`}>
        <span className="anl-flex">{children}</span>
      </button>
    );
  }
);
AnalyzeButton.displayName = "AnalyzeButton";

export default AnalyzeButton;
