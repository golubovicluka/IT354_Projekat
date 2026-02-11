import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const Dashboard = () => {
    const [scenarios, setScenarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchScenarios = async () => {
            try {
                const response = await api.get('/scenarios');
                setScenarios(response.data);
            } catch {
                setError('Failed to load scenarios');
            } finally {
                setLoading(false);
            }
        };
        fetchScenarios();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getDifficultyClassName = (difficulty) => {
        switch (difficulty) {
            case 'EASY':
                return 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300';
            case 'MEDIUM':
                return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
            case 'HARD':
                return 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300';
            default:
                return '';
        }
    };

    const parseJsonArray = (value) => {
        if (!value || typeof value !== 'string') {
            return [];
        }

        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    const parseJsonObject = (value) => {
        if (!value || typeof value !== 'string') {
            return null;
        }

        try {
            const parsed = JSON.parse(value);
            return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
                ? parsed
                : null;
        } catch {
            return null;
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading scenarios...</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Dashboard</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>Welcome, {user?.username}</span>
                    {user?.role === 'ADMIN' && (
                        <Button variant="outline" onClick={() => navigate('/admin/scenarios')}>
                            Manage Scenarios
                        </Button>
                    )}
                    <Button variant="outline" onClick={handleLogout}>Logout</Button>
                </div>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <h2 style={{ marginBottom: '15px' }}>Available Scenarios</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {scenarios.map((scenario) => {
                    const functionalRequirements = parseJsonArray(scenario.functional_requirements);
                    const capacityEstimations = parseJsonObject(
                        scenario.capacity_estimations || scenario.constraints
                    );
                    const capacitySummary = capacityEstimations
                        ? Object.entries(capacityEstimations)
                              .slice(0, 3)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(' | ')
                        : '';

                    return (
                        <Card key={scenario.id}>
                            <CardHeader>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <CardTitle>{scenario.title}</CardTitle>
                                    <Badge className={getDifficultyClassName(scenario.difficulty)}>
                                        {scenario.difficulty}
                                    </Badge>
                                </div>
                                <CardDescription>{scenario.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {functionalRequirements.length > 0 && (
                                    <p style={{ fontSize: '14px', color: '#666', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                                        <strong>Functional:</strong> {functionalRequirements.slice(0, 2).join(', ')}
                                    </p>
                                )}

                                {capacitySummary && (
                                    <p style={{ marginTop: '6px', fontSize: '14px', color: '#666', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                                        <strong>Capacity:</strong> {capacitySummary}
                                    </p>
                                )}

                                <Button
                                    style={{ marginTop: '10px' }}
                                    onClick={() => navigate(`/workspace/${scenario.id}`)}
                                >
                                    Start Design
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {scenarios.length === 0 && !error && (
                <p>No scenarios available.</p>
            )}
        </div>
    );
};

export default Dashboard;
