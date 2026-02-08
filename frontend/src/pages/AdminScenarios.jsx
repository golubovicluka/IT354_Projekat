import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const INITIAL_FORM = {
  title: '',
  description: '',
  difficulty: 'EASY',
  constraints: '',
};

const difficultyColor = {
  EASY: 'bg-green-500 text-white',
  MEDIUM: 'bg-yellow-500 text-black',
  HARD: 'bg-red-500 text-white',
};

const prettyConstraints = (constraints) => {
  if (!constraints) {
    return 'No constraints provided.';
  }

  try {
    return JSON.stringify(JSON.parse(constraints), null, 2);
  } catch {
    return constraints;
  }
};

const normalizeConstraints = (constraintsInput) => {
  const trimmed = constraintsInput.trim();
  if (!trimmed) {
    return '';
  }

  try {
    return JSON.stringify(JSON.parse(trimmed));
  } catch {
    throw new Error('Constraints must be valid JSON.');
  }
};

const AdminScenarios = () => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [openDialogId, setOpenDialogId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const isEditing = editingId !== null;

  const fetchScenarios = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/scenarios');
      setScenarios(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load scenarios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
  };

  const onFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditStart = (scenario) => {
    setSuccess('');
    setError('');
    setEditingId(scenario.id);
    setForm({
      title: scenario.title || '',
      description: scenario.description || '',
      difficulty: scenario.difficulty || 'EASY',
      constraints: prettyConstraints(scenario.constraints),
    });
  };

  const validateBaseFields = () => {
    if (!form.title.trim() || !form.description.trim() || !form.difficulty) {
      throw new Error('Title, description, and difficulty are required.');
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      validateBaseFields();
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        difficulty: form.difficulty,
        constraints: normalizeConstraints(form.constraints),
      };
      await api.post('/scenarios', payload);
      setSuccess('Scenario created successfully.');
      resetForm();
      await fetchScenarios();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create scenario.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      validateBaseFields();
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        difficulty: form.difficulty,
        constraints: normalizeConstraints(form.constraints),
      };
      await api.put(`/scenarios/${editingId}`, payload);
      setSuccess('Scenario updated successfully.');
      resetForm();
      await fetchScenarios();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update scenario.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (scenario) => {
    setDeletingId(scenario.id);
    setError('');
    setSuccess('');

    try {
      await api.delete(`/scenarios/${scenario.id}`);
      setScenarios((prev) => prev.filter((item) => item.id !== scenario.id));
      if (editingId === scenario.id) {
        resetForm();
      }
      if (openDialogId === scenario.id) {
        setOpenDialogId(null);
      }
      setSuccess('Scenario deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete scenario.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl p-4 md:p-8">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Scenarios</h1>
          <p className="text-muted-foreground text-sm">
            Manage system design scenarios as {user?.username}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      {(error || success) && (
        <div className="mb-4 space-y-2">
          {error && (
            <p className="rounded-md border border-red-400 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-md border border-green-400 bg-green-50 px-3 py-2 text-sm text-green-700">
              {success}
            </p>
          )}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Scenario' : 'Create Scenario'}</CardTitle>
            <CardDescription>
              {isEditing
                ? 'Update scenario details and save changes.'
                : 'Add a new scenario for users to solve.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-3"
              onSubmit={isEditing ? handleUpdate : handleCreate}
            >
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="scenario-title">
                  Title
                </label>
                <Input
                  id="scenario-title"
                  name="title"
                  value={form.title}
                  onChange={onFieldChange}
                  placeholder="Design Uber"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="scenario-description">
                  Description
                </label>
                <Textarea
                  id="scenario-description"
                  name="description"
                  value={form.description}
                  onChange={onFieldChange}
                  placeholder="Describe the core system design problem."
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="scenario-difficulty">
                  Difficulty
                </label>
                <select
                  id="scenario-difficulty"
                  name="difficulty"
                  className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                  value={form.difficulty}
                  onChange={onFieldChange}
                  required
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="scenario-constraints">
                  Constraints (JSON)
                </label>
                <Textarea
                  id="scenario-constraints"
                  name="constraints"
                  value={form.constraints}
                  onChange={onFieldChange}
                  placeholder='{"users":"10M","latency":"200ms"}'
                  className="min-h-32 font-mono text-xs"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? isEditing
                      ? 'Saving...'
                      : 'Creating...'
                    : isEditing
                      ? 'Save Changes'
                      : 'Create Scenario'}
                </Button>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Scenarios</CardTitle>
            <CardDescription>Edit or remove existing records.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && <p className="text-sm">Loading scenarios...</p>}

            {!loading && scenarios.length === 0 && (
              <p className="text-muted-foreground text-sm">No scenarios found.</p>
            )}

            <div className="space-y-3">
              {scenarios.map((scenario) => (
                <article key={scenario.id} className="rounded-lg border p-4">
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{scenario.title}</h3>
                      <p className="text-muted-foreground text-sm">
                        {scenario.description}
                      </p>
                    </div>
                    <Badge className={difficultyColor[scenario.difficulty] || ''}>
                      {scenario.difficulty}
                    </Badge>
                  </div>

                  <div className="mb-3 rounded-md bg-muted p-2">
                    <p className="mb-1 text-xs font-medium">Constraints</p>
                    <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words text-xs">
                      {prettyConstraints(scenario.constraints)}
                    </pre>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditStart(scenario)}
                    >
                      Edit
                    </Button>
                    <Dialog
                      open={openDialogId === scenario.id}
                      onOpenChange={(open) => {
                        if (deletingId === scenario.id) {
                          return;
                        }
                        setOpenDialogId(open ? scenario.id : null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setOpenDialogId(scenario.id)}
                          disabled={deletingId === scenario.id}
                        >
                          {deletingId === scenario.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Scenario</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete &quot;{scenario.title}&quot;?
                            This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button
                              type="button"
                              variant="outline"
                              disabled={deletingId === scenario.id}
                            >
                              Cancel
                            </Button>
                          </DialogClose>
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => handleDelete(scenario)}
                            disabled={deletingId === scenario.id}
                          >
                            {deletingId === scenario.id ? 'Deleting...' : 'Delete Scenario'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default AdminScenarios;
