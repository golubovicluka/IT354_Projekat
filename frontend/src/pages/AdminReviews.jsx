import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

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

const AdminReviews = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmittedDesigns = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/designs?status=SUBMITTED');
        setDesigns(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load submitted designs.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmittedDesigns();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <main className="mx-auto w-full max-w-6xl p-4 md:p-8">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Review Queue</h1>
          <p className="text-muted-foreground text-sm">
            Submitted designs waiting for evaluation, {user?.username}.
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

      <Card>
        <CardHeader>
          <CardTitle>Submitted Designs</CardTitle>
          <CardDescription>Open a design to grade and leave review notes.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-3 rounded-md border border-red-400 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {loading && <p className="text-sm">Loading submitted designs...</p>}

          {!loading && !error && designs.length === 0 && (
            <p className="text-muted-foreground text-sm">No submitted designs in the queue.</p>
          )}

          <div className="space-y-3">
            {designs.map((design) => (
              <article
                key={design.id}
                className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{design.scenario_title || `Scenario #${design.scenario_id}`}</h3>
                    <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {design.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Architect: {design.user_username || `User #${design.user_id}`}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Submitted: {formatDateTime(design.submitted_at)}
                  </p>
                </div>

                <Button onClick={() => navigate(`/admin/review/${design.id}`)}>Review</Button>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default AdminReviews;
