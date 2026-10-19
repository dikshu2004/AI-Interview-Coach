import React from "react";

function Badge({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  return (
    <span className={`badge badge-${variant} ${className}`} {...props}>
      {children}
    </span>
  );
}

export default Badge;
