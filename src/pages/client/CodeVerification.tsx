import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mail, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { verifyResetCode, clearError, setResetEmail } from '../../features/auth/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CodeVerificationPage = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isVerifyingResetCode, error, verifyResetCodeSuccess, resetEmail } = useAppSelector(
    (state) => state.auth
  );

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [expiryTimer, setExpiryTimer] = useState(300); // 5 minutes
  const [localError, setLocalError] = useState('');
  const [contactMethod] = useState({ 
    type: 'email', 
    value: resetEmail || (location.state as any)?.email || t('codeVerification.yourEmail')
  });
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Clear errors when component mounts
  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [dispatch]);

  // Redirect if no email in state
  useEffect(() => {
    if (!resetEmail && !(location.state as any)?.email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [resetEmail, location.state, navigate]);

  // Redirect to reset password on successful verification
  useEffect(() => {
    if (verifyResetCodeSuccess) {
      navigate('/reset-password', { replace: true });
    }
  }, [verifyResetCodeSuccess, navigate]);

  // Timer effects
  useEffect(() => {
    const resendInterval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(resendInterval);
  }, []);

  useEffect(() => {
    const expiryInterval = setInterval(() => {
      setExpiryTimer(prev => {
        if (prev <= 1) {
          setLocalError(t('codeVerification.errors.codeExpired'));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(expiryInterval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setLocalError('');
    
    // Clear auth error when user starts typing
    if (error) {
      dispatch(clearError());
    }

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== '') && value) {
      setTimeout(() => handleVerification(newCode), 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('').slice(0, 6);
      setCode(newCode);
      setLocalError('');
      
      // Clear auth error
      if (error) {
        dispatch(clearError());
      }
      
      // Focus last input
      inputRefs.current[5]?.focus();
      
      // Auto-submit
      setTimeout(() => handleVerification(newCode), 100);
    }
  };

  const handleVerification = async (codeToVerify: string[] = code) => {
    if (codeToVerify.some(digit => digit === '')) {
      setLocalError(t('codeVerification.errors.incompleteCode'));
      return;
    }

    if (expiryTimer === 0) {
      setLocalError(t('codeVerification.errors.codeExpired'));
      return;
    }

    setLocalError('');

    try {
      const enteredCode = codeToVerify.join('');
      
      await dispatch(verifyResetCode({ resetCode: enteredCode })).unwrap();
      
      // Navigation will be handled by the useEffect above
    } catch (err) {
      // Error will be handled by the auth slice and displayed in the UI
      console.error("Verification failed:", err);
      // Clear the code on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setResendTimer(30);
    setExpiryTimer(300);
    setLocalError('');
    setCode(['', '', '', '', '', '']);
    
    // Clear auth error
    if (error) {
      dispatch(clearError());
    }
    
    // Navigate back to forgot password to resend
    navigate('/forgot-password', { 
      state: { email: resetEmail || (location.state as any)?.email } 
    });
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/forgot-password')}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6"
            disabled={isVerifyingResetCode}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('codeVerification.backToForgotPassword')}
          </button>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('codeVerification.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('codeVerification.description')}
          </p>
          
          <div className="flex items-center mt-2 p-3 bg-muted rounded-lg">
            {contactMethod.type === 'email' ? (
              <Mail className="w-4 h-4 text-muted-foreground mr-2" />
            ) : (
              <Smartphone className="w-4 h-4 text-muted-foreground mr-2" />
            )}
            <span className="text-sm font-medium text-muted-foreground">
              {contactMethod.value}
            </span>
          </div>
        </div>

        {/* Verification Form */}
        <div className="bg-card rounded-lg shadow-lg border p-6">
          {/* Code Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-card-foreground mb-4">
              {t('codeVerification.enterCode')}
            </label>
            <div className="flex gap-2 justify-center">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleInputChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-12 h-12 text-center text-xl font-semibold border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                    displayError ? 'border-destructive' : 'border-input hover:border-ring/50'
                  }`}
                  aria-label={t('codeVerification.digitAriaLabel', { number: index + 1 })}
                  disabled={isVerifyingResetCode || verifyResetCodeSuccess}
                />
              ))}
            </div>
          </div>

          {/* Error Message */}
          {displayError && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              <span className="text-sm text-destructive">{displayError}</span>
            </div>
          )}

          {/* Timer Info */}
          <div className="mb-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t('codeVerification.codeExpires')} <span className="font-mono font-medium">{formatTime(expiryTimer)}</span>
            </p>
          </div>

          {/* Verify Button */}
          <button
            onClick={() => handleVerification()}
            disabled={code.some(digit => digit === '') || isVerifyingResetCode || expiryTimer === 0}
            className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
          >
            {isVerifyingResetCode ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                {t('codeVerification.verifying')}
              </div>
            ) : (
              t('codeVerification.verifyButton')
            )}
          </button>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {t('codeVerification.didNotReceive')}
            </p>
            <button
              onClick={handleResendCode}
              disabled={!canResend || isVerifyingResetCode}
              className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed transition-colors"
            >
              {canResend ? t('codeVerification.resendCode') : t('codeVerification.resendIn', { seconds: resendTimer })}
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            {t('codeVerification.havingTrouble')}{' '}
            <button 
              onClick={() => console.log('Open support')}
              className="text-primary hover:underline"
            >
              {t('codeVerification.supportTeam')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CodeVerificationPage;