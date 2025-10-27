import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../userContext';
import { Container } from '@mui/material';
import { Typography } from '@mui/material';
import { AccountCircle, Email } from '@mui/icons-material';

function Profile(){
    const [profile, setProfile] = useState({});

    useEffect(function(){
        const getProfile = async function(){
            const res = await fetch("http://localhost:3001/users/profile", {credentials: "include"});
            const data = await res.json();
            setProfile(data);
        }
        getProfile();
    }, []);

    return (
        <Container>
            <Typography variant="h4">
                User profile
            </Typography>
            <br></br>
            <Typography>
                <AccountCircle /> {profile.username}
            </Typography>
            <Typography>
                <Email /> {profile.email}
            </Typography>
        </Container>
    );
}

export default Profile;