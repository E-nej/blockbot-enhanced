import { useContext, useState } from 'react';
import { UserContext } from '../userContext';
import { Navigate } from 'react-router-dom';
import { Container } from '@mui/material';

function Login(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const userContext = useContext(UserContext); 

    async function Login(e){
        e.preventDefault();
        const res = await fetch("http://localhost:3001/users/login", {
            method: "POST",
            credentials: "include",
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        const data = await res.json();
        if(data._id !== undefined){
            userContext.setUserContext(data);
        } else {
            setUsername("");
            setPassword("");
            setError("Invalid username or password");
        }
    }

    return (
        <Container>
            <form onSubmit={Login}>
                {userContext.user ? <Navigate replace to="/" /> : ""}
                <input type="text" name="username" placeholder="Username" className="form-control input-row"
                value={username} onChange={(e)=>(setUsername(e.target.value))}/>
                <input type="password" name="password" placeholder="Password" className="form-control input-row"
                value={password} onChange={(e)=>(setPassword(e.target.value))}/>
                <input type="submit" name="submit" className="btn btn-primary input-row" value="Log in"/>
                <label>{error}</label>
            </form>
        </Container>
    );
}

export default Login;