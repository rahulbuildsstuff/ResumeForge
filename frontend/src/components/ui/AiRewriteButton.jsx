import * as React from "react";
import "./AiRewriteButton.css";

export const AiRewriteButton = React.forwardRef(
  ({ loading = false, label = "Rewrite with AI", loadingLabel = "Generating", className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        className={`airw-button ${className ?? ""}`}
        data-loading={loading ? "true" : "false"}
      >
        <span className="airw-fold" />
        <div className="airw-points_wrapper" aria-hidden>
          {Array.from({ length: 10 }).map((_, i) => (
            <i key={i} className="airw-point" />
          ))}
        </div>
        <span className="airw-inner">
          {loading ? (
            <>
              <svg
                className="airw-icon airw-spin"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                stroke="currentColor"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              {loadingLabel}
            </>
          ) : (
            <>
              <svg
                className="airw-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                stroke="currentColor"
              >
                <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z" />
              </svg>
              {label}
            </>
          )}
        </span>
      </button>
    );
  }
);
AiRewriteButton.displayName = "AiRewriteButton";

export default AiRewriteButton;
