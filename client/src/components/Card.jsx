import React from "react";

function Card({
  children,
  hoverable = true,
  className = "",
  onClick,
  ...props
}) {
  return (
    <div
      className={`glass-card ${hoverable ? "glass-card-hover" : ""} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
