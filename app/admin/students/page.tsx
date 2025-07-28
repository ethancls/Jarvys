"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, UserPlus, Save, X, RefreshCw, ShieldCheck, CheckCircle, AlertTriangle, Key, Trash2 } from "lucide-react";
import { useRef } from "react";
import clsx from "clsx";
import { Spinner } from "@/components/ui/spinner";

type Student = {
  id: string;
  number: string;
  firstname: string;
  lastname: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
};

type AllowedStudentNumber = {
  id: string;
  number: string;
  label?: string;
  createdAt: string;
};

function ConfirmModal({ open, onClose, onConfirm, title, description }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; description: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="text-red-500" />
          <h3 className="font-bold text-lg">{title}</h3>
        </div>
        <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-300">{description}</p>
        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 cursor-pointer" onClick={onClose}>Annuler</Button>
          <Button type="button" size="sm" className="bg-red-600 hover:bg-red-700 text-white cursor-pointer" onClick={onConfirm}>Confirmer</Button>
        </div>
      </div>
    </div>
  );
}

function PasswordModal({ open, onClose, onSubmit, loading, error }: { open: boolean; onClose: () => void; onSubmit: (password: string) => void; loading?: boolean; error?: string | null }) {
  const [password, setPassword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) setPassword(""); }, [open]);
  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <Key className="text-violet-500 dark:text-violet-300" />
          <h3 className="font-bold text-lg">Modifier le mot de passe</h3>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(password); }}>
          <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-200">Nouveau mot de passe</label>
          <Input ref={inputRef} type="password" value={password} onChange={e => setPassword(e.target.value)} className="mb-4 h-8 w-full" placeholder="Nouveau mot de passe" required />
          {error && <div className="mb-2 text-sm text-red-600 dark:text-red-400">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button type="button" size="sm" className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 cursor-pointer" onClick={onClose}>Annuler</Button>
            <Button type="submit" size="sm" className="bg-violet-500 hover:bg-violet-700 text-white cursor-pointer" disabled={loading}>Valider</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminStudents() {
  const [tab, setTab] = useState<"students" | "allowed">("students");
  const [search, setSearch] = useState("");
  // Students
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newStudent, setNewStudent] = useState({ number: "", firstname: "", lastname: "", password: "", isAdmin: false });
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Student>>({});
  const [editingPasswordId, setEditingPasswordId] = useState<string | null>(null);
  const [passwordModalLoading, setPasswordModalLoading] = useState(false);
  const [passwordModalError, setPasswordModalError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // Allowed numbers
  const [allowed, setAllowed] = useState<AllowedStudentNumber[]>([]);
  const [allowedLoading, setAllowedLoading] = useState(true);
  const [allowedError, setAllowedError] = useState<string | null>(null);
  const [allowedSuccess, setAllowedSuccess] = useState<string | null>(null);
  const [newAllowed, setNewAllowed] = useState({ number: "", label: "" });
  const [deleteAllowedId, setDeleteAllowedId] = useState<string | null>(null);

  useEffect(() => { fetchStudents(); fetchAllowed(); }, []);

  async function fetchStudents() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/students");
      if (!res.ok) throw new Error("Erreur lors du chargement des étudiants");
      setStudents(await res.json());
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }
  async function fetchAllowed() {
    setAllowedLoading(true); setAllowedError(null);
    try {
      const res = await fetch("/api/admin/allowed-students");
      if (!res.ok) throw new Error("Erreur lors du chargement de la whitelist");
      setAllowed(await res.json());
    } catch (e: any) { setAllowedError(e.message); } finally { setAllowedLoading(false); }
  }

  // --- Students CRUD ---
  async function handleDelete(id: string) {
    setDeleteId(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/students", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      setSuccess("Utilisateur supprimé avec succès");
      fetchStudents();
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) { setError(e.message); }
  }
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    if (!newStudent.number || !newStudent.password) { setError("Le numéro étudiant et le mot de passe sont obligatoires"); return; }
    try {
      const res = await fetch("/api/admin/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newStudent) });
      if (!res.ok) { const errorData = await res.json(); throw new Error(errorData.error || "Erreur lors de l'ajout de l'utilisateur"); }
      setSuccess("Utilisateur ajouté avec succès");
      setNewStudent({ number: "", firstname: "", lastname: "", password: "", isAdmin: false });
      fetchStudents(); setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) { setError(e.message); }
  }
  function startEdit(student: Student) { setEditingStudent(student.id); setEditForm({ number: student.number, firstname: student.firstname, lastname: student.lastname, isAdmin: student.isAdmin }); }
  function cancelEdit() { setEditingStudent(null); setEditForm({}); }
  async function handleUpdate() {
    if (!editingStudent) return;
    try {
      const res = await fetch(`/api/admin/students`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingStudent, ...editForm }) });
      if (!res.ok) { const errorData = await res.json(); throw new Error(errorData.error || "Erreur lors de la mise à jour"); }
      setSuccess("Utilisateur mis à jour avec succès"); setEditingStudent(null); setEditForm({}); fetchStudents(); setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) { setError(e.message); }
  }

  // --- AllowedStudent CRUD ---
  async function handleDeleteAllowed(id: string) {
    setDeleteAllowedId(null);
    setAllowedError(null);
    try {
      const res = await fetch("/api/admin/allowed-students", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      setAllowedSuccess("Numéro supprimé avec succès");
      fetchAllowed(); setTimeout(() => setAllowedSuccess(null), 3000);
    } catch (e: any) { setAllowedError(e.message); }
  }
  async function handleAddAllowed(e: React.FormEvent) {
    e.preventDefault(); setAllowedError(null);
    if (!newAllowed.number) { setAllowedError("Le numéro est obligatoire"); return; }
    try {
      const res = await fetch("/api/admin/allowed-students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newAllowed) });
      if (!res.ok) { const errorData = await res.json(); throw new Error(errorData.error || "Erreur lors de l'ajout"); }
      setAllowedSuccess("Numéro ajouté avec succès");
      setNewAllowed({ number: "", label: "" });
      fetchAllowed(); setTimeout(() => setAllowedSuccess(null), 3000);
    } catch (e: any) { setAllowedError(e.message); }
  }

  // --- UI ---
  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 min-h-screen overflow-x-hidden">
      <div className="mb-6 flex flex-wrap gap-2 border-b border-neutral-200 dark:border-neutral-800">
        <button className={clsx("px-4 py-2 font-medium transition-colors", tab === "students" ? "border-b-2 border-violet-500 text-violet-500 dark:text-violet-300 hover:cursor-pointer" : "text-neutral-500 dark:text-neutral-400 hover:text-violet-500 dark:hover:text-violet-300 hover:cursor-pointer")}
          onClick={() => setTab("students")}>Utilisateurs</button>
        <button className={clsx("px-4 py-2 font-medium transition-colors", tab === "allowed" ? "border-b-2 border-violet-500 text-violet-500 dark:text-violet-300 hover:cursor-pointer" : "text-neutral-500 dark:text-neutral-400 hover:text-violet-500 dark:hover:text-violet-300 hover:cursor-pointer")}
          onClick={() => setTab("allowed")}>Numéros autorisés</button>
      </div>

      {/* Success/Error */}
      {success && (<div className="mb-6 rounded-lg border border-none bg-green-50 dark:bg-green-900/20 p-4 text-green-700 dark:text-green-300 flex items-center gap-2"><CheckCircle className="h-5 w-5" /> <span>{success}</span></div>)}
      {error && (<div className="mb-6 rounded-lg border border-none bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> <span>{error}</span></div>)}

      <div className="w-full">
        {/* Onglet Utilisateurs */}
        {tab === "students" && (
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 md:p-6 shadow-lg bg-white dark:bg-neutral-950">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex-1 flex items-center gap-2">
                <h2 className="text-xl font-bold text-violet-500 dark:text-violet-300 mr-4">Liste des utilisateurs</h2>
                <Input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="h-9 w-48 border-violet-300 focus:border-violet-500 focus:ring-violet-500 text-sm"
                />
              </div>
              <Button
                onClick={() => setShowAddUser((v) => !v)}
                className="w-full sm:w-auto bg-violet-500 hover:bg-violet-700 hover:cursor-pointer text-white font-semibold"
              >
                {showAddUser ? "Annuler" : "Ajouter un utilisateur"}
              </Button>
            </div>
            {showAddUser && (
              <div className="mb-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4">
                <form onSubmit={handleAdd} className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="number" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Numéro étudiant <span className="text-red-500">*</span></label>
                    <Input id="number" type="text" value={newStudent.number} onChange={e => setNewStudent({ ...newStudent, number: e.target.value })} className="mt-1" required />
                  </div>
                  <div>
                    <label htmlFor="firstname" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Prénom</label>
                    <Input id="firstname" type="text" value={newStudent.firstname} onChange={e => setNewStudent({ ...newStudent, firstname: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <label htmlFor="lastname" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Nom</label>
                    <Input id="lastname" type="text" value={newStudent.lastname} onChange={e => setNewStudent({ ...newStudent, lastname: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Mot de passe <span className="text-red-500">*</span></label>
                    <Input id="password" type="password" value={newStudent.password} onChange={e => setNewStudent({ ...newStudent, password: e.target.value })} className="mt-1" required />
                  </div>
                  <div className="flex items-center col-span-2">
                    <input id="isAdmin" type="checkbox" checked={newStudent.isAdmin} onChange={e => setNewStudent({ ...newStudent, isAdmin: e.target.checked })} className="h-4 w-4 rounded border-violet-300 text-violet-500 focus:ring-violet-500" />
                    <label htmlFor="isAdmin" className="ml-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">Administrateur</label>
                  </div>
                  <div className="col-span-2">
                    <Button type="submit" className="w-full bg-violet-500 hover:bg-violet-700 hover:cursor-pointer text-white">Ajouter</Button>
                  </div>
                </form>
              </div>
            )}
            {loading ? (
              <div className="flex justify-center items-center h-32"><Spinner/></div>
            ) : students.length === 0 ? (
              <div className="rounded-lg border border-violet-200 dark:border-violet-800 p-8 bg-white/50 dark:bg-neutral-900/50 text-center">
                <h3 className="mt-2 text-xl font-bold text-violet-500 dark:text-violet-300">Aucun utilisateur</h3>
                <p className="mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">Ajoutez des utilisateurs en utilisant le bouton ci-dessus.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-100 dark:bg-neutral-900/40">
                    <tr>
                        <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Numéro</th>
                        <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Prénom</th>
                        <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Nom</th>
                        <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Mot de passe</th>
                        <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Créé le</th>
                        <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Modifié le</th>
                        <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Rôle</th>
                        <th className="px-4 py-3 text-right font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900/40">
                    {students.filter(s => {
                      if (!search.trim()) return true;
                      const q = search.trim().toLowerCase();
                      return (
                        s.number.toLowerCase().includes(q) ||
                        (s.firstname && s.firstname.toLowerCase().includes(q)) ||
                        (s.lastname && s.lastname.toLowerCase().includes(q))
                      );
                    }).map((student) => (
                      <tr key={student.id} className="bg-white dark:bg-neutral-950 hover:bg-violet-50 dark:hover:bg-violet-900/30 cursor-pointer hover:opacity-90 transition-opacity">
                          <td className="whitespace-nowrap px-4 py-3 font-semibold text-violet-500">#{student.number}</td>
                          <td className="whitespace-nowrap px-4 py-3">{editingStudent === student.id ? (
                            <Input value={editForm.firstname || ""} onChange={e => setEditForm({ ...editForm, firstname: e.target.value })} className="h-8 w-28" />
                          ) : (student.firstname || "-")}</td>
                          <td className="whitespace-nowrap px-4 py-3">{editingStudent === student.id ? (
                            <Input value={editForm.lastname || ""} onChange={e => setEditForm({ ...editForm, lastname: e.target.value })} className="h-8 w-28" />
                          ) : (student.lastname || "-")}</td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="flex ml-8">
                              <Button type="button" size="sm" className="bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 text-violet-500 dark:text-violet-300 cursor-pointer" onClick={() => setEditingPasswordId(student.id)}>
                                <Key className="h-4 w-4 inline" />
                              </Button>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono">{student.createdAt ? new Date(student.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : '-'}</td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono">{student.updatedAt ? new Date(student.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : '-'}</td>
                          <td className="whitespace-nowrap px-4 py-3">
                          {editingStudent === student.id ? (
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={editForm.isAdmin || false} onChange={e => setEditForm({ ...editForm, isAdmin: e.target.checked })} className="h-4 w-4 rounded border-violet-300 text-violet-500 focus:ring-violet-500" />
                              <span className="text-xs font-medium">Admin</span>
                            </label>
                          ) : student.isAdmin ? (
                            <span className="rounded-full bg-yellow-400 dark:bg-yellow-500 px-3 py-1 text-xs font-bold text-white">Admin</span>
                          ) : (
                            <span className="rounded-full bg-violet-500 dark:bg-violet-500 px-3 py-1 text-xs font-bold text-white">Étudiant</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {editingStudent === student.id ? (
                              <>
                                <Button variant="outline" size="sm" className="border-none bg-green-500 text-white hover:bg-green-700 font-medium cursor-pointer" onClick={handleUpdate}><Save className="h-4 w-4" /></Button>
                                <Button variant="outline" size="sm" className="border-none bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-200 hover:opacity-90 font-medium cursor-pointer" onClick={cancelEdit}><X className="h-4 w-4" /></Button>
                              </>
                            ) : (
                              <>
                                <Button variant="outline" size="sm" className="border-none bg-violet-500 text-white hover:bg-violet-700 font-medium cursor-pointer" onClick={() => startEdit(student)}><Pencil className="h-4 w-4" /></Button>
                                <Button variant="outline" size="sm" className="border-none bg-red-500 text-white hover:bg-red-700 font-medium cursor-pointer" onClick={() => setDeleteId(student.id)}><Trash2 className="h-4 w-4" /></Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Onglet Numéros autorisés */}
        {tab === "allowed" && (
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 md:p-6 shadow-lg bg-white dark:bg-neutral-950">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-violet-500 dark:text-violet-300 mr-4">Liste des numéros autorisés</h2>
              <Button
                onClick={() => setShowAddUser((v) => !v)}
                className="w-full sm:w-auto bg-violet-500 hover:bg-violet-700 hover:cursor-pointer text-white font-semibold"
              >
                {showAddUser ? "Annuler" : "Ajouter un numéro"}
              </Button>
            </div>
            {showAddUser && (
              <div className="mb-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4">
                <form onSubmit={handleAddAllowed} className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="allowed-number" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Numéro <span className="text-red-500">*</span></label>
                    <Input id="allowed-number" type="text" value={newAllowed.number} onChange={e => setNewAllowed({ ...newAllowed, number: e.target.value })} className="mt-1" required />
                  </div>
                  <div>
                    <label htmlFor="allowed-label" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Label (optionnel)</label>
                    <Input id="allowed-label" type="text" value={newAllowed.label} onChange={e => setNewAllowed({ ...newAllowed, label: e.target.value })} className="mt-1" />
                  </div>
                  <div className="col-span-2">
                    <Button type="submit" className="w-full bg-violet-500 hover:bg-violet-700 hover:cursor-pointer text-white">Ajouter</Button>
                  </div>
                </form>
              </div>
            )}
            {allowedLoading ? (
              <div className="flex justify-center items-center h-32"><div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-violet-500"></div></div>
            ) : allowed.length === 0 ? (
              <div className="rounded-lg border border-violet-200 dark:border-violet-800 p-8 bg-white/50 dark:bg-neutral-900/50 text-center">
                <h3 className="mt-2 text-xl font-bold text-violet-500 dark:text-violet-300">Aucun numéro autorisé</h3>
                <p className="mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">Ajoutez des numéros en utilisant le bouton ci-dessus.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-100 dark:bg-neutral-900/40">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Numéro</th>
                      <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Label</th>
                      <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Ajouté le</th>
                      <th className="px-4 py-3 text-right font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900/40">
                    {allowed.map((item) => (
                      <tr key={item.id} className="bg-white dark:bg-neutral-950 hover:bg-violet-50 dark:hover:bg-violet-900/30 cursor-pointer hover:opacity-90 transition-opacity">
                        <td className="whitespace-nowrap px-4 py-3 font-mono">{item.number}</td>
                        <td className="whitespace-nowrap px-4 py-3">{item.label || "-"}</td>
                        <td className="whitespace-nowrap px-4 py-3">{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <Button variant="outline" size="sm" className="border-red-200 bg-white dark:bg-red-700 text-red-500 dark:text-red-200 hover:opacity-90 font-medium cursor-pointer" onClick={() => setDeleteAllowedId(item.id)}><Trash2 className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Modals de confirmation */}
      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && handleDelete(deleteId)} title="Supprimer l'utilisateur ?" description="Cette action est irréversible. L'utilisateur sera supprimé définitivement." />
      <ConfirmModal open={!!deleteAllowedId} onClose={() => setDeleteAllowedId(null)} onConfirm={() => deleteAllowedId && handleDeleteAllowed(deleteAllowedId)} title="Supprimer ce numéro autorisé ?" description="L'étudiant ne pourra plus s'inscrire avec ce numéro." />
      <PasswordModal
        open={!!editingPasswordId}
        onClose={() => { setEditingPasswordId(null); setPasswordModalError(null); setPasswordModalLoading(false); }}
        loading={passwordModalLoading}
        error={passwordModalError}
        onSubmit={async (password) => {
          if (!editingPasswordId) return;
          setPasswordModalLoading(true);
          setPasswordModalError(null);
          try {
            const res = await fetch("/api/admin/students", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: editingPasswordId, password })
            });
            if (!res.ok) throw new Error("Erreur lors du changement de mot de passe");
            setEditingPasswordId(null);
            setSuccess("Mot de passe mis à jour");
            setTimeout(() => setSuccess(null), 3000);
          } catch (err: any) {
            setPasswordModalError(err.message);
          } finally {
            setPasswordModalLoading(false);
          }
        }}
      />
    </div>
  );
}