'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '@/lib/supabase';

// ─── COLOUR TOKENS ────────────────────────────────────────────────────────────
const C = {
  navy:    '#0D1A3A',
  navyEl:  '#1E3A6E',
  navyMid: '#0F2247',
  gold:    '#B6B2A5',
  teal:    '#42AACC',
  sec:     '#3D5070',
  muted:   '#8FA8C8',
  pearl:   '#E8EDF5',
  red:     '#FF4444',
  green:   '#00C896',
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function initials(name = '') {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({ name, photoUrl, size = 44 }) {
  const [err, setErr] = useState(false);
  if (photoUrl && !err) {
    return (
      <img
        src={photoUrl}
        alt={name}
        onError={() => setErr(true)}
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover', border: `2px solid ${C.teal}`,
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: C.navyEl, border: `2px solid ${C.teal}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize: size * 0.32,
      flexShrink: 0, fontFamily: 'monospace',
    }}>
      {initials(name)}
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            style={{
              background: t.type === 'error' ? '#2a0a0a' : t.type === 'success' ? '#0a2a1a' : C.navyEl,
              border: `1px solid ${t.type === 'error' ? C.red : t.type === 'success' ? C.green : C.teal}`,
              color: t.type === 'error' ? C.red : t.type === 'success' ? C.green : C.teal,
              padding: '10px 18px', borderRadius: 10, fontSize: 13,
              fontWeight: 600, maxWidth: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            }}
          >
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts, push };
}

// ─── DRAG DROP IMAGE UPLOAD ───────────────────────────────────────────────────
function ImageDropZone({ bucket, pathPrefix, currentUrl, onUploaded, label = 'Drop image here' }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const fileRef = useRef();

  const upload = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setStatus('err'); return;
    }
    setUploading(true); setStatus(null);
    const ext = file.name.split('.').pop();
    const path = `${pathPrefix}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) { setUploading(false); setStatus('err'); return; }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    setUploading(false); setStatus('ok');
    onUploaded(data.publicUrl);
    setTimeout(() => setStatus(null), 2000);
  };

  const border = dragging ? C.gold : status === 'ok' ? C.green : status === 'err' ? C.red : `rgba(0,200,224,0.3)`;

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files[0]); }}
      onClick={() => fileRef.current?.click()}
      style={{
        border: `2px dashed ${border}`,
        borderRadius: 12, cursor: 'pointer',
        background: dragging ? 'rgba(255,198,0,0.05)' : 'rgba(0,200,224,0.03)',
        transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
        minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => upload(e.target.files[0])} />
      {currentUrl ? (
        <div style={{ position: 'relative', width: '100%' }}>
          <img src={currentUrl} alt="current" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10, display: 'block' }} />
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(13,26,58,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 10, opacity: dragging ? 1 : 0, transition: 'opacity 0.2s',
          }}>
            <span style={{ color: C.gold, fontWeight: 700, fontSize: 13 }}>Drop to replace</span>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>📁</div>
          <div style={{ color: C.muted, fontSize: 12 }}>{label}</div>
        </div>
      )}
      {uploading && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(13,26,58,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10,
        }}>
          <div style={{ color: C.teal, fontWeight: 700, fontSize: 13 }}>Uploading…</div>
        </div>
      )}
      {status === 'ok' && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,200,150,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10,
        }}>
          <div style={{ color: C.green, fontWeight: 700, fontSize: 18 }}>✓ Uploaded</div>
        </div>
      )}
    </div>
  );
}

// ─── INPUT / BUTTON PRIMITIVES ────────────────────────────────────────────────
const inputStyle = {
  background: C.navy, border: `1px solid rgba(0,200,224,0.25)`,
  borderRadius: 8, color: '#fff', padding: '8px 12px',
  fontSize: 13, width: '100%', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
};

// FIX: Fully controlled input — always uses value + onChange.
// The old code used defaultValue + onBlur which caused stale data when
// switching domains (React only reads defaultValue on first render).
function Input({ label, value, onChange, onBlur, type = 'text', placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em' }}>{label}</label>}
      <input
        style={inputStyle}
        type={type}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={onChange}
        onBlur={onBlur}
      />
    </div>
  );
}

function Btn({ children, onClick, variant = 'primary', style: s = {}, disabled }) {
  const variants = {
    primary:   { background: C.gold,    color: C.navy,  border: 'none' },
    secondary: { background: 'transparent', color: C.teal, border: `1px solid ${C.teal}` },
    danger:    { background: 'transparent', color: C.red,  border: `1px solid ${C.red}` },
    ghost:     { background: 'transparent', color: C.muted, border: `1px solid rgba(255,255,255,0.1)` },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        padding: '7px 16px', borderRadius: 8, fontWeight: 700,
        fontSize: 12, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, transition: 'opacity 0.15s',
        fontFamily: 'inherit', ...s,
      }}
    >
      {children}
    </button>
  );
}

