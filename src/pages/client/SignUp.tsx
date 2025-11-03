/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, X, Shield, Lock, Mail, User, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Progress } from '../../components/ui/progress';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { signUp, clearError } from '../../features/auth/authSlice';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export default function SignUpPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isSigningUp, error, isAuthenticated, user, loading, tokenExpired } = useAppSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeToTerms: false,
    marketingEmails: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Clear errors when component mounts or when user starts typing
  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [dispatch]);

  // Redirect if already authenticated
  // FIXED: Redirect if already authenticated - check localStorage for tokens
  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");
    
    if (isAuthenticated && user && !tokenExpired && !loading && !isSigningUp && storedAccessToken && storedUser) {
      const from = location.state?.from?.pathname || (user.role === "admin" ? "/admin" : "/");
      
      console.log('SignUp: Redirecting authenticated user to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location, tokenExpired, loading, isSigningUp]);

  // FIXED: Early return check
  const storedAccessToken = localStorage.getItem("accessToken");
  const storedUser = localStorage.getItem("user");
  if (isAuthenticated && user && !tokenExpired && !loading && !isSigningUp && storedAccessToken && storedUser) {
    const from = (location.state as any)?.from?.pathname || 
                (user?.role === "admin" ? "/admin" : "/");
    return <Navigate to={from} replace />;
  }

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  // Email validation
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Phone validation (basic)
  const isValidPhone = (phone) => {
    return phone === '' || /^[\+]?[\d\s\-\(\)]{10,}$/.test(phone);
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear auth error when user starts typing
    if (error) {
      dispatch(clearError());
    }

    // Update password strength in real-time
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields - use firstName as name for backend
    if (!formData.firstName.trim()) newErrors.firstName = t('signUp.errors.nameRequired');
    if (!formData.email.trim()) newErrors.email = t('signUp.errors.emailRequired');
    else if (!isValidEmail(formData.email)) newErrors.email = t('signUp.errors.emailInvalid');
    
    if (!formData.password) newErrors.password = t('signUp.errors.passwordRequired');
    else if (formData.password.length < 6) newErrors.password = t('signUp.errors.passwordLength');
    
    if (!formData.confirmPassword) newErrors.confirmPassword = t('signUp.errors.confirmPasswordRequired');
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t('signUp.errors.passwordsDontMatch');

    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // Dispatch sign up action
    try {
      await dispatch(signUp({
        name: formData.firstName, // Backend expects 'name' field
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.confirmPassword,
      })).unwrap();

      // Navigation will be handled by the useEffect above
    } catch (error) {
      // Error will be handled by the auth slice and displayed in the UI
      console.error("Sign up failed:", error);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-destructive';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return t('signUp.passwordStrength.veryWeak');
    if (passwordStrength <= 2) return t('signUp.passwordStrength.weak');
    if (passwordStrength <= 3) return t('signUp.passwordStrength.fair');
    if (passwordStrength <= 4) return t('signUp.passwordStrength.good');
    return t('signUp.passwordStrength.strong');
  };

  const getPasswordStrengthValue = () => {
    return (passwordStrength / 5) * 100;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Login Link */}
        <Button 
          variant="ghost" 
          className="p-0 h-auto font-normal"
          onClick={() => navigate('/sign-in')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('signUp.backToLogin')}
        </Button>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('signUp.title')}</CardTitle>
            <CardDescription>
              {t('signUp.description')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Social Sign Up */}
            <div className="space-y-3">
              <Button variant="outline" className="w-full" type="button"onClick={() =>
                  toast.info(t('signUp.googleComingSoon'), {
                    duration: 3000,
                  })
                }>
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t('signUp.continueWithGoogle')}
              </Button>
              
              <Button variant="outline" className="w-full" type="button" onClick={() =>
                                toast.info(t('signUp.facebookComingSoon'), {
                                  duration: 3000,
                                })
                              }>
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                {t('signUp.continueWithFacebook')}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {t('signUp.orContinueWithEmail')}
                </span>
              </div>
            </div>

            {/* Sign Up Form */}
            <div className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('signUp.nameLabel')}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      placeholder={t('signUp.namePlaceholder')}
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`pl-10 ${errors.firstName ? 'border-destructive' : ''}`}
                      disabled={isSigningUp}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {errors.firstName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t('signUp.emailLabel')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('signUp.emailPlaceholder')}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                    disabled={isSigningUp}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">{t('signUp.passwordLabel')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('signUp.passwordPlaceholder')}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                    disabled={isSigningUp}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSigningUp}
                  >
                    {showPassword ? 
                      <EyeOff className="h-4 w-4" /> : 
                      <Eye className="h-4 w-4" />
                    }
                  </Button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={getPasswordStrengthValue()} 
                        className={`flex-1 h-2 ${getPasswordStrengthColor()} `}
                      />
                      <span className="text-xs text-muted-foreground min-w-[60px]">
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {formData.password.length >= 6 ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {t('signUp.passwordRequirements.characters')}
                      </div>
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('signUp.confirmPasswordLabel')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t('signUp.confirmPasswordPlaceholder')}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                    disabled={isSigningUp}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isSigningUp}
                  >
                    {showConfirmPassword ? 
                      <EyeOff className="h-4 w-4" /> : 
                      <Eye className="h-4 w-4" />
                    }
                  </Button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    {t('signUp.passwordsMatch')}
                  </p>
                )}
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isSigningUp}
                className="w-full"
                size="lg"
              >
                {isSigningUp ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                    {t('signUp.creatingAccount')}
                  </>
                ) : (
                  t('signUp.createAccount')
                )}
              </Button>

              {/* Display auth error */}
              {error && (
                <Alert variant="destructive">
                  <X className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Trust Elements */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                <Shield className="h-4 w-4" />
                <span>{t('signUp.secureInfo')}</span>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                {t('signUp.privacyNotice')}
              </p>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t('signUp.alreadyHaveAccount')}{' '}
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-medium"
                  onClick={() => navigate('/sign-in')}
                >
                  {t('signUp.signInHere')}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}