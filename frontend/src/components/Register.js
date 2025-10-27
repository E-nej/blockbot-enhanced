import { Container } from '@mui/material';
import { useState } from 'react';

function Register() {
    const [username, setUsername] = useState([]);
    const [password, setPassword] = useState([]);
    const [email, setEmail] = useState([]);
    const [error, setError] = useState([]);

    async function Register(e){
        e.preventDefault();
        const res = await fetch("http://localhost:3001/users", {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                username: username,
                password: password
            })
        });
        const data = await res.json();
        if(data._id !== undefined){
            window.location.href="/";
        }
        else{
            setUsername("");
            setPassword("");
            setEmail("");
            setError("Registration failed");
        }
    }

    return(
        <Container>
            <form onSubmit={Register}>
                <input className="form-control input-row" type="text" name="email" placeholder="Email" value={email} onChange={(e)=>(setEmail(e.target.value))} />
                <input className="form-control input-row" type="text" name="username" placeholder="Username" value={username} onChange={(e)=>(setUsername(e.target.value))}/>
                <input className="form-control input-row" type="password" name="password" placeholder="Password" value={password} onChange={(e)=>(setPassword(e.target.value))} />
                <input className="btn btn-primary input-row" type="submit" name="submit" value="Login" />
                <label>{error}</label>
            </form>
        </Container>
    );
}

export default Register;