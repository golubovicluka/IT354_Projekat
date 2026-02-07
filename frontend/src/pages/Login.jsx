import React from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const Login = () => {
    return (
        <div>
            <Input placeholder="Username" />
            <Input placeholder="Password" />
            <Button>Login</Button>
        </div>
    )
}

export default Login