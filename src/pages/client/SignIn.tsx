/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Eye, EyeOff, Shield, Lock, Mail, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
// import { Checkbox } from "../../components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { signIn, clearError } from "../../features/auth/authSlice";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

export default function SignInPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isSigningIn, error, tokenExpired, loading, isAuthenticated, user } =
    useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check for error in location state (from protected route - banned user)
  useEffect(() => {
    if (location.state?.error) {
      toast.error(location.state.error, {
        duration: 5000,
      });
      // Clear the error from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Show error toast when auth error occurs
  useEffect(() => {
    if (error) {
      toast.error(error, {
        duration: 4000,
      });
    }
  }, [error]);

  // Clear errors when component mounts
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [dispatch, error]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user && !tokenExpired) {
      // Get the intended destination from location state or default based on role
      const from =
        location.state?.from?.pathname ||
        (user.role === "admin" ? "/admin" : "/");
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location, tokenExpired]);

  // Only redirect if truly authenticated (not expired)
  if (isAuthenticated && !tokenExpired && !loading) {
    // Get the intended destination from location state, or default to home
    const from = (location.state as any)?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  // Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear auth error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.email.trim()) newErrors.email = t('signIn.errors.emailRequired');
    else if (!isValidEmail(formData.email))
      newErrors.email = t('signIn.errors.emailInvalid');

    if (!formData.password) newErrors.password = t('signIn.errors.passwordRequired');
    else if (formData.password.length < 6)
      newErrors.password = t('signIn.errors.passwordLength');

    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Show first error in toast
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      return;
    }

    setErrors({});

    // Dispatch sign in action
    try {
      await dispatch(
        signIn({
          email: formData.email,
          password: formData.password,
        })
      ).unwrap();

      // Show success toast
      toast.success(t('signIn.welcomeBack'), {
        duration: 3000,
      });

      // Navigation will be handled by the useEffect above
    } catch (error: any) {
      // Error will be handled by the auth slice and displayed via toast
      console.error("Sign in failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Home Link */}
        <Link to="/">
          <Button variant="ghost" className="p-0 h-auto font-normal">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('signIn.backToHome')}
          </Button>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('signIn.title')}</CardTitle>
            <CardDescription>
              {t('signIn.description')}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Social Sign In */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={() =>
                  toast.info(t('signIn.googleComingSoon'), {
                    duration: 3000,
                  })
                }
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285f4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34a853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#fbbc05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#ea4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t('signIn.continueWithGoogle')}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={() =>
                  toast.info(t('signIn.facebookComingSoon'), {
                    duration: 3000,
                  })
                }
              >
                <svg
                  className="h-4 w-4 mr-2"
                  viewBox="0 0 24 24"
                  fill="#1877F2"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                {t('signIn.continueWithFacebook')}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {t('signIn.orContinueWithEmail')}
                </span>
              </div>
            </div>

            {/* Sign In Form */}
            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t('signIn.emailLabel')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('signIn.emailPlaceholder')}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`pl-10 ${
                      errors.email ? "border-destructive" : ""
                    }`}
                    disabled={isSigningIn}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t('signIn.passwordLabel')}</Label>
                  <Link to="/forgot-password">
                    <Button variant="link" className="p-0 h-auto text-sm">
                      {t('signIn.forgotPassword')}
                    </Button>
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('signIn.passwordPlaceholder')}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={`pl-10 pr-10 ${
                      errors.password ? "border-destructive" : ""
                    }`}
                    disabled={isSigningIn}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSubmit();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSigningIn}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Remember Me */}
              {/* <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) =>
                    handleInputChange("rememberMe", checked)
                  }
                  disabled={isSigningIn}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-normal text-muted-foreground cursor-pointer"
                >
                  {t('signIn.rememberMe')}
                </Label>
              </div> */}

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isSigningIn}
                className="w-full"
                size="lg"
              >
                {isSigningIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                    {t('signIn.signingIn')}
                  </>
                ) : (
                  t('signIn.signInButton')
                )}
              </Button>
            </div>

            {/* Trust Elements */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                <Shield className="h-4 w-4" />
                <span>{t('signIn.secureInfo')}</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t('signIn.noAccount')}{" "}
                <Link to="/sign-up">
                  <Button variant="link" className="p-0 h-auto font-medium">
                    {t('signIn.signUpHere')}
                  </Button>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}