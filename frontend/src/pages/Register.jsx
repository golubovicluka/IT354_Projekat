import { Input } from '@/components/ui/input'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const Register = () => {
    return (
        <div>
            <h1 style={{ textAlign: "center" }}>Register</h1>
            <Input placeholder="Username" />
            <Input placeholder="Email" />
            <Input placeholder="Password" />
            <p>Already have an account?</p>
            <Link to="/login">Login</Link>
            <br />
            <Button>Register</Button>
        </div>
    )
}

export default Register