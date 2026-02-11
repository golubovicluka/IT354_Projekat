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

const statusBadgeClassName = {
  SUBMITTED: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  GRADED: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
};

const AdminReview = () => {
  const { designId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [design, setDesign] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ rating: '', comments: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const parsedDesignId = useMemo(() => {
    const parsed = Number.parseInt(designId, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }, [designId]);

  useEffect(() => {
    let cancelled = false;

    const loadReview = async () => {
      if (!parsedDesignId) {
        setError('Invalid design id.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const designResponse = await api.get(`/designs/${parsedDesignId}`);
        let loadedFeedback = null;

        try {
          const feedbackResponse = await api.get(`/feedback/${parsedDesignId}`);
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
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || 'Failed to load review data.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadReview();

    return () => {
      cancelled = true;
    };
  }, [parsedDesignId]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const rating = Number.parseInt(form.rating, 10);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error('Rating must be an integer between 1 and 5.');
      }

      const response = await api.post('/feedback', {
        designId: parsedDesignId,
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
      setSuccess('Feedback saved successfully.');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading review...
      </div>
    );
  }

  if (!design) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-3 p-4 text-center">
        <h1 className="text-xl font-semibold">Review unavailable</h1>
        <p className="text-muted-foreground text-sm">{error || 'Design not found.'}</p>
        <Button variant="outline" onClick={() => navigate('/admin/reviews')}>
          Back to Review Queue
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
                  Scenario
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[92vw] sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>{design.scenario_title}</SheetTitle>
                  <SheetDescription>Use requirements while grading this solution.</SheetDescription>
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
              <p className="text-muted-foreground text-xs">
                Design #{design.id} by {design.user_username}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/reviews')}>
              Back
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <Badge className={statusBadgeClassName[design.status] || ''}>{design.status}</Badge>
          <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
            {design.scenario_difficulty}
          </Badge>
          {feedback && (
            <span className="text-muted-foreground">Last graded by {feedback.admin_username}</span>
          )}
          {success && <span className="text-green-700">{success}</span>}
          {error && <span className="text-red-700">{error}</span>}
        </div>
      </header>

      <section className="grid min-h-0 flex-1 gap-4 p-4 lg:grid-cols-[1fr_360px]">
        <div className="min-h-0 rounded-lg border">
          <ExcalidrawWrapper
            key={`admin-review-${design.id}`}
            initialData={{ elements }}
            className="h-full min-h-[400px]"
            viewModeEnabled
          />
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
                    setForm((prev) => ({ ...prev, rating: event.target.value }))
                  }
                  required
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
                    setForm((prev) => ({ ...prev, comments: event.target.value }))
                  }
                  placeholder="Explain strengths, trade-offs, and improvements..."
                  className="min-h-36"
                />
              </div>

              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Grade'}
              </Button>
            </form>

            {design.text_explanation && (
              <div className="mt-4 rounded-md border p-3">
                <p className="mb-1 text-xs font-medium">User Explanation</p>
                <p className="text-muted-foreground whitespace-pre-wrap text-sm">
                  {design.text_explanation}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default AdminReview;
