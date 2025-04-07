import React from "react";
import { useLocation, useOutletContext, useNavigate } from "react-router-dom";

export const withLocation = (Component) => {
  return (props) => {
    const location = useLocation();
    const context = useOutletContext();
    return <Component location={location} context={context} {...props} />;
  };
};

export const withNavigation = (Component) => {
  return (props) => {
    const navigate = useNavigate();
    return <Component navigate={navigate} {...props} />;
  };
};

export const withOutletContext = (Component) => {
  return (props) => {
    const context = useOutletContext();
    return <Component context={context} {...props} />;
  };
};
