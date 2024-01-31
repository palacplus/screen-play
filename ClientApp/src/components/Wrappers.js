import React from "react";
import { useLocation, useOutletContext } from "react-router-dom";

export const withLocation = (Component) => {
  return (props) => {
    const location = useLocation();
    return <Component location={location} {...props} />;
  };
};

export const withOutletContext = (Component) => {
  return (props) => {
    const context = useOutletContext();
    return <Component context={context} {...props} />;
  };
};
