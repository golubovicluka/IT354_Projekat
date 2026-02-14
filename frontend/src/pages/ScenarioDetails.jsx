import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, LogOut, MessageSquare, Pencil, Play, Send } from 'lucide-react';
import useAuth from '@/context/useAuth';
import { getDifficultyBadgeClassName, getDesignStatusBadgeClassName } from '@/lib/badgeStyles';
import { scenarioService } from '@/services/scenarioService';
import { designService } from '@/services/designService';
import { formatJsonObject, parseJsonArray } from '@/lib/scenarioFormatters';

const ScenarioDetails = () => {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [scenario, setScenario] = useState(null);
  const [latestDesign, setLatestDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [designsError, setDesignsError] = useState('');

  const parsedScenarioId = useMemo(() => {
    const parsed = Number.parseInt(scenarioId, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }, [scenarioId]);

  useEffect(() => {
    let cancelled = false;

    const loadScenarioDetails = async () => {
      if (!parsedScenarioId) {
        setError('Invalid scenario id.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      setDesignsError('');

      try {
        const [scenarioResult, designsResult] = await Promise.allSettled([
          scenarioService.getById(parsedScenarioId),
          designService.getAll(),
        ]);

        if (cancelled) {
          return;
        }

        if (scenarioResult.status === 'fulfilled') {
          setScenario(scenarioResult.value || null);
        } else {
          setScenario(null);
          setError(scenarioResult.reason?.response?.data?.error || 'Failed to load scenario.');
        }

        if (designsResult.status === 'fulfilled') {
          const designs = Array.isArray(designsResult.value) ? designsResult.value : [];
          const userScopedDesigns = user?.id
            ? designs.filter((design) => design.user_id === user.id)
            : designs;
          const scenarioDesign = userScopedDesigns.find(
            (design) => design.scenario_id === parsedScenarioId
          );

          setLatestDesign(scenarioDesign || null);
        } else {
          setLatestDesign(null);
          setDesignsError('Could not load your design status for this scenario.');
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load scenario details.');
          setScenario(null);
          setLatestDesign(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadScenarioDetails();

    return () => {
      cancelled = true;
    };
  }, [parsedScenarioId, user?.id]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const existingStatus = latestDesign?.status || null;
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

  const handlePrimaryAction = () => {
    if (!scenario) {
      return;
    }

    if (isGraded && latestDesign?.id) {
      navigate(`/feedback/${latestDesign.id}`);
      return;
    }

    navigate(`/workspace/${scenario.id}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading scenario details...
      </div>
    );
  }

  if (!scenario) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-3 p-4 text-center">
        <h1 className="text-xl font-semibold">Scenario unavailable</h1>
        <p className="text-muted-foreground text-sm">{error || 'Scenario not found.'}</p>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </main>
    );
  }

  const functionalRequirements = parseJsonArray(scenario.functional_requirements);
  const nonFunctionalRequirements = parseJsonArray(scenario.non_functional_requirements);
  const capacityEstimations = formatJsonObject(
    scenario.capacity_estimations || scenario.constraints,
    'No capacity estimations provided.'
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-4 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{scenario.title}</p>
          <p className="text-muted-foreground text-xs">Scenario #{scenario.id}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge className={getDifficultyBadgeClassName(scenario.difficulty)}>
          {scenario.difficulty}
        </Badge>
        {existingStatus && (
          <Badge className={getDesignStatusBadgeClassName(existingStatus)}>
            {existingStatus}
          </Badge>
        )}
        {designsError && <span className="text-amber-700">{designsError}</span>}
        {error && <span className="text-red-700">{error}</span>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scenario Details</CardTitle>
          <CardDescription>Read the full prompt before starting your design.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-1 text-sm font-medium">Description</p>
            <p className="text-muted-foreground whitespace-pre-wrap text-sm">
              {scenario.description}
            </p>
          </div>

          <div>
            <p className="mb-1 text-sm font-medium">Functional Requirements</p>
            {functionalRequirements.length > 0 ? (
              <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
                {functionalRequirements.map((requirement, index) => (
                  <li key={`functional-${index}`}>{String(requirement)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                No functional requirements provided.
              </p>
            )}
          </div>

          <div>
            <p className="mb-1 text-sm font-medium">Non-Functional Requirements</p>
            {nonFunctionalRequirements.length > 0 ? (
              <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
                {nonFunctionalRequirements.map((requirement, index) => (
                  <li key={`non-functional-${index}`}>{String(requirement)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                No non-functional requirements provided.
              </p>
            )}
          </div>

          <div>
            <p className="mb-1 text-sm font-medium">Capacity Estimations</p>
            <pre className="bg-muted max-h-[40vh] overflow-auto rounded-md p-3 text-xs whitespace-pre-wrap break-words">
              {capacityEstimations}
            </pre>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handlePrimaryAction}
            disabled={isSubmitted || (isGraded && !latestDesign?.id)}
          >
            <ActionIcon className="size-4" />
            {actionLabel}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
};

export default ScenarioDetails;
