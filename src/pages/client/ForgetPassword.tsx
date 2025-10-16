import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Mail, ArrowLeft, CheckCircle2, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { forgotPassword, clearError, setResetEmail } from "../../features/auth/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isForgotPassword, error, forgotPasswordSuccess } = useAppSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState((location.state as any)?.email || "");
  const [localError, setLocalError] = useState("");

  // Clear errors when component mounts
  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [dispatch]);

  // Redirect to verification page on success
  useEffect(() => {
    if (forgotPasswordSuccess) {
      // Store email for verification page
      dispatch(setResetEmail(email));
      
      navigate('/verify-reset-code', { 
        replace: true,
        state: { email }
      });
    }
  }, [forgotPasswordSuccess, email, navigate, dispatch]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    
    // Clear local error
    if (localError) {
      setLocalError("");
    }
    
    // Clear auth error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = () => {
    if (!email.trim()) {
      setLocalError(t('forgotPassword.errors.emailRequired'));
      return false;
    }
    
    if (!isValidEmail(email)) {
      setLocalError(t('forgotPassword.errors.emailInvalid'));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLocalError("");

    try {
      await dispatch(forgotPassword({ email })).unwrap();
      
      // Navigation will be handled by the useEffect above
    } catch (err) {
      // Error will be handled by the auth slice and displayed in the UI
      console.error("Forgot password failed:", err);
    }
  };

  const displayError = error || localError;

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Sign In Link */}
        <Button 
          variant="ghost" 
          className="p-0 h-auto font-normal"
          onClick={() => navigate('/sign-in')}
          disabled={isForgotPassword}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('forgotPassword.backToSignIn')}
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">{t('forgotPassword.title')}</CardTitle>
            <CardDescription>
              {t('forgotPassword.description')}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email">{t('forgotPassword.emailLabel')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('forgotPassword.emailPlaceholder')}
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={`pl-10 ${displayError ? 'border-destructive' : ''}`}
                    disabled={isForgotPassword}
                    required
                  />
                </div>
                {displayError && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {displayError}
                  </p>
                )}
              </div>

              {/* Info Message */}
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {t('forgotPassword.infoMessage')}
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button 
                type="submit"
                className="w-full" 
                disabled={isForgotPassword}
                size="lg"
              >
                {isForgotPassword ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    {t('forgotPassword.sendingCode')}
                  </div>
                ) : (
                  t('forgotPassword.sendResetCode')
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {t('forgotPassword.rememberPassword')}{' '}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-medium"
                    onClick={() => navigate('/sign-in')}
                    disabled={isForgotPassword}
                  >
                    {t('forgotPassword.signInHere')}
                  </Button>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}