'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import supabase from '@/lib/supabase';

export const TEAL    = '#42AACC';
export const NAVY    = '#0D1A3A';
export const NAVY_EL = '#1E3A6E';
export const YELLOW  = '#D9B24C'; // muted gold instead of neon #B6B2A5

const PLACEHOLDER_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' style='stop-color:%231E3A6E'/><stop offset='100%25' style='stop-color:%230D1A3A'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g)'/><circle cx='50' cy='38' r='18' fill='%23FFFFFF18'/><ellipse cx='50' cy='82' rx='28' ry='20' fill='%23FFFFFF10'/></svg>`;

export function getInitials(name = '') {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ------------------------------------------------------------------
// MENTOR CARD
// ------------------------------------------------------------------
function MentorCard({ mentor }) {
  return (
    <div
      className="group relative flex-shrink-0 w-[150px] h-[225px] md:w-[235px] md:h-[340px] rounded-xl overflow-hidden flex flex-col
        border border-[#D9B24C]/15
        bg-black
        shadow-[0_4px_18px_rgba(0,0,0,0.5)]
        transition-all duration-200 ease-out
        active:scale-[0.96] active:brightness-90
        md:hover:-translate-y-1.5 md:hover:shadow-[0_6px_22px_rgba(0,0,0,0.55)]
        md:hover:border-[#D9B24C]/30
        cursor-default select-none mx-auto touch-manipulation"
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D9B24C]/25 to-transparent z-10 pointer-events-none" />

      <div className="relative w-full h-[145px] md:h-[225px] overflow-hidden bg-black/60 flex-shrink-0">
        <img
          src={mentor.photo_url || PLACEHOLDER_SVG}
          alt={mentor.name}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-active:scale-105 md:group-hover:scale-105"
          loading="lazy"
          onError={e => { e.currentTarget.src = PLACEHOLDER_SVG; }}
        />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

        <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#D9B24C] text-black px-1.5 py-[2px] md:px-2 md:py-[3px] rounded-md text-[8px] md:text-[9px] font-black tracking-widest uppercase z-10">
          <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor">
            <polygon points="5,0 6.5,3.5 10,4 7.5,6.5 8.5,10 5,8 1.5,10 2.5,6.5 0,4 3.5,3.5"/>
          </svg>
          MENTOR
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-2 py-2 md:px-4 md:py-3 text-center">
        <p className="text-[12px] md:text-[16px] font-bold text-white leading-tight break-words" title={mentor.name}>
          {mentor.name || 'TBA'}
        </p>
        {mentor.role && (
          <p className="text-[9px] md:text-[11px] text-[#D9B24C]/75 font-medium mt-1 leading-snug break-words" title={mentor.role}>
            {mentor.role}
          </p>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// CAPTAIN CARD
// ------------------------------------------------------------------
function CaptainCard({ captain }) {
  return (
    <div
      className="group relative flex-shrink-0 w-[135px] h-[200px] md:w-[200px] md:h-[290px] rounded-xl overflow-hidden flex flex-col
        border border-[#D9B24C]/15
        bg-black
        shadow-[0_4px_18px_rgba(0,0,0,0.5)]
        transition-all duration-200 ease-out
        active:scale-[0.96] active:brightness-90
        md:hover:-translate-y-1.5 md:hover:shadow-[0_6px_22px_rgba(0,0,0,0.55)]
        md:hover:border-[#D9B24C]/30
        cursor-default select-none mx-auto touch-manipulation"
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D9B24C]/25 to-transparent z-10 pointer-events-none" />

      <div className="relative w-full h-[125px] md:h-[190px] overflow-hidden bg-black/60 flex-shrink-0">
        <img
          src={captain.photo_url || PLACEHOLDER_SVG}
          alt={captain.name}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-active:scale-105 md:group-hover:scale-105"
          loading="lazy"
          onError={e => { e.currentTarget.src = PLACEHOLDER_SVG; }}
        />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

        <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#D9B24C] text-black px-1.5 py-[2px] md:px-2 md:py-[3px] rounded-md text-[7px] md:text-[8px] font-black tracking-widest uppercase z-10">
          <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor">
            <polygon points="5,0 6.5,3.5 10,4 7.5,6.5 8.5,10 5,8 1.5,10 2.5,6.5 0,4 3.5,3.5"/>
          </svg>
          {captain.role || 'LEADERSHIP'}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-2 py-2 md:px-4 md:py-3 text-center">
        <p className="text-[11px] md:text-[15px] font-bold text-white leading-tight break-words" title={captain.name}>
          {captain.name || 'TBA'}
        </p>
        {captain.role && (
          <p className="text-[8px] md:text-[10px] text-[#D9B24C]/75 font-medium mt-1 leading-snug break-words" title={captain.role}>
            {captain.role}
          </p>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// MEMBER CARD
// ------------------------------------------------------------------
function MemberCard({ member, isLead = false, sticky = false }) {
  const cardH    = isLead ? 'h-[165px] md:h-[235px]' : 'h-[150px] md:h-[210px]';
  const cardW    = isLead ? 'w-[115px] md:w-[165px]' : 'w-[105px] md:w-[148px]';
  const imgH     = isLead ? 'h-[110px] md:h-[160px]' : 'h-[100px] md:h-[142px]';
  const nameSize = isLead ? 'text-[10px] md:text-[13px]' : 'text-[9px] md:text-[11px]';

  return (
    <div
      className={`
        group relative flex-shrink-0 ${cardW} ${cardH} rounded-xl overflow-hidden flex flex-col
        border border-white/[0.10]
        bg-black
        shadow-[0_4px_18px_rgba(0,0,0,0.5)]
        transition-all duration-200 ease-out
        active:scale-[0.96] active:brightness-90
        md:hover:-translate-y-1.5 md:hover:shadow-[0_6px_20px_rgba(0,0,0,0.5)]
        md:hover:border-[#D9B24C]/25
        cursor-default select-none touch-manipulation
        ${isLead ? 'ring-1 ring-[#D9B24C]/20 shadow-[0_4px_18px_rgba(0,0,0,0.5)]' : ''}
        ${sticky ? 'shadow-[6px_0_16px_rgba(0,0,0,0.6)]' : ''}
      `}
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent z-10 pointer-events-none" />

      <div className={`relative w-full ${imgH} overflow-hidden bg-black/60 flex-shrink-0`}>
        <img
          src={member.photoUrl || PLACEHOLDER_SVG}
          alt={member.name}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-active:scale-105 md:group-hover:scale-105"
          loading="lazy"
          onError={e => { e.currentTarget.src = PLACEHOLDER_SVG; }}
        />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

        {isLead && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#D9B24C] text-black px-1.5 py-[2px] md:px-2 md:py-[3px] rounded-md text-[7px] md:text-[8px] font-black tracking-widest uppercase z-10">
            <svg width="7" height="7" viewBox="0 0 10 10" fill="currentColor">
              <polygon points="5,0 6.5,3.5 10,4 7.5,6.5 8.5,10 5,8 1.5,10 2.5,6.5 0,4 3.5,3.5"/>
            </svg>
            LEAD
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center px-2 py-1.5 md:px-3 md:py-2">
        <p className={`${nameSize} font-bold text-white leading-tight break-words`} title={member.name}>
          {member.name || 'TBA'}
        </p>
        {isLead && member.role && (
          <p className="text-[8px] font-medium mt-0.5 break-words text-[#D9B24C]/65" title={member.role}>
            {member.role}
          </p>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// DOMAIN ROW
// ------------------------------------------------------------------
// A domain row is rendered in one of two modes:
//  - "compact": the domain only has a lead (no extra members). Two compact
//    domains get placed side-by-side in a grid by the parent component.
//  - "full": normal horizontally-scrolling row. When there are enough
//    members to need scrolling, the lead card is pinned (sticky) to the
//    left edge of the scroll container so it never gets scrolled out of
//    view while browsing the rest of the team.
const STICKY_THRESHOLD = 5; // lead + members count at/above which we pin the lead

function DomainRow({ domain, compact = false }) {
  const scrollRef = useRef(null);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const totalMembers = 1 + domain.members.length;
  const isSticky = !compact && totalMembers >= STICKY_THRESHOLD;

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    if (compact) return; // no scrolling to track in compact mode
    const el = scrollRef.current;
    if (!el) return;

    // rAF-throttle: with 10+ DomainRow instances, firing setState on every
    // scroll event causes redundant re-renders. Coalesce into one rAF tick.
    let frame = 0;
    const scheduleUpdate = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        updateArrows();
      });
    };

    updateArrows();
    el.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [domain.id, compact]);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  // ---- COMPACT LAYOUT (single-member domains, paired two-per-row) ----
  if (compact) {
    return (
      <div className="relative">
        <div className="flex flex-col items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full flex-shrink-0 bg-[#D9B24C]" />
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">{domain.icon}</span>
              <span className="text-xs font-black tracking-[0.18em] uppercase text-[#D9B24C]">{domain.name}</span>
            </div>
          </div>
          <span className="text-[10px] text-white/25 font-bold tracking-widest uppercase mt-2">1 Member</span>
        </div>

        <div className="flex justify-center">
          <MemberCard member={domain.lead} isLead={true} />
        </div>

        <div className="mt-6 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>
    );
  }

  // ---- FULL-WIDTH SCROLLING LAYOUT ----
  return (
    <div className="relative">
      <div className="flex flex-col items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full flex-shrink-0 bg-[#D9B24C]" />
          <div className="flex items-center gap-2">
            <span className="text-base leading-none">{domain.icon}</span>
            <span className="text-xs font-black tracking-[0.18em] uppercase text-[#D9B24C]">{domain.name}</span>
          </div>
          <div className="hidden sm:block h-[1px] w-20 bg-gradient-to-r from-[#D9B24C]/30 to-transparent" />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] text-white/25 font-bold tracking-widest uppercase">
            {totalMembers} {totalMembers === 1 ? 'Member' : 'Members'}
          </span>
          <button
            onClick={() => scroll(-1)}
            disabled={!canScrollLeft}
            className="w-7 h-7 rounded-lg border border-white/[0.08] bg-white/[0.04] flex items-center justify-center text-white/40 disabled:opacity-20 transition-all duration-150 active:scale-90 md:hover:enabled:bg-white/[0.10] md:hover:enabled:text-white md:hover:enabled:border-white/20 touch-manipulation"
            aria-label="Scroll left"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="8,2 4,6 8,10"/></svg>
          </button>
          <button
            onClick={() => scroll(1)}
            disabled={!canScrollRight}
            className="w-7 h-7 rounded-lg border border-white/[0.08] bg-white/[0.04] flex items-center justify-center text-white/40 disabled:opacity-20 transition-all duration-150 active:scale-90 md:hover:enabled:bg-white/[0.10] md:hover:enabled:text-white md:hover:enabled:border-white/20 touch-manipulation"
            aria-label="Scroll right"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="4,2 8,6 4,10"/></svg>
          </button>
        </div>
        {isSticky && (
          <span className="text-[9px] text-white/15 font-medium mt-1 tracking-wide">Lead stays pinned while you scroll →</span>
        )}
      </div>

      <div className="relative">
        {canScrollLeft && (
          <div
            className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none rounded-l-xl"
            style={{ left: isSticky ? '115px' : 0 }}
          />
        )}
        {canScrollRight && <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none rounded-r-xl" />}

        <div
          ref={scrollRef}
          className="no-scrollbar flex justify-start md:justify-center gap-2.5 md:gap-3 overflow-x-auto pb-2"
          style={{ scrollSnapType: 'x proximity', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Lead card — pinned to the left edge of the scroll container when
              the team is big enough that scrolling would otherwise hide it. */}
          <div
            style={{ scrollSnapAlign: 'start' }}
            className={`flex-shrink-0 w-[115px] md:w-[165px] ${isSticky ? 'sticky left-0 z-20 bg-black' : ''}`}
          >
            <MemberCard member={domain.lead} isLead={true} sticky={isSticky} />
          </div>

          <div className="flex-shrink-0 self-stretch flex items-center">
            <div className="w-[1px] h-3/4 rounded-full bg-gradient-to-b from-transparent via-[#D9B24C]/30 to-transparent" />
          </div>

          {domain.members.map((m, i) => (
            <div key={i} style={{ scrollSnapAlign: 'start' }} className="flex-shrink-0">
              <MemberCard member={m} />
            </div>
          ))}

          <div className="flex-shrink-0 w-4" />
        </div>
      </div>

      <div className="mt-6 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  );
}

// ------------------------------------------------------------------
// MAIN TEAM SECTION
// ------------------------------------------------------------------
export default function Team() {
  const [domains, setDomains] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [captains, setCaptains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeamData() {
      if (!supabase) {
        console.error('Supabase client not initialized — missing env vars.');
        setLoading(false);
        return;
      }

      try {
        const [domainsRes, leadsRes, membersRes, mentorsRes, captainsRes] = await Promise.all([
          supabase.from('domains').select('*').order('display_order'),
          supabase.from('team_leads').select('*'),
          supabase.from('members').select('*'),
          supabase.from('mentors').select('*').order('display_order'),
          supabase.from('captains').select('*').order('display_order'),
        ]);

        const rawDomains  = domainsRes.data  || [];
        const rawLeads    = leadsRes.data    || [];
        const rawMembers  = membersRes.data  || [];
        const rawMentors  = mentorsRes.data  || [];
        const rawCaptains = captainsRes.data || [];

        if (rawMentors) setMentors(rawMentors);
        if (rawCaptains) setCaptains(rawCaptains);

        const formatted = rawDomains.map(domain => {
          const lead    = rawLeads.find(l => l.domain_id === domain.id) || {};
          const members = rawMembers.filter(m => m.domain_id === domain.id);
          return {
            id:   domain.id,
            name: domain.name        || 'UNKNOWN',
            icon: domain.icon        || '⚙️',
            desc: domain.description || '',
            lead: {
              name:     lead.name       || 'TBA',
              role:     lead.role_title || 'Lead',
              photoUrl: lead.photo_url  || null,
            },
            members: members.map(m => ({
              name:     m.NAME || m.name || '',
              photoUrl: m.photo_url || null,
            })),
          };
        });

        // Alphabetical order by domain name, dropping empty/unpopulated domains.
        const sorted = formatted
          .filter(d => d.members.length > 0 || d.lead.name !== 'TBA')
          .sort((a, b) => a.name.localeCompare(b.name));

        setDomains(sorted);
      } catch (err) {
        console.error('Error fetching team data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeamData();
  }, []);

  // Group consecutive single-member domains (lead only, no extra members)
  // into pairs so they share one row instead of each wasting a full-width row.
  const groupedRows = [];
  {
    let buffer = null;
    domains.forEach(domain => {
      const isSingle = domain.members.length === 0;
      if (isSingle) {
        if (buffer) {
          groupedRows.push({ type: 'pair', domains: [buffer, domain] });
          buffer = null;
        } else {
          buffer = domain;
        }
      } else {
        if (buffer) {
          groupedRows.push({ type: 'single', domain: buffer });
          buffer = null;
        }
        groupedRows.push({ type: 'single', domain });
      }
    });
    if (buffer) groupedRows.push({ type: 'single', domain: buffer });
  }

  return (
    <section className="relative py-20 md:py-28 px-6 md:px-10 max-w-[1440px] mx-auto overflow-hidden" id="team">
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>

      <div className="pointer-events-none select-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 right-0 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(217,178,76,0.04) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 -left-20 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(217,178,76,0.03) 0%, transparent 70%)' }} />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 18 }).map((_, i) => (
            <line key={i} x1={`${-10 + i * 7}%`} y1="0%" x2={`${10 + i * 7}%`} y2="100%" stroke="#D9B24C" strokeWidth="1" />
          ))}
        </svg>
      </div>

      <div className="relative mb-14">
        <span className="text-[#D9B24C] text-[10px] font-black tracking-[0.25em] uppercase block mb-3">The Human Element</span>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <Link href="/team" className="group inline-block">
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase leading-none tracking-tight group-hover:text-[#D9B24C] transition-colors duration-200">
              MEET THE{' '}
              <span className="italic" style={{ color: YELLOW }}>TEAM</span>
            </h2>
          </Link>
          {!loading && domains.length > 0 && (
            <div className="flex items-center gap-2 bg-black border border-white/[0.08] rounded-full px-4 py-2 self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D9B24C]" />
              <span className="text-[11px] font-bold text-white/50 tracking-widest uppercase">{domains.length} Domains</span>
            </div>
          )}
        </div>
        <div className="mt-5 flex items-center gap-3">
          <div className="h-[2px] w-16 bg-[#D9B24C] rounded-full" />
          <div className="h-[1px] flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
        </div>
      </div>

      {loading && (
        <div className="flex flex-col gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-3 w-32 bg-white/[0.06] rounded mb-4" />
              <div className="flex gap-3">
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="w-[105px] h-[150px] md:w-[142px] md:h-[200px] bg-black border border-white/[0.06] rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mentors Row */}
      {!loading && mentors.length > 0 && (
        <div className="relative z-10 mb-10">
          <div className="flex flex-col items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full flex-shrink-0 bg-[#D9B24C]" />
              <span className="text-xs font-black tracking-[0.18em] uppercase text-[#D9B24C]">Our Mentors</span>
              <div className="hidden sm:block h-[1px] w-20 bg-gradient-to-r from-[#D9B24C]/30 to-transparent" />
            </div>
          </div>

          <div className="flex justify-center gap-3 md:gap-5 overflow-x-auto pb-2 no-scrollbar">
            {mentors.map((mentor) => (
              <div key={mentor.id} className="flex-shrink-0">
                <MentorCard mentor={mentor} />
              </div>
            ))}
            <div className="flex-shrink-0 w-4" />
          </div>

          <div className="mt-8 h-[1px] bg-gradient-to-r from-[#D9B24C]/15 via-white/[0.06] to-transparent" />
        </div>
      )}

      {/* Captains Row */}
      {!loading && captains.length > 0 && (
        <div className="relative z-10 mb-10">
          <div className="flex flex-col items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full flex-shrink-0 bg-[#D9B24C]" />
              <span className="text-xs font-black tracking-[0.18em] uppercase text-[#D9B24C]">Team Leadership</span>
              <div className="hidden sm:block h-[1px] w-20 bg-gradient-to-r from-[#D9B24C]/30 to-transparent" />
            </div>
          </div>

          <div className="flex justify-center gap-3 md:gap-5 overflow-x-auto pb-2 no-scrollbar">
            {captains.map((captain) => (
              <div key={captain.id} className="flex-shrink-0">
                <CaptainCard captain={captain} />
              </div>
            ))}
            <div className="flex-shrink-0 w-4" />
          </div>

          <div className="mt-8 h-[1px] bg-gradient-to-r from-[#D9B24C]/15 via-white/[0.06] to-transparent" />
        </div>
      )}

      {/* Domain Rows */}
      {!loading && (
        <div className="relative z-10 flex flex-col gap-12">
          {groupedRows.map((row, i) =>
            row.type === 'pair' ? (
              <div key={`pair-${i}`} className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-6">
                <DomainRow domain={row.domains[0]} compact />
                <DomainRow domain={row.domains[1]} compact />
              </div>
            ) : (
              <DomainRow key={row.domain.id} domain={row.domain} />
            )
          )}
          {domains.length === 0 && (
            <p className="text-white/20 text-sm font-medium tracking-wide">No team data available yet.</p>
          )}
        </div>
      )}
    </section>
  );
}