"use client";
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import toast from 'react-hot-toast';
import { User } from 'lucide-react';

export default function Profil() {
  const {data: session, status } = useSession();
  const sessionLoading = status === 'loading';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profil, setProfil] = useState<any>(null);
  const [form, setForm] = useState({ firstname: '', lastname: '', password: '' });

  useEffect(() => {
    if (session?.user?.id) fetchProfil();
  }, [session?.user?.id]);

  async function fetchProfil() {
    if (!session || !session.user || !session.user.id) {
      toast.error('Session utilisateur non disponible');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/profil/${session.user.id}`);
      if (!res.ok) throw new Error('Erreur chargement profil');
      const data = await res.json();
      setProfil(data.user);
      setForm({ firstname: data.user.firstname, lastname: data.user.lastname, password: '' });
    } catch (e) {
      toast.error('Impossible de charger le profil');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: any) {
     if (!session || !session.user || !session.user.id) {
      toast.error('Session utilisateur non disponible');
      setLoading(false);
      return;
    }
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/profil/${session.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Erreur sauvegarde');
      toast.success('Profil mis à jour !');
      fetchProfil();
    } catch (e) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  // Validation du mot de passe comme sur register
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
  const pwd = form.password;
  const pwdValidations = [
    { valid: hasMinLength(pwd), label: 'Au moins 8 caractères' },
    { valid: hasUppercase(pwd), label: 'Une majuscule' },
    { valid: hasNumber(pwd), label: 'Un chiffre' },
    { valid: hasSymbol(pwd), label: 'Un symbole' },
  ];
  const isPwdValid = pwd.length === 0 || pwdValidations.every(v => v.valid);

  if (sessionLoading || loading) return <Spinner />;
  if (!profil) return <div className="p-8 text-red-500">Profil non trouvé</div>;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 min-h-screen">
      <div className="w-full">
        <div className="flex items-center gap-3 mb-8">
          <User className="h-8 w-8 text-violet-500 dark:text-violet-300" />
          <h2 className="font-bold text-3xl text-violet-600 dark:text-violet-300 tracking-tight">Mon profil</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-stretch">
          {/* Formulaire de modification + infos */}
          <form className="max-w-lg w-full bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-lg p-10 flex flex-col gap-8 justify-between h-full" onSubmit={handleSave}>
            <div className="flex flex-col gap-4">
              {/* Bloc infos numéro/id */}
              <div className="rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/40 p-4 mb-2 flex flex-col gap-1">
                <div><span className="font-semibold text-neutral-700 dark:text-neutral-200">Numéro étudiant :</span> <span className="font-semibold text-violet-500 dark:text-violet-300">{profil.number}</span></div>
                <div><span className="font-semibold text-neutral-700 dark:text-neutral-200">ID :</span> <span className="font-mono text-violet-500 dark:text-violet-300">{profil.id}</span></div>
              </div>
              <div>
                <label className="block text-base font-bold text-violet-500 dark:text-violet-300 mb-2">Prénom</label>
                <Input value={form.firstname} onChange={e => setForm(f => ({ ...f, firstname: e.target.value }))} required className="border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950" />
              </div>
              <div>
                <label className="block text-base font-bold text-violet-500 dark:text-violet-300 mb-2">Nom</label>
                <Input value={form.lastname} onChange={e => setForm(f => ({ ...f, lastname: e.target.value }))} required className="border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950" />
              </div>
              <div>
                <label className="block text-base font-bold text-violet-500 dark:text-violet-300 mb-2">Nouveau mot de passe</label>
                <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Laisser vide pour ne pas changer" className="border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950" />
                {/* Validation visuelle du mot de passe */}
                {pwd.length > 0 && (
                  <div className="flex flex-col gap-1 mt-3">
                    {pwdValidations.map((v, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span
                          className={`flex items-center justify-center h-4 w-4 rounded-full border text-white text-xs transition-all ${v.valid ? 'bg-green-500 border-green-500' : 'bg-neutral-200 border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700'}`}
                        >
                          {v.valid ? <span className="font-bold">✓</span> : <span className="font-bold">✗</span>}
                        </span>
                        <span className={v.valid ? 'text-green-600 dark:text-green-400 text-xs' : 'text-neutral-400 dark:text-neutral-500 text-xs'}>{v.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Button
              type="submit"
              disabled={saving || !form.firstname || !form.lastname || (pwd.length > 0 && !isPwdValid)}
              variant="default"
              className={`w-full rounded-lg px-5 py-3 text-lg font-semibold shadow border hover:cursor-pointer border-violet-200 dark:border-violet-700 bg-violet-500 dark:bg-violet-800 hover:bg-violet-700 dark:hover:bg-violet-900 text-white transition-all duration-150 flex items-center justify-center gap-2 ${saving || !form.firstname || !form.lastname || (pwd.length > 0 && !isPwdValid) ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {saving ? <Spinner size="xs" /> : 'Mettre à jour'}
            </Button>
          </form>
          {/* Tableau des stats par exercice */}
          <div className="w-full flex flex-col justify-between h-full md:col-span-2">
            {profil.stats && profil.stats.exerciseStats && profil.stats.exerciseStats.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow min-w-[520px] h-full">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-100 dark:bg-neutral-900/40">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Exercice</th>
                      <th className="px-4 py-3 text-center font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Tentatives</th>
                      <th className="px-4 py-3 text-center font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Réussites</th>
                      <th className="px-4 py-3 text-right font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Taux de réussite</th>
                    </tr>
                  </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900/40">
                    {profil.stats.exerciseStats.map((stat: any, idx: number) => (
                      <tr key={stat.exerciseId} className="bg-white dark:bg-neutral-950 hover:bg-violet-50 dark:hover:bg-violet-900/30 cursor-pointer hover:opacity-90 transition-opacity">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-base ">{stat.exerciseTitle}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-base ">{stat.attempts}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-base ">{stat.successes}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-base ">
                        <div className="flex items-center justify-end">
                        <div className="mr-2 h-3 w-24 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 ">
                          <div
                          className="h-3 rounded-full"
                          style={{
                            width: `${stat.rate}%`,
                            backgroundColor: `hsl(262, 85%, ${90 - stat.rate * 0.5}%)`,
                            transition: 'background-color 0.3s',
                          }}
                          ></div>
                        </div>
                        <span className="font-bold text-violet-500 dark:text-violet-300">{stat.rate.toFixed(0)}%</span>
                        </div>
                      </td>
                      </tr>
                    ))}
                    </tbody>
                </table>
              </div>
            ) : (
              <div className="text-neutral-500">Aucune statistique par exercice disponible.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
