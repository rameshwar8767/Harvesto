import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const NewsLetter = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Thank you for subscribing! Your ₹150 discount code is HARVEST150");
    setEmail("");
  };

  return (
    <section className="mt-16 sm:mt-24 mb-6 rounded-2xl md:rounded-3xl bg-slate-900 text-white p-8 sm:p-12 md:p-16 text-center relative overflow-hidden shadow-2xl">
      {/* Background Gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-accent bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 rounded-full mb-4">
          🎁 Special Member Privilege
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
          Never Miss a Fresh Daily Harvest!
        </h2>
        <p className="text-slate-300 text-sm sm:text-base mt-2.5 max-w-lg">
          Subscribe for early-bird organic harvest drops, exclusive weekend grocery coupons, and zero-delivery vouchers.
        </p>

        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full max-w-md gap-2.5 mt-8">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email address"
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-slate-400 text-sm outline-none focus:border-primary focus:bg-white/15 transition-all"
          />
          <button
            type="submit"
            className="px-8 py-3 bg-primary hover:bg-primary-glow text-white font-bold text-sm rounded-full transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-600/30 active:scale-95 shrink-0"
          >
            Claim ₹150 Off
          </button>
        </form>

        <p className="text-xs text-slate-500 mt-3">
          We respect your privacy. Unsubscribe at any time with one click.
        </p>
      </div>
    </section>
  );
};

export default NewsLetter;
