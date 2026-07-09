"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import supabase from "@/lib/supabase";

const PRESET_AMOUNTS = [
  { value: 300, label: "₹300" },
  { value: 1000, label: "₹1,000" },
  { value: 3000, label: "₹3,000" },
  { value: 5000, label: "₹5,000" },
  { value: 10000, label: "₹10,000" },
];

export default function ContributionModal({ isOpen, onClose, campaignId }) {
  const [step, setStep] = useState("form");
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    isAnonymous: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simulatedPayment, setSimulatedPayment] = useState(null);

  const finalAmount = selectedAmount || parseInt(customAmount) || 0;

  const handlePresetClick = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmount = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleProceedToPayment = () => {
    if (!finalAmount || finalAmount < 10) return;
    if (!formData.name.trim()) return;
    setStep("payment");
  };

  const handleSimulatePayment = async (method) => {
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setSimulatedPayment({
      method,
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      amount: finalAmount,
    });

    setStep("success");

    try {
      const { error } = await supabase.from("donations").insert({
        campaign_id: campaignId,
        merchant_transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        donor_name: formData.isAnonymous ? "Anonymous" : formData.name,
        donor_email: formData.email || null,
        amount_paise: finalAmount * 100,
        message: formData.message || null,
        status: "SUCCESS",
        is_anonymous: formData.isAnonymous,
      });

      if (error) {
        console.error("Error saving donation:", error);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep("form");
    setSelectedAmount(null);
    setCustomAmount("");
    setFormData({ name: "", email: "", phone: "", message: "", isAnonymous: false });
    setSimulatedPayment(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-[#0A0F1A] border border-white/[0.08] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.1] transition-all z-10"
          >
            ✕
          </button>

          {/* Step 1: Donation Form */}
          {step === "form" && (
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-black text-white mb-6">
                Choose a contribution amount
              </h2>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handlePresetClick(preset.value)}
                    className={`py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                      selectedAmount === preset.value
                        ? "bg-[#B6B2A5] text-black shadow-[0_0_20px_rgba(255,198,0,0.3)]"
                        : "bg-white/[0.03] text-white/70 border border-white/[0.08] hover:border-[#B6B2A5]/30 hover:text-white"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}

                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Other"
                    value={customAmount}
                    onChange={handleCustomAmount}
                    className={`w-full py-3 rounded-xl font-bold text-sm text-center transition-all duration-300 ${
                      customAmount
                        ? "bg-[#B6B2A5] text-black shadow-[0_0_20px_rgba(255,198,0,0.3)] border-[#B6B2A5]"
                        : "bg-white/[0.03] text-white/70 border border-white/[0.08] placeholder:text-white/30"
                    }`}
                  />
                  {customAmount && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/60 text-sm">₹</span>
                  )}
                </div>
              </div>

              {finalAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1.5 block">Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Your full name"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:border-[#B6B2A5]/40 focus:outline-none transition-all" />
                  </div>

                  <div>
                    <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1.5 block">Email ID</label>
                    <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="your@email.com"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:border-[#B6B2A5]/40 focus:outline-none transition-all" />
                  </div>

                  <div>
                    <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1.5 block">Mobile Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleFormChange} placeholder="+91 98765 43210"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:border-[#B6B2A5]/40 focus:outline-none transition-all" />
                  </div>

                  <div>
                    <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1.5 block">Message (Optional)</label>
                    <textarea name="message" value={formData.message} onChange={handleFormChange} placeholder="Write a message of support..." rows={2}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:border-[#B6B2A5]/40 focus:outline-none transition-all resize-none" />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input type="checkbox" name="isAnonymous" checked={formData.isAnonymous} onChange={handleFormChange} className="sr-only" />
                      <div className={`w-5 h-5 rounded-md border-2 transition-all duration-300 flex items-center justify-center ${
                        formData.isAnonymous ? "bg-[#B6B2A5] border-[#B6B2A5]" : "bg-white/[0.03] border-white/[0.15] group-hover:border-[#B6B2A5]/30"}`}>
                        {formData.isAnonymous && (
                          <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">Make my contribution anonymous</span>
                  </label>
                </motion.div>
              )}

              {finalAmount > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleProceedToPayment}
                  disabled={!formData.name.trim() || finalAmount < 10}
                  className="w-full mt-6 bg-[#B6B2A5] text-black py-4 rounded-xl font-black text-base uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_8px_30px_rgba(255,198,0,0.4)] transition-all duration-300"
                >
                  Proceed To Contribute ₹{finalAmount.toLocaleString("en-IN")}
                </motion.button>
              )}
            </div>
          )}

          {/* Step 2: Mock Payment */}
          {step === "payment" && (
            <div className="p-6 md:p-8">
              <button onClick={() => setStep("form")} className="text-white/40 hover:text-white text-sm mb-6 flex items-center gap-2 transition-colors">
                ← Back
              </button>

              <h2 className="text-xl font-black text-white mb-2">Complete Payment</h2>
              <p className="text-white/40 text-sm mb-6">
                Amount: <span className="text-[#B6B2A5] font-bold">₹{finalAmount.toLocaleString("en-IN")}</span>
              </p>

              <div className="space-y-3 mb-6">
                {[
                  { id: "upi", label: "UPI", icon: "📱", desc: "Google Pay, PhonePe, Paytm" },
                  { id: "netbanking", label: "Netbanking", icon: "🏦", desc: "All major banks" },
                  { id: "card", label: "Credit / Debit Card", icon: "💳", desc: "Visa, Mastercard, RuPay" },
                ].map((method) => (
                  <button key={method.id} onClick={() => handleSimulatePayment(method.label)} disabled={isSubmitting}
                    className="w-full flex items-center gap-4 bg-white/[0.03] border border-white/[0.08] hover:border-[#B6B2A5]/30 rounded-xl p-4 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed">
                    <span className="text-2xl">{method.icon}</span>
                    <div className="text-left flex-1">
                      <p className="text-white font-bold text-sm group-hover:text-[#B6B2A5] transition-colors">{method.label}</p>
                      <p className="text-white/30 text-[10px]">{method.desc}</p>
                    </div>
                    <span className="text-white/20 group-hover:text-[#B6B2A5] group-hover:translate-x-1 transition-all">→</span>
                  </button>
                ))}
              </div>

              {isSubmitting && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-[#B6B2A5]/30 border-t-[#B6B2A5] rounded-full animate-spin" />
                    <span className="text-white/50 text-sm">Processing payment...</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <div className="p-6 md:p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-20 h-20 bg-[#B6B2A5]/10 border border-[#B6B2A5]/30 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <svg className="w-10 h-10 text-[#B6B2A5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>

              <h2 className="text-2xl font-black text-white mb-2">Thank You!</h2>
              <p className="text-white/50 text-sm mb-2">
                Your contribution of <span className="text-[#B6B2A5] font-bold">₹{finalAmount.toLocaleString("en-IN")}</span> has been received.
              </p>
              {simulatedPayment && (
                <p className="text-white/20 text-[10px] font-mono mb-6">
                  Transaction ID: {simulatedPayment.transactionId}
                </p>
              )}

              <button onClick={handleClose}
                className="w-full bg-[#B6B2A5] text-black py-4 rounded-xl font-black text-sm uppercase tracking-wider hover:shadow-[0_8px_30px_rgba(255,198,0,0.4)] transition-all duration-300">
                Close
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}