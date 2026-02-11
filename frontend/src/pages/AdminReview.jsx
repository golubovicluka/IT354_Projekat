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
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const parseElements = (value) => {
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

const formatJsonObject = (value, emptyText) => {
  if (!value || typeof value !== 'string') {
    return emptyText;
  }

  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return JSON.stringify(parsed, null, 2);
    }
  } catch {
    return value;
  }

  return emptyText;
};

const formatDateTime = (value) => {
  if (!value) {
    return 'N/A';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
};

const parsePositiveInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const statusBadgeClassName = {
  SUBMITTED: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  GRADED: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
};

const difficultyBadgeClassName = {
  EASY: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  MEDIUM: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  HARD: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
};

const AdminReview = () => {
  const { designId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [submittedDesigns, setSubmittedDesigns] = useState([]);
  const [gradedDesigns, setGradedDesigns] = useState([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [queueError, setQueueError] = useState('');

  const [selectedDesignId, setSelectedDesignId] = useState(null);
  const [design, setDesign] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [designLoading, setDesignLoading] = useState(false);
  const [designError, setDesignError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({ rating: '', comments: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const parsedRouteDesignId = useMemo(() => parsePositiveInt(designId), [designId]);

  const allReviewDesigns = useMemo(
    () => [...submittedDesigns, ...gradedDesigns],
    [submittedDesigns, gradedDesigns]
  );

  useEffect(() => {
    let cancelled = false;

    const loadQueue = async () => {
      setQueueLoading(true);
      setQueueError('');

      try {
        const [submittedResponse, gradedResponse] = await Promise.all([
          api.get('/designs?status=SUBMITTED'),
          api.get('/designs?status=GRADED'),
        ]);

        if (cancelled) {
          return;
        }

        setSubmittedDesigns(
          Array.isArray(submittedResponse.data) ? submittedResponse.data : []
        );
        setGradedDesigns(Array.isArray(gradedResponse.data) ? gradedResponse.data : []);
      } catch (error) {
        if (!cancelled) {
          setQueueError(error.response?.data?.error || 'Failed to load review queue.');
          setSubmittedDesigns([]);
          setGradedDesigns([]);
        }
      } finally {
        if (!cancelled) {
          setQueueLoading(false);
        }
      }
    };

    loadQueue();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (queueLoading) {
      return;
    }

    const findDesignById = (id) => allReviewDesigns.find((item) => item.id === id) || null;
    const hasRouteDesign = parsedRouteDesignId ? findDesignById(parsedRouteDesignId) : null;

    if (hasRouteDesign) {
      if (selectedDesignId !== parsedRouteDesignId) {
        setSelectedDesignId(parsedRouteDesignId);
      }
      return;
    }

    const fallbackDesignId = submittedDesigns[0]?.id || gradedDesigns[0]?.id || null;

    if (!fallbackDesignId) {
      if (selectedDesignId !== null) {
        setSelectedDesignId(null);
      }
      if (parsedRouteDesignId) {
        navigate('/admin/review', { replace: true });
      }
      return;
    }

    if (selectedDesignId !== fallbackDesignId) {
      setSelectedDesignId(fallbackDesignId);
    }

    if (parsedRouteDesignId !== fallbackDesignId) {
      navigate(`/admin/review/${fallbackDesignId}`, { replace: true });
    }
  }, [
    queueLoading,
    allReviewDesigns,
    gradedDesigns,
    navigate,
    parsedRouteDesignId,
    selectedDesignId,
    submittedDesigns,
  ]);

  useEffect(() => {
    let cancelled = false;

    const loadSelectedDesign = async () => {
      if (!selectedDesignId) {
        setDesign(null);
        setFeedback(null);
        setForm({ rating: '', comments: '' });
        setDesignError('');
        setDesignLoading(false);
        return;
      }

      setDesignLoading(true);
      setDesignError('');
      setSuccess('');

      try {
        const designResponse = await api.get(`/designs/${selectedDesignId}`);
        let loadedFeedback = null;

        try {
          const feedbackResponse = await api.get(`/feedback/${selectedDesignId}`);
          loadedFeedback = feedbackResponse.data;
        } catch (feedbackError) {
          if (feedbackError.response?.status !== 404) {
            throw feedbackError;
          }
        }

        if (cancelled) {
          return;
        }

        setDesign(designResponse.data);
        setFeedback(loadedFeedback);

        if (loadedFeedback) {
          setForm({
            rating: String(loadedFeedback.rating ?? ''),
            comments: loadedFeedback.comments || '',
          });
        } else {
          setForm({ rating: '', comments: '' });
        }
      } catch (error) {
        if (!cancelled) {
          setDesign(null);
          setFeedback(null);
          setForm({ rating: '', comments: '' });
          setDesignError(error.response?.data?.error || 'Failed to load review data.');
        }
      } finally {
        if (!cancelled) {
          setDesignLoading(false);
        }
      }
    };

    loadSelectedDesign();

    return () => {
      cancelled = true;
    };
  }, [selectedDesignId]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSelectDesign = (id) => {
    if (!id || id === selectedDesignId) {
      return;
    }

    setSelectedDesignId(id);
    setSheetOpen(false);
    setSuccess('');
    setDesignError('');
    navigate(`/admin/review/${id}`, { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedDesignId) {
      return;
    }

    setSubmitting(true);
    setDesignError('');
    setSuccess('');

    try {
      const rating = Number.parseInt(form.rating, 10);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error('Rating must be an integer between 1 and 5.');
      }

      const response = await api.post('/feedback', {
        designId: selectedDesignId,
        rating,
        comments: form.comments,
      });

      const savedFeedback = response.data?.feedback || null;

      if (savedFeedback) {
        setFeedback(savedFeedback);
        setForm({
          rating: String(savedFeedback.rating ?? ''),
          comments: savedFeedback.comments || '',
        });
      }

      setDesign((previous) => (previous ? { ...previous, status: 'GRADED' } : previous));

      setSubmittedDesigns((previous) =>
        previous.filter((item) => item.id !== selectedDesignId)
      );

      setGradedDesigns((previous) => {
        const withoutSelected = previous.filter((item) => item.id !== selectedDesignId);
        if (!design) {
          return withoutSelected;
        }

        return [{ ...design, status: 'GRADED' }, ...withoutSelected];
      });

      setSuccess('Feedback saved successfully.');
    } catch (error) {
      setDesignError(
        error.response?.data?.error || error.message || 'Failed to save feedback.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const elements = parseElements(design?.diagram_data);
  const functionalRequirements = parseJsonArray(design?.scenario_functional_requirements);
  const nonFunctionalRequirements = parseJsonArray(
    design?.scenario_non_functional_requirements
  );
  const capacityEstimations = formatJsonObject(
    design?.scenario_capacity_estimations,
    'No capacity estimations provided.'
  );

  return (
    <main className="flex h-screen flex-col">
      <header className="bg-background border-b px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" disabled={!design}>
                  Scenario
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[92vw] sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>{design?.scenario_title || 'No scenario selected'}</SheetTitle>
                  <SheetDescription>
                    Use requirements while grading this solution.
                  </SheetDescription>
                </SheetHeader>

                {design ? (
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
                ) : (
                  <p className="text-muted-foreground mt-4 text-sm">
                    Select a design from the queue to view scenario details.
                  </p>
                )}
              </SheetContent>
            </Sheet>

            <div>
              <p className="text-sm font-semibold">
                {design?.scenario_title || 'Admin Review Workspace'}
              </p>
              <p className="text-muted-foreground text-xs">
                {design
                  ? `Design #${design.id} by ${design.user_username}`
                  : 'Select a submitted or graded design from the queue.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/scenarios')}
            >
              Manage Scenarios
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {design?.status && (
            <Badge className={statusBadgeClassName[design.status] || ''}>{design.status}</Badge>
          )}
          {design?.scenario_difficulty && (
            <Badge className={difficultyBadgeClassName[design.scenario_difficulty] || ''}>
              {design.scenario_difficulty}
            </Badge>
          )}
          {feedback && (
            <span className="text-muted-foreground">
              Last graded by {feedback.admin_username}
            </span>
          )}
          {success && <span className="text-green-700">{success}</span>}
          {designError && <span className="text-red-700">{designError}</span>}
        </div>
      </header>

      <section className="grid min-h-0 flex-1 gap-4 p-4 lg:grid-cols-[320px_1fr]">
        <Card className="min-h-0">
          <CardHeader>
            <CardTitle>Review Queue</CardTitle>
            <CardDescription>
              Submitted and graded designs available for admin review.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex h-[calc(100vh-230px)] min-h-0 flex-col gap-4 overflow-hidden">
            {queueError && (
              <p className="rounded-md border border-red-400 bg-red-50 px-3 py-2 text-sm text-red-700">
                {queueError}
              </p>
            )}

            {queueLoading && <p className="text-sm">Loading review queue...</p>}

            {!queueLoading && !queueError && allReviewDesigns.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No submitted or graded designs available.
              </p>
            )}

            {!queueLoading && allReviewDesigns.length > 0 && (
              <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Submitted</p>
                    <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {submittedDesigns.length}
                    </Badge>
                  </div>

                  {submittedDesigns.length === 0 && (
                    <p className="text-muted-foreground text-xs">No submitted designs.</p>
                  )}

                  {submittedDesigns.map((item) => (
                    <button
                      key={`submitted-${item.id}`}
                      type="button"
                      className={`w-full rounded-md border p-3 text-left transition-colors ${
                        selectedDesignId === item.id
                          ? 'border-blue-400 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40'
                          : 'hover:bg-muted/60'
                      }`}
                      onClick={() => handleSelectDesign(item.id)}
                    >
                      <p className="text-sm font-medium">
                        {item.scenario_title || `Scenario #${item.scenario_id}`}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Design #{item.id} by {item.user_username || `User #${item.user_id}`}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Submitted: {formatDateTime(item.submitted_at)}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Graded</p>
                    <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                      {gradedDesigns.length}
                    </Badge>
                  </div>

                  {gradedDesigns.length === 0 && (
                    <p className="text-muted-foreground text-xs">No graded designs.</p>
                  )}

                  {gradedDesigns.map((item) => (
                    <button
                      key={`graded-${item.id}`}
                      type="button"
                      className={`w-full rounded-md border p-3 text-left transition-colors ${
                        selectedDesignId === item.id
                          ? 'border-green-400 bg-green-50 dark:border-green-700 dark:bg-green-950/40'
                          : 'hover:bg-muted/60'
                      }`}
                      onClick={() => handleSelectDesign(item.id)}
                    >
                      <p className="text-sm font-medium">
                        {item.scenario_title || `Scenario #${item.scenario_id}`}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Design #{item.id} by {item.user_username || `User #${item.user_id}`}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Submitted: {formatDateTime(item.submitted_at)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid min-h-0 gap-4 xl:grid-cols-[1fr_360px]">
          <div className="min-h-0 rounded-lg border">
            {designLoading && (
              <div className="flex h-full min-h-[400px] items-center justify-center text-sm">
                Loading design...
              </div>
            )}

            {!designLoading && !design && (
              <div className="text-muted-foreground flex h-full min-h-[400px] items-center justify-center px-4 text-center text-sm">
                {queueError
                  ? 'Review queue is unavailable right now.'
                  : 'Select a design from the queue to start reviewing.'}
              </div>
            )}

            {!designLoading && design && (
              <ExcalidrawWrapper
                key={`admin-review-${design.id}`}
                initialData={{ elements }}
                className="h-full min-h-[400px]"
                viewModeEnabled
              />
            )}
          </div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Grading Panel</CardTitle>
              <CardDescription>Rate the design and leave actionable comments.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="rating">
                    Score (1-5)
                  </label>
                  <select
                    id="rating"
                    name="rating"
                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                    value={form.rating}
                    onChange={(event) =>
                      setForm((previous) => ({ ...previous, rating: event.target.value }))
                    }
                    required
                    disabled={!design || submitting}
                  >
                    <option value="">Select rating</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="comments">
                    Comments
                  </label>
                  <Textarea
                    id="comments"
                    name="comments"
                    value={form.comments}
                    onChange={(event) =>
                      setForm((previous) => ({ ...previous, comments: event.target.value }))
                    }
                    placeholder="Explain strengths, trade-offs, and improvements..."
                    className="min-h-36"
                    disabled={!design || submitting}
                  />
                </div>

                <Button type="submit" disabled={!design || submitting}>
                  {submitting ? 'Saving...' : 'Save Grade'}
                </Button>
              </form>

              {design?.text_explanation && (
                <div className="mt-4 rounded-md border p-3">
                  <p className="mb-1 text-xs font-medium">User Explanation</p>
                  <p className="text-muted-foreground whitespace-pre-wrap text-sm">
                    {design.text_explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default AdminReview;
