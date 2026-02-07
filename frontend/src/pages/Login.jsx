import React from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link } from 'react-router-dom'

const Login = () => {
    return (
        <div>
            <Input placeholder="Username" />
            <Input placeholder="Password" />
            <Button>Login</Button>
            <p>Don't have an account?</p>
            <Link to="/register">Register</Link>
        </div>
    )
}

export default Login