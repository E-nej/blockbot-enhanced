import { UserContext } from "./userContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Logout from "./components/Logout";
import MenuAppBar from "./components/MenuAppBar";
import Home from "./components/Home";

function App() {
  /*
   * Info if user is loged in.
   * With use of UserContext (uses Reacts Context) we can access info if user is loged in across all components.
   */
  const [user, setUser] = useState(
    localStorage.user ? JSON.parse(localStorage.user) : null
  );
  const updateUserData = (userInfo) => {
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUser(userInfo);
  };

  return (
    <>
      <BrowserRouter>
        <UserContext.Provider
          value={{
            user: user,
            setUserContext: updateUserData,
          }}
        >
          <div className="App">
            <MenuAppBar title="Blockbot"></MenuAppBar>
            <Routes>
              <Route path="/" exact element={<Home />}></Route>
              <Route path="/login" exact element={<Login />}></Route>
              <Route path="/register" element={<Register />}></Route>
              <Route path="/profile" element={<Profile />}></Route>
              <Route path="/logout" element={<Logout />}></Route>
            </Routes>
          </div>
        </UserContext.Provider>
      </BrowserRouter>
    </>
  );
}

export default App;
