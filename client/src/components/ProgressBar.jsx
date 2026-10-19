import React from "react";

function ProgressBar({
  value = 0,
  max = 100,
  showLabel = true,
  label = "",
  variant = "brand",
  height = "8px",
  className = "",
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={`progress-container ${className}`}>
      {(showLabel || label) && (
        <div className="progress-labels">
          <span className="progress-title">{label}</span>
          <span className="progress-value">{percentage}%</span>
        </div>
      )}
      <div className="progress-track" style={{ height }}>
        <div
          className={`progress-fill progress-${variant}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
