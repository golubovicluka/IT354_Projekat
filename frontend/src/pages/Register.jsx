import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '@/context/useAuth'

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
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 p-4">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,#cbd5e133,transparent_55%),radial-gradient(circle_at_bottom_right,#1e293b1a,transparent_60%)]" />

            <Card className="relative z-10 w-full max-w-md border-slate-200/80 bg-white/90 shadow-xl backdrop-blur-sm">
                <CardHeader className="space-y-2 text-center">
                    <CardTitle className="text-2xl tracking-tight">Create account</CardTitle>
                    <CardDescription>
                        Join Architex and start practicing system design scenarios.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-medium text-slate-700">
                                Username
                            </label>
                            <Input
                                id="username"
                                placeholder="your_username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                minLength={3}
                                maxLength={30}
                                autoComplete="username"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-slate-700">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                autoComplete="new-password"
                            />
                        </div>

                        {error && (
                            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {error}
                            </p>
                        )}

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? 'Registering...' : 'Register'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-600">
                        <p>Already have an account?</p>
                        <Link
                            to="/login"
                            className="font-medium text-slate-900 underline underline-offset-4 transition hover:text-slate-700"
                        >
                            Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}

export default Register
