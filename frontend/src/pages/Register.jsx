import { Input } from '@/components/ui/input'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const Register = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <div style={{ width: '300px' }}>
                <h1 style={{ textAlign: "center" }}>Register</h1>
                <Input placeholder="Username" />
                <Input placeholder="Email" />
                <Input placeholder="Password" />
                <p>Already have an account?</p>
                <Link to="/login">Login</Link>
                <br />
                <Button>Register</Button>
            </div>
        </div>
    )
}

export default Register