"use client";

import { useState, useEffect, useRef } from "react";
import supabase from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

const TOTAL_SEGMENTS = 30;

export default function Crowdfunding() {
  const [stats, setStats] = useState({
    targetGoal: 3000000,
    raised: 0,
    supporters: 0,
    campaignId: null,
  });
  const [prevRaised, setPrevRaised] = useState(null);
  const [isLiveUpdating, setIsLiveUpdating] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [captains, setCaptains] = useState([]);
  const channelRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    number: "",
    email: "",
    message: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    async function fetchCrowdfundingData() {
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("*")
        .eq("is_active", true)
        .single();

      if (campaign) {
        const { data: supportersData } = await supabase
          .from("donations")
          .select("donor_email")
          .eq("campaign_id", campaign.id)
          .eq("status", "SUCCESS");

        let supportersCount = 0;
        if (supportersData) {
          const uniqueEmails = new Set(
            supportersData.map(d => d.donor_email).filter(email => email && email.trim() !== '')
          );
          supportersCount = uniqueEmails.size;
        }

        setStats({
          targetGoal: Math.round(campaign.goal_amount_paise / 100),
          raised: Math.round(campaign.total_raised_paise / 100),
          supporters: supportersCount,
          campaignId: campaign.id,
        });
      }

      const { data: captainsData } = await supabase
        .from("captains")
        .select("*")
        .order("display_order");
      
      if (captainsData) setCaptains(captainsData);
    }

    fetchCrowdfundingData();
  }, []);

  useEffect(() => {
    // Empty deps: subscribe ONCE. The original code had [stats.raised] which
    // caused a re-subscribe on every database update, churning the channel and
    // dropping events. Use functional setState to read the previous value.
    const campaignChannel = supabase
      .channel("campaign-live-updates")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "campaigns" },
        async (payload) => {
          const newData = payload.new;
          setStats(prev => {
            setPrevRaised(prev.raised);
            return {
              ...prev,
              targetGoal:  Math.round(newData.goal_amount_paise / 100),
              raised:      Math.round(newData.total_raised_paise / 100),
            };
          });
          const { data: supportersData } = await supabase.from("donations").select("donor_email").eq("campaign_id", newData.id).eq("status", "SUCCESS");
          let supportersCount = 0;
          if (supportersData) {
            const uniqueEmails = new Set(supportersData.map(d => d.donor_email).filter(email => email && email.trim() !== ''));
            supportersCount = uniqueEmails.size;
          }
          setStats(prev => ({ ...prev, supporters: supportersCount }));
          setIsLiveUpdating(true);
          setTimeout(() => setIsLiveUpdating(false), 2000);
        }
      ).subscribe();

    const donationChannel = supabase
      .channel("donation-live-updates")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "donations", filter: "status=eq.SUCCESS" },
        async (payload) => {
          const newDonation = payload.new;
          const { data: supportersData } = await supabase.from("donations").select("donor_email").eq("campaign_id", newDonation.campaign_id).eq("status", "SUCCESS");
          let supportersCount = 0;
          if (supportersData) {
            const uniqueEmails = new Set(supportersData.map(d => d.donor_email).filter(email => email && email.trim() !== ''));
            supportersCount = uniqueEmails.size;
          }
          setStats(prev => ({ ...prev, supporters: supportersCount }));
        }
      ).subscribe();

    channelRef.current = { campaignChannel, donationChannel };
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current.campaignChannel);
        supabase.removeChannel(channelRef.current.donationChannel);
      }
    };
  }, []);  // Empty deps: subscribe once. Re-subscribing on every raised update would cause channel thrash.

  const percentageRaw = stats.targetGoal > 0 ? (stats.raised / stats.targetGoal) * 100 : 0;
  const PERCENTAGE = Math.min(100, Math.max(0, Math.round(percentageRaw)));
  const ACTIVE_SEGMENTS = Math.round((PERCENTAGE / 100) * TOTAL_SEGMENTS);
  const justAdded = prevRaised ? stats.raised - prevRaised : 0;
  const remaining = stats.targetGoal - stats.raised;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const { error } = await supabase.from('contact_submissions').insert({
        name: formData.name, phone: formData.number, email: formData.email, message: formData.message || null,
      });
      if (error) throw error;
      setFormSubmitted(true);
      setShowContactForm(false);
      setFormData({ name: "", number: "", email: "", message: "" });
      setTimeout(() => setFormSubmitted(false), 4000);
    } catch (err) {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const captain = captains.find(c => c.role?.toLowerCase().includes('captain') && !c.role?.toLowerCase().includes('vice'));
  const viceCaptain = captains.find(c => c.role?.toLowerCase().includes('vice'));

  return (
    <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 md:px-8 max-w-[1440px] mx-auto relative z-10" id="crowdfund">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px] bg-[#42AACC]/5 blur-[100px] sm:blur-[120px] md:blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] bg-[#B6B2A5]/3 blur-[80px] sm:blur-[100px] md:blur-[120px] rounded-full pointer-events-none" />

      <AnimatePresence>
        {isLiveUpdating && (
          <motion.div initial={{ opacity: 0, scale: 0.8, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-20 sm:top-24 right-4 sm:right-6 z-50 flex items-center gap-2 bg-[#42AACC]/20 backdrop-blur-xl border border-[#42AACC]/40 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
            <span className="w-2 h-2 bg-[#42AACC] rounded-full animate-pulse shadow-[0_0_8px_rgba(0,200,224,0.8)]" />
            <span className="text-[#42AACC] text-[8px] sm:text-[10px] font-bold tracking-[0.2em] uppercase">LIVE UPDATE</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {formSubmitted && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#42AACC]/20 backdrop-blur-xl border border-[#42AACC]/40 px-3 sm:px-5 py-2 sm:py-3 rounded-full max-w-[90vw] sm:max-w-none"
          >
            <svg className="w-4 h-4 text-[#42AACC] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-[#42AACC] text-[10px] sm:text-xs font-bold tracking-wider uppercase whitespace-nowrap">
              Thank you! We'll get back to you soon.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative max-w-5xl mx-auto">
        
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="h-[1px] w-8 sm:w-12 md:w-16 bg-gradient-to-r from-transparent to-[#42AACC]/50" />
          <div className="flex items-center gap-2 bg-black border border-[#42AACC]/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
            <span className="w-1.5 h-1.5 bg-[#42AACC] rounded-full shadow-[0_0_8px_rgba(0,200,224,0.8)] animate-pulse" />
            <span className="text-[#42AACC] text-[8px] sm:text-[10px] md:text-xs font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase whitespace-nowrap">Crowdfunding Initiative</span>
          </div>
          <div className="h-[1px] w-8 sm:w-12 md:w-16 bg-gradient-to-l from-transparent to-[#42AACC]/50" />
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white text-center uppercase tracking-tight leading-[1.1] mb-4 sm:mb-6">
          WE ARE ACCEPTING{" "}
          <span className="relative inline-block"><span className="text-[#42AACC] italic drop-shadow-[0_0_25px_rgba(0,200,224,0.5)]">CROWDFUNDING</span></span>
        </motion.h2>

        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-sm sm:text-base md:text-lg text-[#F0EAD6] text-center max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-12 px-2">
  Our journey to the podium isn&apos;t just about engineering—it&apos;s about the community that fuels our ambition.
</motion.p> 

        {/* Stats Cards */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
          <div className="bg-black border border-white/[0.08] rounded-2xl p-4 sm:p-5 md:p-6 text-center hover:border-[#42AACC]/20 transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <p className="text-[9px] sm:text-[10px] md:text-xs text-[#42AACC]/60 uppercase tracking-[0.2em] font-bold mb-2 sm:mb-3">Target Goal</p>
            <p className="text-base sm:text-lg md:text-2xl font-black text-[#42AACC] break-words">{formatCurrency(stats.targetGoal)}</p>
          </div>

          <div className="bg-black border border-[#B6B2A5]/20 rounded-2xl p-4 sm:p-5 md:p-6 text-center relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <AnimatePresence>
              {isLiveUpdating && <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0] }} transition={{ duration: 1.5 }} className="absolute inset-0 bg-[#B6B2A5]/10" />}
            </AnimatePresence>
            <p className="text-[9px] sm:text-[10px] md:text-xs text-[#B6B2A5]/60 uppercase tracking-[0.2em] font-bold mb-2 sm:mb-3 relative z-10">Raised</p>
            <AnimatePresence mode="wait">
              <motion.p key={stats.raised} initial={{ scale: 1.2, y: -10 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="text-base sm:text-lg md:text-3xl font-black text-[#B6B2A5] drop-shadow-[0_0_20px_rgba(255,198,0,0.3)] relative z-10 break-words">{formatCurrency(stats.raised)}</motion.p>
            </AnimatePresence>
            <AnimatePresence>
              {isLiveUpdating && justAdded > 0 && <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[8px] sm:text-[10px] text-[#42AACC] font-bold mt-1 relative z-10">+{formatCurrency(justAdded)} just now!</motion.p>}
            </AnimatePresence>
          </div>

          <div className="bg-black border border-white/[0.08] rounded-2xl p-4 sm:p-5 md:p-6 text-center hover:border-[#42AACC]/20 transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <p className="text-[9px] sm:text-[10px] md:text-xs text-[#42AACC]/60 uppercase tracking-[0.2em] font-bold mb-2 sm:mb-3">Supporters</p>
            <AnimatePresence mode="wait">
              <motion.p key={stats.supporters} initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="text-base sm:text-lg md:text-2xl font-black text-[#42AACC] break-words">{stats.supporters}</motion.p>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="bg-black border border-white/[0.08] rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-end justify-between mb-4 sm:mb-6">
            <div>
              <p className="text-[9px] sm:text-[10px] text-[#42AACC]/60 uppercase tracking-[0.2em] font-bold mb-1 sm:mb-2">Progress</p>
              <div className="flex items-baseline gap-1">
                <AnimatePresence mode="wait"><motion.span key={PERCENTAGE} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="text-3xl sm:text-4xl md:text-5xl font-black text-[#42AACC]">{PERCENTAGE}</motion.span></AnimatePresence>
                <span className="text-lg sm:text-xl text-[#42AACC]/40">%</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] sm:text-[10px] text-[#42AACC]/60 uppercase tracking-[0.2em] font-bold mb-1 sm:mb-2">Remaining</p>
              <p className="text-xs sm:text-sm md:text-base font-bold text-[#42AACC]/60 break-words">{formatCurrency(remaining)}</p>
            </div>
          </div>
          <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
            {Array.from({ length: TOTAL_SEGMENTS }, (_, i) => (
              <motion.div key={i} className={`h-6 sm:h-8 md:h-10 flex-1 rounded-sm transition-all duration-500 ${i < ACTIVE_SEGMENTS ? "bg-gradient-to-b from-[#42AACC] to-[#42AACC]/60 shadow-[0_0_10px_rgba(0,200,224,0.4)]" : "bg-white/[0.04]"}`} />
            ))}
          </div>
          <div className="flex justify-between text-[8px] sm:text-[10px] text-[#42AACC]/40 font-mono uppercase tracking-wider"><span>0%</span><span>50%</span><span>100%</span></div>
        </motion.div>

        {/* Contact Us */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="text-center">
          {!showContactForm ? (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowContactForm(true)} className="group relative inline-flex items-center gap-2 sm:gap-3 bg-[#42AACC] text-black px-6 sm:px-8 md:px-10 py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg md:text-xl uppercase tracking-wider overflow-hidden shadow-[0_8px_30px_rgba(0,200,224,0.3)] hover:shadow-[0_12px_40px_rgba(0,200,224,0.5)] transition-all duration-300 w-full sm:w-auto">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                CONTACT US
              </span>
            </motion.button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black border border-white/[0.08] rounded-2xl overflow-hidden max-w-4xl mx-auto shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <div className="flex flex-col md:grid md:grid-cols-5">
                <div className="md:col-span-3 p-6 sm:p-8 md:p-10 order-2 md:order-1">
                  <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">Get In Touch</h3>
                    <button onClick={() => { setShowContactForm(false); setSubmitError(null); }} className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.1] transition-all flex-shrink-0">✕</button>
                  </div>
                  <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-5">
                    <div><label className="text-[10px] sm:text-[11px] text-[#42AACC] uppercase tracking-[0.2em] font-bold mb-1.5 sm:mb-2 block text-left">NAME *</label><input type="text" name="name" value={formData.name} onChange={handleFormChange} required placeholder="Your full name" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-white text-sm sm:text-base placeholder:text-white/20 focus:border-[#42AACC]/40 focus:outline-none transition-all" /></div>
                    <div><label className="text-[10px] sm:text-[11px] text-[#42AACC] uppercase tracking-[0.2em] font-bold mb-1.5 sm:mb-2 block text-left">PHONE NUMBER *</label><input type="tel" name="number" value={formData.number} onChange={handleFormChange} required placeholder="+91 98765 43210" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-white text-sm sm:text-base placeholder:text-white/20 focus:border-[#42AACC]/40 focus:outline-none transition-all" /></div>
                    <div><label className="text-[10px] sm:text-[11px] text-[#42AACC] uppercase tracking-[0.2em] font-bold mb-1.5 sm:mb-2 block text-left">EMAIL *</label><input type="email" name="email" value={formData.email} onChange={handleFormChange} required placeholder="your@email.com" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-white text-sm sm:text-base placeholder:text-white/20 focus:border-[#42AACC]/40 focus:outline-none transition-all" /></div>
                    <div><label className="text-[10px] sm:text-[11px] text-[#42AACC] uppercase tracking-[0.2em] font-bold mb-1.5 sm:mb-2 block text-left">MESSAGE</label><textarea name="message" value={formData.message} onChange={handleFormChange} rows={3} placeholder="Tell us about your interest..." className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-white text-sm sm:text-base placeholder:text-white/20 focus:border-[#42AACC]/40 focus:outline-none transition-all resize-none" /></div>
                    {submitError && <p className="text-red-400 text-xs text-left">{submitError}</p>}
                    <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-[#42AACC] text-black py-3.5 sm:py-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider hover:shadow-[0_8px_30px_rgba(0,200,224,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isSubmitting ? (<span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>SUBMITTING...</span>) : 'SUBMIT'}
                    </motion.button>
                  </form>
                </div>
                <div className="md:col-span-2 bg-white/[0.02] border-b md:border-b-0 md:border-l border-white/[0.06] p-6 sm:p-8 md:p-10 flex flex-col justify-center order-1 md:order-2">
                  <p className="text-[10px] sm:text-[11px] text-[#B6B2A5] uppercase tracking-[0.2em] font-bold mb-6 sm:mb-8 text-center">Team Leadership</p>
                  <div className="space-y-6 sm:space-y-8">
                    {captain && (
                      <div className="text-center">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#B6B2A5]/10 border border-[#B6B2A5]/20 flex items-center justify-center mx-auto mb-2 sm:mb-3"><span className="text-[#B6B2A5] text-lg sm:text-xl font-black">{captain.name?.charAt(0) || 'C'}</span></div>
                        <p className="text-white font-bold text-xs sm:text-sm">{captain.name || 'TBA'}</p>
                        <p className="text-[#B6B2A5]/60 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mt-1">{captain.role || 'Team Captain'}</p>
                        {captain.number && <p className="text-[#42AACC]/60 text-[10px] sm:text-xs font-medium mt-1.5 sm:mt-2 break-words">{captain.number}</p>}
                      </div>
                    )}
                    {captain && viceCaptain && <div className="h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />}
                    {viceCaptain && (
                      <div className="text-center">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#42AACC]/10 border border-[#42AACC]/20 flex items-center justify-center mx-auto mb-2 sm:mb-3"><span className="text-[#42AACC] text-lg sm:text-xl font-black">{viceCaptain.name?.charAt(0) || 'V'}</span></div>
                        <p className="text-white font-bold text-xs sm:text-sm">{viceCaptain.name || 'TBA'}</p>
                        <p className="text-[#42AACC]/60 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mt-1">{viceCaptain.role || 'Vice Captain'}</p>
                        {viceCaptain.number && <p className="text-[#42AACC]/60 text-[10px] sm:text-xs font-medium mt-1.5 sm:mt-2 break-words">{viceCaptain.number}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}