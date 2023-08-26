import React, { createContext, useState } from "react";

export const CloudContext = createContext({});

export const CloudProvider = ({ children }) => {
  const [toggleTransferSuccess, setToggleTransferSuccess] = useState(false);
  const [visibleTransfer, setVisibleTransfer] = useState(false);

  return (
    <CloudContext.Provider
      value={{
        toggleTransferSuccess,
        setToggleTransferSuccess,
        visibleTransfer,
        setVisibleTransfer,
      }}
    >
      {children}
    </CloudContext.Provider>
  );
};
