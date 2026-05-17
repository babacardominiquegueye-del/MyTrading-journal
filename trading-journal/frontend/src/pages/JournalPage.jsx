// ============================================================
// pages/JournalPage.jsx
// ============================================================
import React, { useState, useEffect } from "react";
import { journalService } from "../services/api";
import { Button, LoadingSpinner, EmptyState, Modal, Input, Alert } from "../components/common/index.jsx";

export default function JournalPage() {
  const [entries, setEntries]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [form, setForm] = useState({
    title: "", content: "", date: new Date().toISOString().split("T")[0],
    mood: "neutral", marketCondition: "trending", keyLessons: "", nextSessionGoals: "",
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await journalService.getAll();
        setEntries(data.data);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const openCreate = () => { setEditEntry(null); setForm({ title: "", content: "", date: new Date().toISOString().split("T")[0], mood: "neutral", marketCondition: "trending", keyLessons: "", nextSessionGoals: "" }); setShowModal(true); };
  const openEdit   = (e) => { setEditEntry(e); setForm({ ...e, keyLessons: (e.keyLessons || []).join("\n"), nextSessionGoals: (e.nextSessionGoals || []).join("\n") }); setShowModal(true); };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        keyLessons:        form.keyLessons.split("\n").filter(Boolean),
        nextSessionGoals:  form.nextSessionGoals.split("\n").filter(Boolean),
      };
      if (editEntry) {
        const { data } = await journalService.update(editEntry._id, payload);
        setEntries((p) => p.map((e) => (e._id === editEntry._id ? data.data : e)));
      } else {
        const { data } = await journalService.create(payload);
        setEntries((p) => [data.data, ...p]);
      }
      setShowModal(false);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette entrée ?")) return;
    await journalService.delete(id);
    setEntries((p) => p.filter((e) => e._id !== id));
  };

  const moodColors = { excellent: "text-accent-green", good: "text-accent-green/70", neutral: "text-dark-400", poor: "text-accent-red/70", terrible: "text-accent-red" };
  const moodEmojis = { excellent: "😄", good: "🙂", neutral: "😐", poor: "😕", terrible: "😤" };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Journal de Trading</h1>
          <p className="text-dark-400 text-sm">{entries.length} entrées</p>
        </div>
        <Button onClick={openCreate}>+ Nouvelle entrée</Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError("")} />}

      {entries.length === 0 ? (
        <EmptyState icon="📓" title="Journal vide" description="Commencez à documenter vos sessions de trading."
          action={<Button onClick={openCreate}>Créer ma première entrée</Button>} />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry._id} className="bg-dark-800 border border-dark-600 rounded-xl p-5 hover:border-dark-500 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{moodEmojis[entry.mood] || "😐"}</span>
                    <h3 className="text-white font-semibold truncate">{entry.title}</h3>
                  </div>
                  <p className="text-dark-400 text-xs mb-2">
                    {new Date(entry.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    {entry.marketCondition && <span className="ml-2 text-dark-500">· {entry.marketCondition}</span>}
                  </p>
                  <p className="text-dark-300 text-sm line-clamp-2">{entry.content}</p>
                  {entry.keyLessons?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {entry.keyLessons.slice(0, 2).map((l, i) => (
                        <span key={i} className="bg-accent-blue/10 text-accent-blue text-xs px-2 py-0.5 rounded-full border border-accent-blue/20">
                          💡 {l}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(entry)} className="text-dark-400 hover:text-accent-gold p-1.5 rounded transition-colors">✏️</button>
                  <button onClick={() => handleDelete(entry._id)} className="text-dark-400 hover:text-accent-red p-1.5 rounded transition-colors">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editEntry ? "Modifier l'entrée" : "Nouvelle entrée journal"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" name="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Humeur</label>
              <select value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })}
                className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/30">
                {["excellent","good","neutral","poor","terrible"].map((m) => (
                  <option key={m} value={m}>{moodEmojis[m]} {m}</option>
                ))}
              </select>
            </div>
          </div>
          <Input label="Titre *" name="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Contenu *</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} required
              placeholder="Décrivez votre session de trading, vos observations, votre état d'esprit..."
              className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-accent-green/30 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Leçons apprises (une par ligne)</label>
            <textarea value={form.keyLessons} onChange={(e) => setForm({ ...form, keyLessons: e.target.value })} rows={2}
              placeholder="Attendre la confirmation&#10;Respecter le stop loss"
              className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-accent-green/30 resize-none" />
          </div>
          <div className="flex gap-3">
            <Button type="submit" loading={saving} className="flex-1">{editEntry ? "Mettre à jour" : "Enregistrer"}</Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
