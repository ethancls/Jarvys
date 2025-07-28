'use client';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Eye, EyeOff, XCircle } from 'lucide-react';
import Image from 'next/image';
import clsx from 'clsx';

const steps = [
  {
    label: 'Numéro étudiant',
    name: 'studentNumber',
    placeholder: '12345678',
    type: 'text',
    validate: (value: string) => /^\d{8}$/.test(value),
    error: "Le numéro étudiant possède 8 chiffres.",
  },
  {
    label: 'Prénom',
    name: 'firstname',
    type: 'text',
  },
  {
    label: 'Nom',
    name: 'lastname',
    type: 'text',
  },
  {
    label: 'Mot de passe',
    name: 'password',
    type: 'password',
  },
  {
    label: 'Confirmer le mot de passe',
    name: 'confirmPassword',
    type: 'password',
  },
];

// Fonctions de validation du mot de passe
function hasMinLength(pwd: string) {
  return pwd.length >= 8;
}
function hasUppercase(pwd: string) {
  return /[A-Z]/.test(pwd);
}
function hasNumber(pwd: string) {
  return /\d/.test(pwd);
}
function hasSymbol(pwd: string) {
  return /[^A-Za-z0-9]/.test(pwd);
}

export default function RegisterPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const [form, setForm] = useState({
    studentNumber: '',
    password: '',
    firstname: '',
    lastname: '',
    confirmPassword: ''
  });
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [steps[step].name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Step validation
    if (steps[step].name === 'confirmPassword' && form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (steps[step].name === 'password') {
      if (
        !hasMinLength(form.password) ||
        !hasUppercase(form.password) ||
        !hasNumber(form.password) ||
        !hasSymbol(form.password)
      ) {
        setError('Le mot de passe ne respecte pas les critères.');
        return;
      }
    }
    // Custom validate function if present
    if (typeof steps[step].validate === 'function') {
      const isValid = steps[step].validate(form[steps[step].name as keyof typeof form] as string);
      if (!isValid) {
        setError(steps[step].error || 'Ce champ est invalide.');
        return;
      }
    }
    if (!form[steps[step].name as keyof typeof form]) {
      setError('Ce champ est requis.');
      return;
    }

    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }

    // Final submit
    setLoading(true);
    setSuccess(null);
    try {
      const { confirmPassword, ...toSend } = form;
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSend),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Erreur lors de l\'inscription');
        return;
      }
      setSuccess('Inscription réussie !');
      setForm({ studentNumber: '', password: '', firstname: '', lastname: '', confirmPassword: '' });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setError(null);
    if (step > 0) setStep(step - 1);
  }

  // Pour la validation du mot de passe
  const pwd = form.password;
  const pwdValidations = [
    { valid: hasMinLength(pwd), label: 'Au moins 8 caractères' },
    { valid: hasUppercase(pwd), label: 'Une majuscule' },
    { valid: hasNumber(pwd), label: 'Un chiffre' },
    { valid: hasSymbol(pwd), label: 'Un symbole' },
  ];

  // Pour la confirmation du mot de passe
  const confirmPwd = form.confirmPassword;
  const confirmValid = confirmPwd.length > 0 && pwd === confirmPwd;

  // Désactiver le bouton si champ vide ou mdp non valide
  const isFieldEmpty = !form[steps[step].name as keyof typeof form];
  const isPwdStep = steps[step].name === 'password';
  const isPwdValid = pwdValidations.every(v => v.valid);
  const isConfirmStep = steps[step].name === 'confirmPassword';

  return (
    <div className="flex h-full items-center justify-center px-4">
      <div className="relative w-full max-w-sm">
        <div className="absolute -top-20 left-1/2 flex -translate-x-1/2 items-center justify-center">
          <div className="flex h-20 items-center justify-center gap-3 rounded-2xl px-6">
            {mounted && (
              theme === 'dark' ? (
                <Image
                  src="/icon-dark.svg"
                  alt="Logo Jarvys"
                  width={60}
                  height={60}
                  priority
                  className="h-16 w-auto"
                />
              ) : (
                <Image
                  src="/icon-light.svg"
                  alt="Logo Jarvys"
                  width={60}
                  height={60}
                  priority
                  className="h-16 w-auto"
                />
              )
            )}
            <span className="font-space text-3xl font-bold tracking-tight text-neutral-800 dark:text-white">
              Jarvys
            </span>
          </div>
        </div>

        {/* Carte principale */}
        <div className="mt-10 w-full space-y-5 rounded-lg border border-neutral-200 bg-white p-6 shadow-md dark:border-neutral-800 dark:bg-black">
          <div className="text-center">
            <h1 className="font-space text-xl font-medium">Inscription</h1>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Créez votre compte Jarvys</p>
          </div>

            {success ? (
            <div className="space-y-5">
              <div className="rounded-lg bg-green-50 p-5 text-center shadow-sm border border-green-100 dark:bg-green-900/10 dark:border-green-900/20">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-sm font-medium text-green-600 dark:text-green-500">Inscription réussie</h3>
                <p className="mt-2 flex items-center justify-center text-xs text-green-600/80 dark:text-green-400/80">
                <Link
                  href="/"
                  className="text-cyan-500 hover:text-cyan-600 transition-colors dark:hover:text-cyan-400 font-medium flex items-center"
                >
                  Se connecter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                </p>
              </div>
            </div>
            ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor={steps[step].name}
                  className="mb-1.5 block text-xs font-medium text-neutral-600 dark:text-neutral-300"
                >
                  {steps[step].label}
                </label>
                <div className="relative">
                  <Input
                    id={steps[step].name}
                    type={
                      isPwdStep
                        ? showPassword ? 'text' : 'password'
                        : isConfirmStep
                        ? showConfirm ? 'text' : 'password'
                        : steps[step].type
                    }
                    value={form[steps[step].name as keyof typeof form]}
                    onChange={handleChange}
                    className="h-10 border-neutral-200 bg-white text-sm text-black shadow-sm transition-colors focus:border-cyan-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white pr-10"
                    placeholder={steps[step].placeholder}
                    autoFocus
                  />
                  {/* Eye icon for password fields */}
                  {(isPwdStep || isConfirmStep) && (
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                      onClick={() =>
                        isPwdStep
                          ? setShowPassword((v) => !v)
                          : setShowConfirm((v) => !v)
                      }
                    >
                      {(isPwdStep ? showPassword : showConfirm) ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                  {/* Confirm password check/cross */}
                  {isConfirmStep && confirmPwd.length > 0 && (
                    <span className="absolute right-8 top-1/2 -translate-y-1/2">
                      {confirmValid ? (
                        <CheckCircle className="text-green-500" size={18} />
                      ) : (
                        <XCircle className="text-red-500" size={18} />
                      )}
                    </span>
                  )}
                </div>
                {/* Password validation dots */}
                {isPwdStep && (
                    <div className="flex flex-col gap-1 mt-3">
                    {pwdValidations.map((v, i) => (
                      <div key={i} className="flex items-center gap-2">
                      <span
                        className={clsx(
                        'flex items-center justify-center h-4 w-4 rounded-full border text-white text-xs transition-all',
                        v.valid
                          ? 'bg-green-500 border-green-500'
                          : 'bg-neutral-200 border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700'
                        )}
                      >
                        {v.valid ? <CheckCircle size={14} className="text-white" /> : <XCircle size={14} className="text-neutral-400 dark:text-neutral-500" />}
                      </span>
                      <span
                        className={clsx(
                        'text-xs',
                        v.valid
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-neutral-400 dark:text-neutral-500'
                        )}
                      >
                        {v.label}
                      </span>
                      </div>
                    ))}
                    </div>
                )}
              </div>

              {error && (
                <div className="rounded-md bg-red-50 px-3 py-2.5 text-xs text-red-600 shadow-sm border border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/20">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                {step > 0 && (
                  <Button
                    type="button"
                    onClick={handleBack}
                    className="w-1/3 h-10 transition-all bg-neutral-200 text-black dark:bg-neutral-800 dark:text-white cursor-pointer hover:opacity-80"
                    disabled={loading}
                  >
                    Retour
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    isFieldEmpty ||
                    (isPwdStep && !isPwdValid) ||
                    (isConfirmStep && !confirmValid)
                  }
                  className={clsx(
                    "w-full h-10 transition-all bg-cyan-500 text-black cursor-pointer",
                    (loading ||
                      isFieldEmpty ||
                      (isPwdStep && !isPwdValid) ||
                      (isConfirmStep && !confirmValid)) &&
                      "opacity-60 cursor-not-allowed",
                    "hover:opacity-80"
                  )}
                >
                  {loading
                    ? 'Inscription...'
                    : step === steps.length - 1
                    ? "S'inscrire"
                    : 'Suivant'}
                </Button>
              </div>

              <div className="pt-2 text-center text-xs text-neutral-500 dark:text-neutral-400">
                Déjà inscrit ?{' '}
                <Link href="/" className="text-cyan-500 hover:text-cyan-600 transition-colors dark:hover:text-cyan-400">
                  Se connecter
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
