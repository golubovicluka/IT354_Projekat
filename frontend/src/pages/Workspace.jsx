import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { exportToBlob } from '@excalidraw/excalidraw';
import ExcalidrawWrapper from '@/components/ExcalidrawWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  ArrowLeft,
  Eraser,
  FileText,
  ImageDown,
  LogOut,
  Save,
  SendHorizonal,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getDifficultyBadgeClassName } from '@/lib/badgeStyles';
import api from '@/lib/api';
import {
  formatJsonObject,
  parseElementsOrNull,
  parseJsonArray,
} from '@/lib/scenarioFormatters';

const Workspace = () => {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initialData, setInitialData] = useState(null);
  const [designId, setDesignId] = useState(null);
  const [syncStatus, setSyncStatus] = useState('Preparing workspace...');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const excalidrawAPIRef = useRef(null);
  const latestElementsRef = useRef([]);

  const parsedScenarioId = useMemo(() => {
    const parsed = Number.parseInt(scenarioId, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }, [scenarioId]);

  const draftStorageKey = useMemo(() => {
    if (!user?.id || !parsedScenarioId) {
      return null;
    }

    return `draft_design_${user.id}_${parsedScenarioId}`;
  }, [user?.id, parsedScenarioId]);

  useEffect(() => {
    let cancelled = false;

    const loadWorkspace = async () => {
      if (!parsedScenarioId) {
        setError('Invalid scenario id.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [scenarioResponse, draftResponse] = await Promise.all([
          api.get(`/scenarios/${parsedScenarioId}`),
          api.get(`/designs/scenario/${parsedScenarioId}/draft`),
        ]);

        if (cancelled) {
          return;
        }

        const loadedScenario = scenarioResponse.data;
        const loadedDraft = draftResponse.data;

        setScenario(loadedScenario);
        setDesignId(loadedDraft?.id ?? null);

        const localDraft = draftStorageKey ? localStorage.getItem(draftStorageKey) : null;
        const localElements = parseElementsOrNull(localDraft);

        if (localDraft && !localElements && draftStorageKey) {
          localStorage.removeItem(draftStorageKey);
        }

        const cloudElements = parseElementsOrNull(loadedDraft?.diagram_data);
        const preferredElements = localElements ?? cloudElements ?? [];
        latestElementsRef.current = preferredElements;
        setInitialData({ elements: preferredElements });

        if (localElements) {
          setSyncStatus('Recovered local draft.');
        } else if (cloudElements) {
          setSyncStatus('Loaded cloud draft.');
        } else {
          setSyncStatus('Ready to design.');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || 'Failed to load workspace.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadWorkspace();

    return () => {
      cancelled = true;
    };
  }, [draftStorageKey, parsedScenarioId]);

  const handleElementsChange = useCallback((elements) => {
    latestElementsRef.current = elements;

    if (!draftStorageKey) {
      return;
    }

    try {
      localStorage.setItem(draftStorageKey, JSON.stringify(elements));
      setSyncStatus('Autosaved locally.');
    } catch {
      setSyncStatus('Autosave failed.');
    }
  }, [draftStorageKey]);

  const handleApiReady = useCallback((apiInstance) => {
    excalidrawAPIRef.current = apiInstance;
    setIsCanvasReady(Boolean(apiInstance));
  }, []);

  const persistDraft = useCallback(async () => {
    if (!parsedScenarioId) {
      throw new Error('Invalid scenario id.');
    }

    if (!excalidrawAPIRef.current) {
      throw new Error('Whiteboard is still loading.');
    }

    const elements = excalidrawAPIRef.current.getSceneElements();
    latestElementsRef.current = elements;

    const diagramData = JSON.stringify(elements);
    const payload = { diagramData, textExplanation: '' };

    const response = designId
      ? await api.put(`/designs/${designId}`, payload)
      : await api.post('/designs', { scenarioId: parsedScenarioId, ...payload });

    const savedDesign = response.data;
    setDesignId(savedDesign.id);

    if (draftStorageKey) {
      localStorage.removeItem(draftStorageKey);
    }

    setSyncStatus('Cloud synced.');
    return savedDesign;
  }, [designId, draftStorageKey, parsedScenarioId]);

  const handleSaveDraft = async () => {
    setSaving(true);
    setError('');

    try {
      await persistDraft();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save draft.');
      setSyncStatus('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const savedDesign = await persistDraft();
      await api.patch(`/designs/${savedDesign.id}/submit`);

      if (draftStorageKey) {
        localStorage.removeItem(draftStorageKey);
      }

      setSyncStatus('Design submitted.');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to submit design.');
      setSyncStatus('Submit failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportImage = async () => {
    if (!excalidrawAPIRef.current) {
      return;
    }

    setError('');

    try {
      const blob = await exportToBlob({
        elements: excalidrawAPIRef.current.getSceneElements(),
        appState: excalidrawAPIRef.current.getAppState(),
        files: excalidrawAPIRef.current.getFiles(),
        mimeType: 'image/png',
      });

      const fileBaseName = (scenario?.title || 'system-design')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileBaseName || 'system-design'}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setSyncStatus('Image exported.');
    } catch {
      setError('Failed to export image.');
    }
  };

  const handleClearCanvas = () => {
    if (!excalidrawAPIRef.current) {
      return;
    }

    excalidrawAPIRef.current.updateScene({ elements: [] });
    latestElementsRef.current = [];

    if (draftStorageKey) {
      localStorage.removeItem(draftStorageKey);
    }

    setSyncStatus('Canvas cleared.');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading workspace...
      </div>
    );
  }

  if (!scenario) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-3 p-4 text-center">
        <h1 className="text-xl font-semibold">Workspace unavailable</h1>
        <p className="text-muted-foreground text-sm">{error || 'Scenario not found.'}</p>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="size-4" />
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
    <main className="flex h-screen flex-col">
      <header className="bg-background border-b px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="size-4" />
                  Scenario
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[92vw] sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>{scenario.title}</SheetTitle>
                  <SheetDescription>Review problem details while designing.</SheetDescription>
                </SheetHeader>

                <div className="mt-4 space-y-4 overflow-y-auto">
                  <div>
                    <p className="mb-1 text-sm font-medium">Difficulty</p>
                    <Badge className={getDifficultyBadgeClassName(scenario.difficulty)}>
                      {scenario.difficulty}
                    </Badge>
                  </div>

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
                    <pre className="bg-muted max-h-[50vh] overflow-auto rounded-md p-3 text-xs whitespace-pre-wrap break-words">
                      {capacityEstimations}
                    </pre>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div>
              <p className="text-sm font-semibold">{scenario.title}</p>
              <p className="text-muted-foreground text-xs">Scenario #{scenario.id}</p>
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCanvas}
              disabled={!isCanvasReady || saving || submitting}
            >
              <Eraser className="size-4" />
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportImage}
              disabled={!isCanvasReady || saving || submitting}
            >
              <ImageDown className="size-4" />
              Export Image
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSaveDraft}
              disabled={!isCanvasReady || saving || submitting}
            >
              <Save className="size-4" />
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!isCanvasReady || saving || submitting}
            >
              <SendHorizonal className="size-4" />
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <Badge className={getDifficultyBadgeClassName(scenario.difficulty)}>
            {scenario.difficulty}
          </Badge>
          {syncStatus && (
            <span className="text-muted-foreground">
              {syncStatus}
            </span>
          )}
          {error && <span className="text-red-700">{error}</span>}
        </div>
      </header>

      <section className="min-h-0 flex-1">
        {initialData ? (
          <ExcalidrawWrapper
            key={`workspace-${parsedScenarioId}`}
            initialData={initialData}
            onElementsChange={handleElementsChange}
            onApiReady={handleApiReady}
            className="h-full"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Preparing whiteboard...
          </div>
        )}
      </section>
    </main>
  );
};

export default Workspace;
