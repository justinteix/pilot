import React from "react";
import "./PilotLogo.css";

const PilotLogo = ({
  width = 100,
  height = 66,
  className = "",
  style = {},
  variant = "pilot", // "pilot" for pilot-logo.svg, "p" for p-logo.svg
}) => {
  const logoSrc = variant === "p" ? "/p-logo.svg" : "/pilot-logo.svg";
  
  return (
    <img
      src={logoSrc}
      alt="Logo"
      width={width}
      height={height}
      className={`pilot-logo ${className}`}
      style={style}
    />
  );
};

export default PilotLogo;
