import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ExcalidrawWrapper from '@/components/ExcalidrawWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ArrowLeft, FileText, LogOut } from 'lucide-react';
import useAuth from '@/context/useAuth';
import { difficultyBadgeClassName, designStatusBadgeClassName } from '@/lib/badgeStyles';
import { designService } from '@/services/designService';
import {
  formatDateTime,
  formatJsonObject,
  parseElements,
  parseJsonArray,
} from '@/lib/scenarioFormatters';

const FeedbackView = () => {
  const { designId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [design, setDesign] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);

  const parsedDesignId = useMemo(() => {
    const parsed = Number.parseInt(designId, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }, [designId]);

  useEffect(() => {
    let cancelled = false;

    const loadFeedback = async () => {
      if (user?.role === 'ADMIN') {
        const adminTarget = parsedDesignId
          ? `/admin/review/${parsedDesignId}`
          : '/admin/review';
        navigate(adminTarget, { replace: true });
        return;
      }

      if (!parsedDesignId) {
        setError('Invalid design id.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const designData = await designService.getById(parsedDesignId);
        let loadedFeedback = null;

        try {
          loadedFeedback = await designService.getFeedback(parsedDesignId);
        } catch (feedbackError) {
          if (feedbackError.response?.status !== 404) {
            throw feedbackError;
          }
        }

        if (cancelled) {
          return;
        }

        setDesign(designData);
        setFeedback(loadedFeedback);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || 'Failed to load feedback.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadFeedback();

    return () => {
      cancelled = true;
    };
  }, [navigate, parsedDesignId, user?.role]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading feedback...
      </div>
    );
  }

  if (!design) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-3 p-4 text-center">
        <h1 className="text-xl font-semibold">Feedback unavailable</h1>
        <p className="text-muted-foreground text-sm">{error || 'Design not found.'}</p>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Button>
      </main>
    );
  }

  const elements = parseElements(design.diagram_data);
  const functionalRequirements = parseJsonArray(design.scenario_functional_requirements);
  const nonFunctionalRequirements = parseJsonArray(design.scenario_non_functional_requirements);
  const capacityEstimations = formatJsonObject(
    design.scenario_capacity_estimations,
    'No capacity estimations provided.'
  );

  return (
    <main className="flex h-screen flex-col">
      <header className="bg-background border-b px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="size-4" />
                  Scenario
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[92vw] sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>{design.scenario_title}</SheetTitle>
                  <SheetDescription>Review the prompt while reading your feedback.</SheetDescription>
                </SheetHeader>

                <div className="mt-4 space-y-4 overflow-y-auto">
                  <div>
                    <p className="mb-1 text-sm font-medium">Description</p>
                    <p className="text-muted-foreground whitespace-pre-wrap text-sm">
                      {design.scenario_description}
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
                    <pre className="bg-muted max-h-[50vh] overflow-auto rounded-md p-3 text-xs whitespace-pre-wrap break-words">
                      {capacityEstimations}
                    </pre>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div>
              <p className="text-sm font-semibold">{design.scenario_title}</p>
              <p className="text-muted-foreground text-xs">Design #{design.id}</p>
            </div>
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
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <Badge className={designStatusBadgeClassName[design.status] || ''}>{design.status}</Badge>
          <Badge className={difficultyBadgeClassName[design.scenario_difficulty] || ''}>
            {design.scenario_difficulty}
          </Badge>
          {error && <span className="text-red-700">{error}</span>}
        </div>
      </header>

      <section className="grid min-h-0 flex-1 gap-4 p-4 lg:grid-cols-[1fr_360px]">
        <div className="min-h-0 rounded-lg border">
          <ExcalidrawWrapper
            key={`feedback-view-${design.id}`}
            initialData={{ elements }}
            className="h-full min-h-[400px]"
            viewModeEnabled
          />
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
            <CardDescription>Admin evaluation for this design attempt.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!feedback && (
              <p className="text-muted-foreground text-sm">
                Feedback is not available yet. Your design may still be waiting for review.
              </p>
            )}

            {feedback && (
              <>
                <div className="rounded-md border p-3">
                  <p className="text-xs font-medium">Score</p>
                  <p className="text-lg font-semibold">{feedback.rating} / 5</p>
                </div>

                <div className="rounded-md border p-3">
                  <p className="text-xs font-medium">Comments</p>
                  <p className="text-muted-foreground mt-1 whitespace-pre-wrap text-sm">
                    {feedback.comments || 'No comments provided.'}
                  </p>
                </div>

                <p className="text-muted-foreground text-xs">
                  Graded by {feedback.admin_username || `Admin #${feedback.admin_id}`} on{' '}
                  {formatDateTime(feedback.created_at)}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default FeedbackView;
