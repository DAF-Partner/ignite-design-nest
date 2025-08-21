// Professional Login Page for B2B Debt Collection Platform
// GDPR-compliant authentication with terms acceptance

import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Building2, Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/contexts/TranslationContext';
import { cn } from '@/lib/utils';

interface LocationState {
  from?: {
    pathname: string;
  };
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, error, clearError } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const location = useLocation();
  
  const state = location.state as LocationState;
  const from = state?.from?.pathname || '/dashboard';

  // Clear any previous errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      toast({
        title: t('termsRequired'),
        description: t('acceptTermsMessage'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      await login(email, password);
      
      toast({
        title: t('welcomeBack'),
        description: t('successfullyLoggedIn'),
      });
    } catch (err) {
      // Error is handled by AuthProvider, just show in UI
      console.error('Login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { email: 'client@example.com', password: 'password123', role: 'CLIENT' },
    { email: 'agent@example.com', password: 'password123', role: 'AGENT' },
    { email: 'admin@example.com', password: 'password123', role: 'ADMIN' },
    { email: 'dpo@example.com', password: 'password123', role: 'DPO' },
  ];

  const fillDemoCredentials = (credentials: typeof demoCredentials[0]) => {
    setEmail(credentials.email);
    setPassword(credentials.password);
    setAcceptTerms(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-surface p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t('collectPro')}</h1>
          <p className="text-muted-foreground">
            {t('professionalDebtCollection')}
          </p>
        </div>

        {/* Login Form */}
        <Card className="card-professional">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">{t('loginTitle')}</CardTitle>
            <CardDescription className="text-center">
              {t('loginDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="form-field">
                <Label htmlFor="email" className="form-label">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              {/* Password Field */}
              <div className="form-field">
                <Label htmlFor="password" className="form-label">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                  disabled={isLoading}
                />
                <Label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                >
                  I accept the{' '}
                  <a href="#" className="text-primary hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email || !password || !acceptTerms}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="card-professional">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Demo Access
            </CardTitle>
            <CardDescription className="text-xs">
              Use these credentials to explore different user roles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {demoCredentials.map((cred) => (
              <Button
                key={cred.role}
                variant="outline"
                size="sm"
                className="w-full justify-between text-xs"
                onClick={() => fillDemoCredentials(cred)}
                type="button"
              >
                <span>{cred.email}</span>
                <span className="font-medium text-primary">{cred.role}</span>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>GDPR Compliant • Secure Authentication</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Your data is protected with enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  );
}