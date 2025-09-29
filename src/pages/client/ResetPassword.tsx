import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { resetPassword, clearError, clearPasswordResetState } from "../../features/auth/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { Alert, AlertDescription } from "../../components/ui/alert";

export default function ResetPasswordPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isResettingPassword, error, resetPasswordSuccess, resetEmail } = useAppSelector(
    (state) => state.auth
  );

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localErrors, setLocalErrors] = useState<{ [key: string]: string }>({});

  // Get email from state
  const email = resetEmail || (location.state as any)?.email;

  // Clear errors when component mounts
  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [dispatch]);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  // Redirect to sign-in on successful password reset
  useEffect(() => {
    if (resetPasswordSuccess) {
      // Clear password reset state
      dispatch(clearPasswordResetState());
      
      // Show success message and redirect
      setTimeout(() => {
        navigate('/sign-in', { 
          replace: true,
          state: { message: 'Password reset successful! Please sign in with your new password.' }
        });
      }, 2000);
    }
  }, [resetPasswordSuccess, navigate, dispatch]);

  const passwordRequirements = [
    { test: (pw: string) => pw.length >= 6, label: "At least 8 characters" },
    // { test: (pw: string) => /[A-Z]/.test(pw), label: "One uppercase letter" },
    // { test: (pw: string) => /[0-9]/.test(pw), label: "One number" },
    // { test: (pw: string) => /[^A-Za-z0-9]/.test(pw), label: "One special character" },
  ];

  const passwordValid = passwordRequirements.every((req) => req.test(newPassword));
  const passwordsMatch = newPassword && newPassword === confirmPassword;
  const canSubmit = passwordValid && passwordsMatch && !isResettingPassword;

  const getStrength = () => {
    let passed = passwordRequirements.filter((r) => r.test(newPassword)).length;
    if (!newPassword) return "";
    if (passed <= 2) return "Weak";
    if (passed === 3) return "Medium";
    return "Strong";
  };

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    
    // Clear local errors
    if (localErrors.password) {
      setLocalErrors(prev => ({ ...prev, password: '' }));
    }
    
    // Clear auth error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    
    // Clear local errors
    if (localErrors.confirmPassword) {
      setLocalErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
    
    // Clear auth error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!newPassword) {
      errors.password = 'Password is required';}
    // } else if (!passwordValid) {
    //   errors.password = 'Password does not meet all requirements';
    // }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (!passwordsMatch) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    setLocalErrors({});

    if (!email) {
      navigate('/forgot-password', { replace: true });
      return;
    }

    try {
      await dispatch(resetPassword({
        email: email,
        newPassword: newPassword
      })).unwrap();

      // Navigation will be handled by the useEffect above
    } catch (err) {
      // Error will be handled by the auth slice and displayed in the UI
      console.error("Password reset failed:", err);
    }
  };

  if (resetPasswordSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-background">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-semibold text-card-foreground mb-2">
                Password Reset Successful!
              </h2>
              <p className="text-muted-foreground mb-4">
                Your password has been reset successfully. Redirecting to sign in...
              </p>
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">Reset Your Password</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  required
                  aria-describedby="password-requirements"
                  className={localErrors.password ? 'border-destructive' : ''}
                  disabled={isResettingPassword}
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-muted-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isResettingPassword}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {newPassword && (
                <p className="text-sm font-medium">Strength: {getStrength()}</p>
              )}
              <ul id="password-requirements" className="space-y-1 text-sm">
                {passwordRequirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-1">
                    {req.test(newPassword) ? (
                      <CheckCircle2 size={14} className="text-green-600" />
                    ) : (
                      <XCircle size={14} className="text-destructive" />
                    )}
                    {req.label}
                  </li>
                ))}
              </ul>
              {localErrors.password && (
                <p className="text-sm text-destructive">{localErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  required
                  className={localErrors.confirmPassword ? 'border-destructive' : ''}
                  disabled={isResettingPassword}
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-muted-foreground"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  disabled={isResettingPassword}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && passwordsMatch && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle2 size={14} />
                  Passwords match
                </p>
              )}
              {localErrors.confirmPassword && (
                <p className="text-sm text-destructive">{localErrors.confirmPassword}</p>
              )}
            </div>

            {/* Display auth error */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <Button 
              className="w-full" 
              type="submit" 
              disabled={!canSubmit}
            >
              {isResettingPassword ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </Button>
            <button
              type="button"
              onClick={() => navigate('/sign-in')}
              className="text-sm text-center text-primary hover:underline"
              disabled={isResettingPassword}
            >
              Back to Sign In
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}