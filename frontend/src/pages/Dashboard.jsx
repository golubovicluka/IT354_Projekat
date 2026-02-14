import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, Info, LogOut, MessageSquare, Pencil, Play, Send, Settings } from 'lucide-react';
import useAuth from '@/context/useAuth';
import { getDifficultyBadgeClassName, getDesignStatusBadgeClassName } from '@/lib/badgeStyles';
import api from '@/lib/api';
import { parseJsonArray, parseJsonObject } from '@/lib/scenarioFormatters';

const Dashboard = () => {
    const [scenarios, setScenarios] = useState([]);
    const [designsByScenarioId, setDesignsByScenarioId] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [designsError, setDesignsError] = useState('');
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [scenariosResult, designsResult] = await Promise.allSettled([
                    api.get('/scenarios'),
                    api.get('/designs'),
                ]);

                if (scenariosResult.status === 'fulfilled') {
                    setScenarios(scenariosResult.value.data || []);
                    setError('');
                } else {
                    setError('Failed to load scenarios');
                    setScenarios([]);
                }

                if (designsResult.status === 'fulfilled') {
                    const latestDesignByScenario = {};
                    const designs = Array.isArray(designsResult.value.data) ? designsResult.value.data : [];
                    const userScopedDesigns = user?.id
                        ? designs.filter((design) => design.user_id === user.id)
                        : designs;

                    for (const design of userScopedDesigns) {
                        if (!design?.scenario_id) {
                            continue;
                        }

                        if (!latestDesignByScenario[design.scenario_id]) {
                            latestDesignByScenario[design.scenario_id] = design;
                        }
                    }

                    setDesignsByScenarioId(latestDesignByScenario);
                    setDesignsError('');
                } else {
                    setDesignsByScenarioId({});
                    setDesignsError('Could not load your design statuses. You can still start new designs.');
                }
            } catch {
                setError('Failed to load scenarios');
                setScenarios([]);
                setDesignsByScenarioId({});
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user?.id]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="px-5 py-5 text-center text-sm text-muted-foreground">
                Loading scenarios...
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-6xl px-5 py-5">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-sm text-muted-foreground">Welcome, {user?.username}</span>
                    {user?.role === 'ADMIN' && (
                        <>
                            <Button variant="outline" onClick={() => navigate('/admin/review')}>
                                <ClipboardCheck className="size-4" />
                                Review Designs
                            </Button>
                            <Button variant="outline" onClick={() => navigate('/admin/scenarios')}>
                                <Settings className="size-4" />
                                Manage Scenarios
                            </Button>
                        </>
                    )}
                    <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="size-4" />
                        Logout
                    </Button>
                </div>
            </div>

            {error && <p className="mb-3 text-sm font-medium text-red-600">{error}</p>}
            {designsError && !error && (
                <p className="mb-3 text-sm font-medium text-amber-700">{designsError}</p>
            )}

            <h2 className="mb-4 text-lg font-semibold">Available Scenarios</h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {scenarios.map((scenario) => {
                    const existingDesign = designsByScenarioId[scenario.id] || null;
                    const existingStatus = existingDesign?.status || null;
                    const isDraft = existingStatus === 'DRAFT';
                    const isSubmitted = existingStatus === 'SUBMITTED';
                    const isGraded = existingStatus === 'GRADED';
                    const actionLabel = isDraft
                        ? 'Continue Draft'
                        : isGraded
                            ? 'View Feedback'
                            : isSubmitted
                                ? 'Submitted'
                                : 'Start Design';
                    const ActionIcon = isDraft
                        ? Pencil
                        : isGraded
                            ? MessageSquare
                            : isSubmitted
                                ? Send
                                : Play;

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
                        <Card key={scenario.id} className="h-full">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle>{scenario.title}</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Badge className={getDifficultyBadgeClassName(scenario.difficulty)}>
                                            {scenario.difficulty}
                                        </Badge>
                                        {existingStatus && (
                                            <Badge className={getDesignStatusBadgeClassName(existingStatus)}>
                                                {existingStatus}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <CardDescription>{scenario.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-2">
                                {functionalRequirements.length > 0 && (
                                    <p className="break-words text-sm text-muted-foreground">
                                        <strong>Functional:</strong> {functionalRequirements.slice(0, 2).join(', ')}
                                    </p>
                                )}

                                {capacitySummary && (
                                    <p className="break-words text-sm text-muted-foreground">
                                        <strong>Capacity:</strong> {capacitySummary}
                                    </p>
                                )}

                            </CardContent>
                            <CardFooter className="mt-auto flex w-full flex-col gap-2 sm:flex-row">
                                <Button
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                    onClick={() => navigate(`/scenario/${scenario.id}/details`)}
                                >
                                    <Info className="size-4" />
                                    Details
                                </Button>
                                <Button
                                    className="w-full sm:w-auto"
                                    onClick={() => {
                                        if (isGraded && existingDesign?.id) {
                                            navigate(`/feedback/${existingDesign.id}`);
                                            return;
                                        }

                                        navigate(`/workspace/${scenario.id}`);
                                    }}
                                    disabled={isSubmitted || (isGraded && !existingDesign?.id)}
                                >
                                    <ActionIcon className="size-4" />
                                    {actionLabel}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {scenarios.length === 0 && !error && (
                <p className="mt-4 text-sm text-muted-foreground">No scenarios available.</p>
            )}
        </div>
    );
};

export default Dashboard;
