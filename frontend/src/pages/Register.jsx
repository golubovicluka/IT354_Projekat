import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const Register = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { register } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await register(username, email, password)
            navigate('/login')
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <div style={{ width: '300px' }}>
                <h1 style={{ textAlign: "center", marginBottom: '20px' }}>Register</h1>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Input
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        minLength={3}
                        maxLength={30}
                    />
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                    {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </Button>
                </form>
                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                    <p style={{ fontSize: '14px' }}>Already have an account?</p>
                    <Link to="/login" style={{ fontSize: '14px', textDecoration: 'underline' }}>Login</Link>
                </div>
            </div>
        </div>
    )
}

export default Register