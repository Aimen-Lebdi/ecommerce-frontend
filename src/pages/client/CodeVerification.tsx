import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mail, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';

const CodeVerificationPage = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [expiryTimer, setExpiryTimer] = useState(300); // 5 minutes
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [contactMethod] = useState({ type: 'email', value: 'john.doe@example.com' });
  
  const inputRefs = useRef([]);

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
          setError('Verification code has expired. Please request a new one.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(expiryInterval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index, value) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== '') && value) {
      setTimeout(() => handleVerification(newCode), 100);
    }
  };

  const handleKeyDown = (index, e) => {
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

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('').slice(0, 6);
      setCode(newCode);
      setError('');
      
      // Focus last input
      inputRefs.current[5]?.focus();
      
      // Auto-submit
      setTimeout(() => handleVerification(newCode), 100);
    }
  };

  const handleVerification = async (codeToVerify = code) => {
    if (codeToVerify.some(digit => digit === '')) {
      setError('Please enter the complete verification code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const enteredCode = codeToVerify.join('');
      
      // Simulate verification logic
      if (enteredCode === '123456') {
        setSuccess(true);
        // Redirect after success animation
        setTimeout(() => {
          console.log('Redirecting to dashboard...');
        }, 2000);
      } else {
        setError('Invalid verification code. Please try again.');
        // Clear the code
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setResendTimer(30);
    setExpiryTimer(300);
    setError('');
    setCode(['', '', '', '', '', '']);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Code resent successfully');
    } catch (err) {
      setError('Failed to resend code. Please try again.');
      setCanResend(true);
      setResendTimer(0);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg shadow-lg border p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-semibold text-card-foreground mb-2">
              Verification Successful!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your account has been verified successfully. You will be redirected to your dashboard shortly.
            </p>
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => console.log('Back to sign in')}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </button>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Verify Your Account
          </h1>
          <p className="text-muted-foreground">
            We sent a verification code to your {contactMethod.type}
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
            <button 
              onClick={() => console.log('Change contact method')}
              className="ml-auto text-sm text-primary hover:underline"
            >
              Change
            </button>
          </div>
        </div>

        {/* Verification Form */}
        <div className="bg-card rounded-lg shadow-lg border p-6">
          {/* Code Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-card-foreground mb-4">
              Enter verification code
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
                    error ? 'border-destructive' : 'border-input hover:border-ring/50'
                  }`}
                  aria-label={`Digit ${index + 1} of verification code`}
                  disabled={isVerifying || success}
                />
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          {/* Timer Info */}
          <div className="mb-6 text-center">
            <p className="text-sm text-muted-foreground">
              Code expires in: <span className="font-mono font-medium">{formatTime(expiryTimer)}</span>
            </p>
          </div>

          {/* Verify Button */}
          <button
            onClick={() => handleVerification()}
            disabled={code.some(digit => digit === '') || isVerifying || expiryTimer === 0}
            className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
          >
            {isVerifying ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Verifying...
              </div>
            ) : (
              'Verify Account'
            )}
          </button>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendCode}
              disabled={!canResend || isVerifying}
              className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed transition-colors"
            >
              {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Having trouble? Contact our{' '}
            <button 
              onClick={() => console.log('Open support')}
              className="text-primary hover:underline"
            >
              support team
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CodeVerificationPage;