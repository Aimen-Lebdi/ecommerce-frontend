import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordRequirements = [
    { test: (pw) => pw.length >= 8, label: "At least 8 characters" },
    { test: (pw) => /[A-Z]/.test(pw), label: "One uppercase letter" },
    { test: (pw) => /[0-9]/.test(pw), label: "One number" },
    { test: (pw) => /[^A-Za-z0-9]/.test(pw), label: "One special character" },
  ];

  const passwordValid = passwordRequirements.every((req) => req.test(newPassword));
  const passwordsMatch = newPassword && newPassword === confirmPassword;
  const canSubmit = passwordValid && passwordsMatch;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canSubmit) {
      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const getStrength = () => {
    let passed = passwordRequirements.filter((r) => r.test(newPassword)).length;
    if (!newPassword) return "";
    if (passed <= 2) return "Weak";
    if (passed === 3) return "Medium";
    return "Strong";
  };

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
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  aria-describedby="password-requirements"
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-muted-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
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
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-muted-foreground"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-sm text-destructive">Passwords do not match.</p>
              )}
            </div>

            {success && (
              <div className="p-2 text-sm text-green-700 bg-green-100 rounded-md">
                ✅ Your password has been reset successfully.
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" type="submit" disabled={!canSubmit}>
              Reset Password
            </Button>
            <a
              href="/signin"
              className="text-sm text-center text-primary hover:underline"
            >
              Back to Sign In
            </a>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
