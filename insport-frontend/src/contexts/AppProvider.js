//appProvider.js
import React from 'react';
import { UserProvider } from './UserContext.js';


// AppProvider that wraps all the necessary providers
const AppProvider = ({ children }) => {
  return (
    <UserProvider>
      {/* <GameProvider>
        <EventProvider> */}
          {children}
        {/* </EventProvider>
      </GameProvider> */}
    </UserProvider>
  );
};

export default AppProvider;
