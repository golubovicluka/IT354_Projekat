import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import useAuth from '@/context/useAuth';

const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const homePath = !isAuthenticated
    ? '/login'
    : user?.role === 'ADMIN'
      ? '/admin/review'
      : '/dashboard';

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">404</CardTitle>
          <CardDescription>Page not found.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={() => navigate(homePath, { replace: true })}>
            Return to Home Page
          </Button>
        </CardContent>
      </Card>
    </main>
  );
};

export default NotFound;