function Card({ children, style: s = {} }) {
  return (
    <div style={{
      background: C.navyEl, border: `1px solid rgba(0,200,224,0.12)`,
      borderRadius: 14, padding: 20, ...s,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ color: C.muted, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
      {children}
    </div>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Enter email and password.'); return; }
    setLoading(true); setError('');
    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr) { setLoading(false); setError(authErr.message); return; }

    const { data: allowed } = await supabase
      .from('admin_allowed_emails')
      .select('email')
      .eq('email', data.user.email)
      .single();

    if (!allowed) {
      await supabase.auth.signOut();
      setLoading(false);
      setError('Access denied. Your email is not authorised.');
      return;
    }
    setLoading(false);
    onLogin(data.user);
  };

  return (
    <div style={{
      minHeight: '100vh', background: C.navy,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: C.navyEl, border: `1px solid rgba(0,200,224,0.18)`,
          borderRadius: 20, padding: 48, width: '100%', maxWidth: 400,
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 11, color: C.teal, letterSpacing: '0.2em', fontWeight: 700, marginBottom: 8 }}>
            HEXAWATTS RACING
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
            ADMIN <span style={{ color: C.gold }}>PORTAL</span>
          </div>
          <div style={{ width: 48, height: 2, background: C.gold, margin: '12px auto 0' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="EMAIL" type="email" placeholder="you@hexawatts.com"
            value={email} onChange={e => setEmail(e.target.value)} />
          <Input label="PASSWORD" type="password" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)} />

          {error && (
            <div style={{ color: C.red, fontSize: 12, fontWeight: 600, padding: '8px 12px', background: 'rgba(255,68,68,0.08)', borderRadius: 8, border: `1px solid rgba(255,68,68,0.2)` }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              background: C.gold, color: C.navy, border: 'none',
              borderRadius: 10, padding: '12px 0', fontWeight: 900,
              fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, marginTop: 8, fontFamily: 'inherit',
              letterSpacing: '0.05em',
            }}
          >
            {loading ? 'SIGNING IN…' : 'SIGN IN →'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── DASHBOARD SECTION ────────────────────────────────────────────────────────
function Dashboard() {
  const [stats, setStats] = useState({ domains: 0, members: 0, slides: 0, sponsors: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [d, m, s, sp, rc] = await Promise.all([
        supabase.from('domains').select('id', { count: 'exact', head: true }),
        supabase.from('team_members').select('id', { count: 'exact', head: true }),
        supabase.from('hero_slides').select('id', { count: 'exact', head: true }),
        supabase.from('sponsors').select('id', { count: 'exact', head: true }),
        supabase.from('team_members').select('name, role_title, updated_at').order('updated_at', { ascending: false }).limit(5),
      ]);
      setStats({ domains: d.count || 0, members: m.count || 0, slides: s.count || 0, sponsors: sp.count || 0 });
      setRecent(rc.data || []);
      setLoading(false);
    })();
  }, []);

  const statCards = [
    { label: 'Domains', value: stats.domains, icon: '🏎️' },
    { label: 'Team Members', value: stats.members, icon: '👥' },
    { label: 'Hero Slides', value: stats.slides, icon: '🖼️' },
    { label: 'Sponsors', value: stats.sponsors, icon: '🤝' },
  ];

  if (loading) return <Loader />;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Hexawatts Racing — Mission Control" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {statCards.map(s => (
          <Card key={s.label}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: C.teal, lineHeight: 1 }}>{s.value}</div>
            <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginTop: 4 }}>{s.label.toUpperCase()}</div>
          </Card>
        ))}
      </div>

      <Card>
        <SectionTitle>Recent Member Updates</SectionTitle>
        {recent.length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>No recent activity.</div>}
        {recent.map((r, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 0', borderBottom: i < recent.length - 1 ? `1px solid rgba(255,255,255,0.05)` : 'none',
          }}>
            <Avatar name={r.name} photoUrl={null} size={36} />
            <div>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{r.name}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>{r.role_title}</div>
            </div>
            <div style={{ marginLeft: 'auto', color: C.muted, fontSize: 11 }}>
              {new Date(r.updated_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── TEAM SECTION ─────────────────────────────────────────────────────────────
// FIX: The core bug was that `lead`, `members`, and `editDomain` weren't cleared
// when switching domains, so stale data (e.g. "Vikram Anand / VD Lead" under
// Aerodynamics) would flash until the new fetch resolved. Now we clear all
// domain-scoped state immediately on domain selection and show a per-panel loader.

function TeamSection({ toast }) {
  const [domains, setDomains] = useState([]);
  const [selectedId, setSelectedId] = useState(null);       // FIX: store id, not object
  const [domainLoading, setDomainLoading] = useState(false); // FIX: new per-domain loader
  const [editDomain, setEditDomain] = useState(null);
  const [lead, setLead] = useState(null);
  const [leadForm, setLeadForm] = useState({});              // FIX: separate controlled form state
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMember, setEditMember] = useState(null);
  const [addingMember, setAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role_title: '' });
  const [addingDomain, setAddingDomain] = useState(false);
  const [newDomain, setNewDomain] = useState({ name: '', slug: '', icon: '⚙️', description: '' });
  const [saving, setSaving] = useState(false);

  // Derive selected domain object from list
  const selected = domains.find(d => d.id === selectedId) || null;

  useEffect(() => { fetchDomains(); }, []);

  const fetchDomains = async () => {
    const { data } = await supabase.from('domains').select('*').order('display_order');
    setDomains(data || []);
    setLoading(false);
  };

  const selectDomain = async (domain) => {
    // FIX: Immediately wipe stale state before async fetch so old data never shows
    setSelectedId(domain.id);
    setEditDomain({ ...domain });
    setLead(null);
    setLeadForm({});
    setMembers([]);
    setEditMember(null);
    setAddingMember(false);
    setDomainLoading(true);

    const [leadRes, membersRes] = await Promise.all([
      supabase.from('team_leads').select('*').eq('domain_id', domain.id).single(),
      supabase.from('team_members').select('*').eq('domain_id', domain.id).order('display_order'),
    ]);

    const leadData = leadRes.data || null;
    setLead(leadData);
    setLeadForm(leadData ? {
      name: leadData.name || '',
      role_title: leadData.role_title || '',
      email: leadData.email || '',
      linkedin_url: leadData.linkedin_url || '',
    } : {});
    setMembers(membersRes.data || []);
    setDomainLoading(false);
  };

  const saveDomain = async () => {
    setSaving(true);
    const { error } = await supabase.from('domains').update({
      name: editDomain.name,
      icon: editDomain.icon,
      description: editDomain.description,
    }).eq('id', selectedId);
    setSaving(false);
    if (error) { toast(error.message, 'error'); return; }
    toast('Domain updated!');
    // Update local list too
    setDomains(prev => prev.map(d => d.id === selectedId ? { ...d, ...editDomain } : d));
  };

  const deleteDomain = async (id) => {
    if (!confirm('Delete this domain and all its members?')) return;
    await supabase.from('domains').delete().eq('id', id);
    toast('Domain deleted.', 'info');
    setSelectedId(null);
    setEditDomain(null);
    setLead(null);
    setLeadForm({});
    setMembers([]);
    fetchDomains();
  };

  const createDomain = async () => {
    if (!newDomain.name || !newDomain.slug) { toast('Name and slug required.', 'error'); return; }
    setSaving(true);
    const { error } = await supabase.from('domains').insert({
      ...newDomain,
      display_order: domains.length + 1,
    });
    setSaving(false);
    if (error) { toast(error.message, 'error'); return; }
    toast('Domain created!');
    setAddingDomain(false);
    setNewDomain({ name: '', slug: '', icon: '⚙️', description: '' });
    fetchDomains();
  };

  // FIX: Lead fields are now fully controlled via leadForm state
  const saveLeadField = async (field) => {
    if (!lead) return;
    const value = leadForm[field];
    const { error } = await supabase.from('team_leads').update({ [field]: value }).eq('id', lead.id);
    if (error) { toast(error.message, 'error'); return; }
    setLead(p => ({ ...p, [field]: value }));
    toast('Lead updated!');
  };

  const saveLeadPhoto = async (url) => {
    if (!lead) return;
    await supabase.from('team_leads').update({ photo_url: url }).eq('id', lead.id);
    setLead(p => ({ ...p, photo_url: url }));
    setLeadForm(p => ({ ...p, photo_url: url }));
    toast('Lead photo updated!');
  };

  const saveMember = async () => {
    if (!editMember) return;
    setSaving(true);
    const { error } = await supabase.from('team_members').update({
      name: editMember.name,
      role_title: editMember.role_title,
    }).eq('id', editMember.id);
    setSaving(false);
    if (error) { toast(error.message, 'error'); return; }
    setMembers(p => p.map(m => m.id === editMember.id ? { ...m, ...editMember } : m));
    toast('Member updated!');
    setEditMember(null);
  };

  const saveMemberPhoto = async (id, url) => {
    await supabase.from('team_members').update({ photo_url: url }).eq('id', id);
    setMembers(p => p.map(m => m.id === id ? { ...m, photo_url: url } : m));
    toast('Photo updated!');
  };

  const deleteMember = async (id) => {
    if (!confirm('Remove this member?')) return;
    await supabase.from('team_members').delete().eq('id', id);
    setMembers(p => p.filter(m => m.id !== id));
    toast('Member removed.', 'info');
  };

  const addMember = async () => {
    if (!newMember.name) { toast('Name required.', 'error'); return; }
    setSaving(true);
    const { data, error } = await supabase.from('team_members').insert({
      domain_id: selectedId,
      name: newMember.name,
      role_title: newMember.role_title,
      display_order: members.length + 1,
    }).select().single();
    setSaving(false);
    if (error) { toast(error.message, 'error'); return; }
    setMembers(p => [...p, data]);
    toast('Member added!');
    setAddingMember(false);
    setNewMember({ name: '', role_title: '' });
  };

  if (loading) return <Loader />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20, minHeight: 600 }}>
      {/* Domain list */}
      <div>
        <PageHeader title="Team" subtitle="Domains & Members" compact />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {domains.map(d => (
            <div
              key={d.id}
              onClick={() => selectDomain(d)}
              style={{
                padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                background: selectedId === d.id ? C.navyEl : 'transparent',
                border: `1px solid ${selectedId === d.id ? C.teal : 'rgba(255,255,255,0.06)'}`,
                color: selectedId === d.id ? '#fff' : C.muted,
                fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.15s',
              }}
            >
              <span>{d.icon}</span>
              <span style={{ flex: 1 }}>{d.name}</span>
            </div>
          ))}
        </div>
        <Btn variant="secondary" onClick={() => setAddingDomain(true)} style={{ width: '100%', fontSize: 11 }}>
          + NEW DOMAIN
        </Btn>

        <AnimatePresence>
          {addingDomain && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card style={{ marginTop: 12 }}>
                <SectionTitle>New Domain</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Input label="NAME" value={newDomain.name} onChange={e => setNewDomain(p => ({ ...p, name: e.target.value }))} />
                  <Input label="SLUG" value={newDomain.slug} onChange={e => setNewDomain(p => ({ ...p, slug: e.target.value }))} placeholder="e.g. powertrain" />
                  <Input label="ICON" value={newDomain.icon} onChange={e => setNewDomain(p => ({ ...p, icon: e.target.value }))} />
                  <Input label="DESCRIPTION" value={newDomain.description} onChange={e => setNewDomain(p => ({ ...p, description: e.target.value }))} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Btn onClick={createDomain} disabled={saving}>Create</Btn>
                    <Btn variant="ghost" onClick={() => setAddingDomain(false)}>Cancel</Btn>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Domain detail */}
      <div>
        {!selectedId ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: C.muted, fontSize: 14 }}>
            ← Select a domain to edit
          </div>
        ) : domainLoading ? (
          // FIX: Show a clean loader while domain data is fetching — no stale data flash
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
            <div style={{ color: C.teal, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em' }}>LOADING…</div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={selectedId} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              {/* Domain edit */}
              <Card style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <SectionTitle>Domain Info</SectionTitle>
                  <Btn variant="danger" onClick={() => deleteDomain(selectedId)} style={{ fontSize: 11 }}>Delete Domain</Btn>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <Input label="NAME"
                    value={editDomain?.name || ''}
                    onChange={e => setEditDomain(p => ({ ...p, name: e.target.value }))} />
                  <Input label="ICON"
                    value={editDomain?.icon || ''}
                    onChange={e => setEditDomain(p => ({ ...p, icon: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <Input label="DESCRIPTION"
                    value={editDomain?.description || ''}
                    onChange={e => setEditDomain(p => ({ ...p, description: e.target.value }))} />
                </div>
                <Btn onClick={saveDomain} disabled={saving}>{saving ? 'Saving…' : 'Save Domain'}</Btn>
              </Card>

              {/* Lead */}
              {lead && (
                <Card style={{ marginBottom: 16 }}>
                  <SectionTitle>Domain Lead</SectionTitle>
                  <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, alignItems: 'start' }}>
                    <div>
                      <ImageDropZone
                        bucket="team-photos"
                        pathPrefix={`lead-${lead.id}`}
                        currentUrl={lead.photo_url}
                        onUploaded={saveLeadPhoto}
                        label="Drop lead photo"
                      />
                    </div>
                    {/* FIX: All lead inputs are now controlled — value from leadForm, onChange updates leadForm,
                        onBlur persists to Supabase. No more stale defaultValue on domain switch. */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <Input label="NAME"
                        value={leadForm.name || ''}
                        onChange={e => setLeadForm(p => ({ ...p, name: e.target.value }))}
                        onBlur={() => saveLeadField('name')} />
                      <Input label="ROLE TITLE"
                        value={leadForm.role_title || ''}
                        onChange={e => setLeadForm(p => ({ ...p, role_title: e.target.value }))}
                        onBlur={() => saveLeadField('role_title')} />
                      <Input label="EMAIL"
                        value={leadForm.email || ''}
                        onChange={e => setLeadForm(p => ({ ...p, email: e.target.value }))}
                        onBlur={() => saveLeadField('email')} />
                      <Input label="LINKEDIN URL"
                        value={leadForm.linkedin_url || ''}
                        onChange={e => setLeadForm(p => ({ ...p, linkedin_url: e.target.value }))}
                        onBlur={() => saveLeadField('linkedin_url')} />
                    </div>
                  </div>
                </Card>
              )}

              {!lead && (
                <Card style={{ marginBottom: 16 }}>
                  <div style={{ color: C.muted, fontSize: 13 }}>No lead assigned to this domain.</div>
                </Card>
              )}

              {/* Members */}
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <SectionTitle>Members ({members.length})</SectionTitle>
                  <Btn variant="secondary" onClick={() => setAddingMember(true)} style={{ fontSize: 11 }}>+ ADD MEMBER</Btn>
                </div>

                <AnimatePresence>
                  {addingMember && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 16 }}>
                      <div style={{ background: C.navy, borderRadius: 10, padding: 16, display: 'flex', gap: 10, alignItems: 'flex-end', border: `1px solid rgba(0,200,224,0.15)` }}>
                        <div style={{ flex: 1 }}><Input label="NAME" value={newMember.name} onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))} /></div>
                        <div style={{ flex: 1 }}><Input label="ROLE" value={newMember.role_title} onChange={e => setNewMember(p => ({ ...p, role_title: e.target.value }))} /></div>
                        <Btn onClick={addMember} disabled={saving}>Add</Btn>
                        <Btn variant="ghost" onClick={() => setAddingMember(false)}>✕</Btn>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                  {members.map(m => (
                    <div key={m.id} style={{
                      background: C.navy, borderRadius: 10, padding: 14,
                      border: `1px solid rgba(255,255,255,0.06)`,
                    }}>
                      {editMember?.id === m.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <Input label="NAME"
                            value={editMember.name}
                            onChange={e => setEditMember(p => ({ ...p, name: e.target.value }))} />
                          <Input label="ROLE"
                            value={editMember.role_title}
                            onChange={e => setEditMember(p => ({ ...p, role_title: e.target.value }))} />
                          <ImageDropZone
                            bucket="team-photos"
                            pathPrefix={`member-${m.id}`}
                            currentUrl={editMember.photo_url}
                            onUploaded={url => { saveMemberPhoto(m.id, url); setEditMember(p => ({ ...p, photo_url: url })); }}
                            label="Drop photo"
                          />
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Btn onClick={saveMember} disabled={saving} style={{ flex: 1, fontSize: 11 }}>Save</Btn>
                            <Btn variant="ghost" onClick={() => setEditMember(null)} style={{ fontSize: 11 }}>✕</Btn>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <Avatar name={m.name} photoUrl={m.photo_url} size={40} />
                            <div>
                              <div style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{m.name}</div>
                              <div style={{ color: C.muted, fontSize: 10 }}>{m.role_title}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Btn variant="secondary" onClick={() => setEditMember({ ...m })} style={{ flex: 1, fontSize: 10 }}>Edit</Btn>
                            <Btn variant="danger" onClick={() => deleteMember(m.id)} style={{ fontSize: 10 }}>✕</Btn>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ─── HERO SLIDES SECTION ──────────────────────────────────────────────────────
function HeroSlides({ toast }) {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newSlide, setNewSlide] = useState({ headline: '', subtext: '', cta_label: 'Learn More', cta_href: '/', image_url: '' });
  // FIX: Track per-slide edits in a map so inputs are controlled
  const [slideEdits, setSlideEdits] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSlides(); }, []);

  const fetchSlides = async () => {
    const { data } = await supabase.from('hero_slides').select('*').order('display_order');
    setSlides(data || []);
    // Seed edits map
    const edits = {};
    (data || []).forEach(s => { edits[s.id] = { ...s }; });
    setSlideEdits(edits);
    setLoading(false);
  };

  const persistSlideField = async (id, field, value) => {
    await supabase.from('hero_slides').update({ [field]: value }).eq('id', id);
    setSlides(p => p.map(s => s.id === id ? { ...s, [field]: value } : s));
    if (field !== 'image_url') toast('Slide updated!');
  };

  const updateSlidePhoto = async (id, url) => {
    await persistSlideField(id, 'image_url', url);
    setSlideEdits(p => ({ ...p, [id]: { ...p[id], image_url: url } }));
    toast('Slide image updated!');
  };

  const toggleActive = async (id, val) => {
    await supabase.from('hero_slides').update({ is_active: val }).eq('id', id);
    setSlides(p => p.map(s => s.id === id ? { ...s, is_active: val } : s));
    toast(val ? 'Slide activated.' : 'Slide hidden.');
  };

  const deleteSlide = async (id) => {
    if (!confirm('Delete this slide?')) return;
    await supabase.from('hero_slides').delete().eq('id', id);
    setSlides(p => p.filter(s => s.id !== id));
    toast('Slide deleted.', 'info');
  };

  const addSlide = async () => {
    setSaving(true);
    const { error } = await supabase.from('hero_slides').insert({
      ...newSlide,
      display_order: slides.length + 1,
      is_active: true,
    });
    setSaving(false);
    if (error) { toast(error.message, 'error'); return; }
    toast('Slide created!');
    setAdding(false);
    setNewSlide({ headline: '', subtext: '', cta_label: 'Learn More', cta_href: '/', image_url: '' });
    fetchSlides();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <PageHeader title="Hero Slides" subtitle="Homepage carousel" compact />
        <Btn variant="secondary" onClick={() => setAdding(true)}>+ NEW SLIDE</Btn>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card style={{ marginBottom: 20 }}>
              <SectionTitle>New Slide</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <Input label="HEADLINE" value={newSlide.headline} onChange={e => setNewSlide(p => ({ ...p, headline: e.target.value }))} />
                <Input label="SUBTEXT" value={newSlide.subtext} onChange={e => setNewSlide(p => ({ ...p, subtext: e.target.value }))} />
                <Input label="CTA LABEL" value={newSlide.cta_label} onChange={e => setNewSlide(p => ({ ...p, cta_label: e.target.value }))} />
                <Input label="CTA HREF" value={newSlide.cta_href} onChange={e => setNewSlide(p => ({ ...p, cta_href: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>SLIDE IMAGE</label>
                <ImageDropZone
                  bucket="hero-slides"
                  pathPrefix="new-slide"
                  currentUrl={newSlide.image_url}
                  onUploaded={url => setNewSlide(p => ({ ...p, image_url: url }))}
                  label="Drop hero image here"
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn onClick={addSlide} disabled={saving}>{saving ? 'Creating…' : 'Create Slide'}</Btn>
                <Btn variant="ghost" onClick={() => setAdding(false)}>Cancel</Btn>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {slides.map(slide => {
          const edit = slideEdits[slide.id] || slide;
          const setEdit = (field, value) => setSlideEdits(p => ({ ...p, [slide.id]: { ...p[slide.id], [field]: value } }));
          return (
            <Card key={slide.id}>
              <div style={{ marginBottom: 14 }}>
                <ImageDropZone
                  bucket="hero-slides"
                  pathPrefix={`slide-${slide.id}`}
                  currentUrl={edit.image_url}
                  onUploaded={url => updateSlidePhoto(slide.id, url)}
                  label="Drop to replace slide image"
                />
              </div>
              {/* FIX: Controlled inputs with onBlur-persist pattern */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                <Input label="HEADLINE"
                  value={edit.headline || ''}
                  onChange={e => setEdit('headline', e.target.value)}
                  onBlur={() => persistSlideField(slide.id, 'headline', edit.headline)} />
                <Input label="SUBTEXT"
                  value={edit.subtext || ''}
                  onChange={e => setEdit('subtext', e.target.value)}
                  onBlur={() => persistSlideField(slide.id, 'subtext', edit.subtext)} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <Input label="CTA LABEL"
                    value={edit.cta_label || ''}
                    onChange={e => setEdit('cta_label', e.target.value)}
                    onBlur={() => persistSlideField(slide.id, 'cta_label', edit.cta_label)} />
                  <Input label="CTA HREF"
                    value={edit.cta_href || ''}
                    onChange={e => setEdit('cta_href', e.target.value)}
                    onBlur={() => persistSlideField(slide.id, 'cta_href', edit.cta_href)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={() => toggleActive(slide.id, !slide.is_active)}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit', border: 'none',
                    background: slide.is_active ? C.green : C.sec,
                    color: slide.is_active ? '#fff' : C.muted,
                  }}
                >
                  {slide.is_active ? '● ACTIVE' : '○ HIDDEN'}
                </button>
                <div style={{ color: C.muted, fontSize: 11, flex: 1 }}>Order: {slide.display_order}</div>
                <Btn variant="danger" onClick={() => deleteSlide(slide.id)} style={{ fontSize: 10 }}>Delete</Btn>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── SITE IMAGES SECTION ──────────────────────────────────────────────────────
function SiteImages({ toast }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('site_images').select('*').order('section').then(({ data }) => {
      setImages(data || []);
      setLoading(false);
    });
  }, []);

  const updateImage = async (id, url) => {
    await supabase.from('site_images').update({ image_url: url }).eq('id', id);
    setImages(p => p.map(i => i.id === id ? { ...i, image_url: url } : i));
    toast('Image updated!');
  };

  if (loading) return <Loader />;

  const grouped = images.reduce((acc, img) => {
    if (!acc[img.section]) acc[img.section] = [];
    acc[img.section].push(img);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Site Images" subtitle="Replace any image across the public site" compact />
      {Object.entries(grouped).map(([section, imgs]) => (
        <div key={section} style={{ marginBottom: 32 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
            color: C.teal, textTransform: 'uppercase', marginBottom: 12,
            paddingBottom: 8, borderBottom: `1px solid rgba(0,200,224,0.15)`,
          }}>
            {section}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {imgs.map(img => (
              <Card key={img.id}>
                <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{img.label}</div>
                <div style={{ color: C.muted, fontSize: 10, marginBottom: 12, letterSpacing: '0.06em' }}>
                  {img.section} / {img.key}
                </div>
                <ImageDropZone
                  bucket="site-images"
                  pathPrefix={`${img.section}-${img.key}`}
                  currentUrl={img.image_url}
                  onUploaded={url => updateImage(img.id, url)}
                  label="Drop to replace image"
                />
              </Card>
            ))}
          </div>
        </div>
      ))}
      {images.length === 0 && (
        <div style={{ color: C.muted, fontSize: 14, textAlign: 'center', marginTop: 80 }}>
          No site images found. Add rows to the site_images table in Supabase.
        </div>
      )}
    </div>
  );
}

// ─── SPONSORS SECTION ─────────────────────────────────────────────────────────
function SponsorsSection({ toast }) {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newSponsor, setNewSponsor] = useState({ name: '', website_url: '', tier: 'silver', logo_url: '' });
  // FIX: Controlled edits map for sponsor inline fields
  const [sponsorEdits, setSponsorEdits] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSponsors(); }, []);

  const fetchSponsors = async () => {
    const { data } = await supabase.from('sponsors').select('*').order('display_order');
    setSponsors(data || []);
    const edits = {};
    (data || []).forEach(s => { edits[s.id] = { ...s }; });
    setSponsorEdits(edits);
    setLoading(false);
  };

  const persistSponsorField = async (id, field, value) => {
    await supabase.from('sponsors').update({ [field]: value }).eq('id', id);
    setSponsors(p => p.map(s => s.id === id ? { ...s, [field]: value } : s));
    toast('Sponsor updated!');
  };

  const updateLogo = async (id, url) => {
    await supabase.from('sponsors').update({ logo_url: url }).eq('id', id);
    setSponsors(p => p.map(s => s.id === id ? { ...s, logo_url: url } : s));
    setSponsorEdits(p => ({ ...p, [id]: { ...p[id], logo_url: url } }));
    toast('Logo updated!');
  };

  const toggleActive = async (id, val) => {
    await supabase.from('sponsors').update({ is_active: val }).eq('id', id);
    setSponsors(p => p.map(s => s.id === id ? { ...s, is_active: val } : s));
    toast(val ? 'Sponsor activated.' : 'Sponsor hidden.');
  };

  const deleteSponsor = async (id) => {
    if (!confirm('Remove this sponsor?')) return;
    await supabase.from('sponsors').delete().eq('id', id);
    setSponsors(p => p.filter(s => s.id !== id));
    toast('Sponsor removed.', 'info');
  };

  const addSponsor = async () => {
    if (!newSponsor.name) { toast('Name required.', 'error'); return; }
    setSaving(true);
    const { error } = await supabase.from('sponsors').insert({
      ...newSponsor,
      display_order: sponsors.length + 1,
      is_active: true,
    });
    setSaving(false);
    if (error) { toast(error.message, 'error'); return; }
    toast('Sponsor added!');
    setAdding(false);
    setNewSponsor({ name: '', website_url: '', tier: 'silver', logo_url: '' });
    fetchSponsors();
  };

  if (loading) return <Loader />;

  const TIERS = ['title', 'gold', 'silver'];
  const TIER_COLOR = { title: C.gold, gold: '#FFB347', silver: C.muted };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <PageHeader title="Sponsors" subtitle="Manage sponsor logos & tiers" compact />
        <Btn variant="secondary" onClick={() => setAdding(true)}>+ ADD SPONSOR</Btn>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card style={{ marginBottom: 20 }}>
              <SectionTitle>New Sponsor</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <Input label="NAME" value={newSponsor.name} onChange={e => setNewSponsor(p => ({ ...p, name: e.target.value }))} />
                <Input label="WEBSITE URL" value={newSponsor.website_url} onChange={e => setNewSponsor(p => ({ ...p, website_url: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>TIER</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {TIERS.map(t => (
                    <button key={t} onClick={() => setNewSponsor(p => ({ ...p, tier: t }))}
                      style={{
                        padding: '6px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'inherit',
                        background: newSponsor.tier === t ? TIER_COLOR[t] : 'transparent',
                        color: newSponsor.tier === t ? C.navy : TIER_COLOR[t],
                        border: `1px solid ${TIER_COLOR[t]}`,
                      }}
                    >{t.toUpperCase()}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>LOGO</label>
                <ImageDropZone
                  bucket="sponsor-logos"
                  pathPrefix="new-sponsor"
                  currentUrl={newSponsor.logo_url}
                  onUploaded={url => setNewSponsor(p => ({ ...p, logo_url: url }))}
                  label="Drop sponsor logo"
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn onClick={addSponsor} disabled={saving}>{saving ? 'Adding…' : 'Add Sponsor'}</Btn>
                <Btn variant="ghost" onClick={() => setAdding(false)}>Cancel</Btn>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {TIERS.map(tier => {
        const tierSponsors = sponsors.filter(s => s.tier === tier);
        if (tierSponsors.length === 0) return null;
        return (
          <div key={tier} style={{ marginBottom: 28 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
              color: TIER_COLOR[tier], textTransform: 'uppercase', marginBottom: 12,
              paddingBottom: 8, borderBottom: `1px solid ${TIER_COLOR[tier]}30`,
            }}>
              {tier} TIER
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tierSponsors.map(s => {
                const edit = sponsorEdits[s.id] || s;
                const setEdit = (field, value) => setSponsorEdits(p => ({ ...p, [s.id]: { ...p[s.id], [field]: value } }));
                return (
                  <Card key={s.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 16, alignItems: 'center' }}>
                    <ImageDropZone
                      bucket="sponsor-logos"
                      pathPrefix={`sponsor-${s.id}`}
                      currentUrl={edit.logo_url}
                      onUploaded={url => updateLogo(s.id, url)}
                      label="Drop logo"
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <Input label="NAME"
                        value={edit.name || ''}
                        onChange={e => setEdit('name', e.target.value)}
                        onBlur={() => persistSponsorField(s.id, 'name', edit.name)} />
                      <Input label="WEBSITE"
                        value={edit.website_url || ''}
                        onChange={e => setEdit('website_url', e.target.value)}
                        onBlur={() => persistSponsorField(s.id, 'website_url', edit.website_url)} />
                      <div>
                        <label style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>TIER</label>
                        <select
                          value={edit.tier || 'silver'}
                          onChange={e => { setEdit('tier', e.target.value); persistSponsorField(s.id, 'tier', e.target.value); }}
                          style={{ ...inputStyle, width: 'auto' }}
                        >
                          {TIERS.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>ORDER</label>
                        <input
                          type="number"
                          value={edit.display_order ?? ''}
                          onChange={e => setEdit('display_order', e.target.value)}
                          onBlur={() => persistSponsorField(s.id, 'display_order', parseInt(edit.display_order))}
                          style={{ ...inputStyle, width: 70 }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <button
                        onClick={() => toggleActive(s.id, !s.is_active)}
                        style={{
                          padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'inherit', border: 'none',
                          background: s.is_active ? C.green : C.sec,
                          color: s.is_active ? '#fff' : C.muted,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {s.is_active ? '● ACTIVE' : '○ HIDDEN'}
                      </button>
                      <Btn variant="danger" onClick={() => deleteSponsor(s.id)} style={{ fontSize: 10 }}>Remove</Btn>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ color: C.teal, fontSize: 13, fontWeight: 600, letterSpacing: '0.1em' }}>LOADING…</div>
    </div>
  );
}

function PageHeader({ title, subtitle, compact }) {
  return (
    <div style={{ marginBottom: compact ? 16 : 28 }}>
      <div style={{ fontSize: compact ? 20 : 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
        {title}
      </div>
      {subtitle && <div style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>{subtitle}</div>}
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'dashboard',  label: 'Dashboard',    icon: '📊' },
  { id: 'team',       label: 'Team',         icon: '👥' },
  { id: 'hero',       label: 'Hero Slides',  icon: '🖼️' },
  { id: 'images',     label: 'Site Images',  icon: '🗂️' },
  { id: 'sponsors',   label: 'Sponsors',     icon: '🤝' },
];

function Sidebar({ active, onNav, user, onLogout }) {
  return (
    <div style={{
      width: 240, background: C.navy, height: '100vh', position: 'fixed', left: 0, top: 0,
      display: 'flex', flexDirection: 'column', borderRight: `1px solid rgba(0,200,224,0.1)`,
      zIndex: 100,
    }}>
      <div style={{ padding: '28px 20px 24px', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
        <div style={{ fontSize: 9, color: C.teal, letterSpacing: '0.2em', fontWeight: 700, marginBottom: 4 }}>
          HEXAWATTS RACING
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>
          ADMIN <span style={{ color: C.gold }}>HQ</span>
        </div>
        <div style={{ width: 32, height: 2, background: C.gold, marginTop: 8 }} />
      </div>

      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map(n => (
          <button
            key={n.id}
            onClick={() => onNav(n.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
              background: active === n.id ? 'rgba(255,198,0,0.08)' : 'transparent',
              border: active === n.id ? `1px solid rgba(255,198,0,0.2)` : '1px solid transparent',
              borderLeft: active === n.id ? `3px solid ${C.gold}` : '3px solid transparent',
              color: active === n.id ? C.gold : C.muted,
              fontSize: 13, fontWeight: active === n.id ? 700 : 500,
              textAlign: 'left', width: '100%', fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 16 }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: `1px solid rgba(255,255,255,0.06)` }}>
        <div style={{ color: C.muted, fontSize: 10, marginBottom: 4, letterSpacing: '0.06em' }}>LOGGED IN AS</div>
        <div style={{ color: '#fff', fontSize: 11, fontWeight: 600, marginBottom: 12, wordBreak: 'break-all' }}>
          {user?.email}
        </div>
        <button
          onClick={onLogout}
          style={{
            width: '100%', padding: '8px 0', borderRadius: 8,
            background: 'transparent', border: `1px solid rgba(255,68,68,0.3)`,
            color: C.red, fontSize: 11, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit', transition: 'all 0.15s',
          }}
        >
          SIGN OUT
        </button>
      </div>
    </div>
  );
}

// ─── ROOT PAGE ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState('dashboard');
  const { toasts, push: toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data } = await supabase
          .from('admin_allowed_emails')
          .select('email')
          .eq('email', session.user.email)
          .single();
        if (data) setUser(session.user);
        else await supabase.auth.signOut();
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setUser(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ color: C.teal, fontSize: 13, fontWeight: 700, letterSpacing: '0.15em' }}>INITIALISING…</div>
      </div>
    );
  }

  if (!user) return <LoginScreen onLogin={setUser} />;

  const SECTIONS = {
    dashboard: <Dashboard />,
    team:      <TeamSection toast={toast} />,
    hero:      <HeroSlides toast={toast} />,
    images:    <SiteImages toast={toast} />,
    sponsors:  <SponsorsSection toast={toast} />,
  };

  return (
    <div style={{ minHeight: '100vh', background: C.navyMid, fontFamily: "'DM Sans', sans-serif", color: '#fff' }}>
      <Sidebar active={section} onNav={setSection} user={user} onLogout={handleLogout} />
      <main style={{ marginLeft: 240, padding: '36px 40px', minHeight: '100vh' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {SECTIONS[section]}
          </motion.div>
        </AnimatePresence>
      </main>
      <Toast toasts={toasts} />
    </div>
  );
}