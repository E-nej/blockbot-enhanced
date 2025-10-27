import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import { UserContext } from '../userContext';
import { useNavigate } from "react-router-dom";
import CameraIcon from '@mui/icons-material/Camera';


export default function MenuAppBar(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  }

  const handleProfile = () => {
    handleClose();
    navigate("/profile");
  };

  const handleLogout = () => {
    handleClose();
    navigate("/logout");
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" style={{marginBottom: "30px"}}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 1 }}
            onClick={() => {navigate("/")}}
          >
            <CameraIcon />
          </IconButton>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }} onClick={() => {navigate("/")}}>
            {props.title}
          </Typography>
          <UserContext.Consumer>
              {context => (
                  context.user ?
                    <div>
                      <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenu}
                        color="inherit"
                      >
                        <AccountCircle />
                      </IconButton>
                      <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={(handleClose)}
                      >
                        <MenuItem onClick={handleProfile}>Profile</MenuItem>
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                      </Menu>
                    </div>
                  :
                    <>
                      <Button onClick={() => navigate("/login")} color="inherit">Login</Button>
                      <Button onClick={() => navigate("/register")} color="inherit">Register</Button>
                    </>
              )}
          </UserContext.Consumer>
        </Toolbar>
      </AppBar>
    </Box>
  );
}