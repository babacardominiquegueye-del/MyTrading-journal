// pages/LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";

const Feature = ({ icon, title, desc }) => (
  <div className="bg-dark-800 border border-dark-600 hover:border-accent-green/30 rounded-xl p-5 transition-colors">
    <span className="text-3xl mb-3 block">{icon}</span>
    <h3 className="text-white font-semibold mb-2">{title}</h3>
    <p className="text-dark-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const Stat = ({ value, label }) => (
  <div className="text-center">
    <p className="text-accent-green text-3xl font-bold font-mono">{value}</p>
    <p className="text-dark-400 text-sm mt-1">{label}</p>
  </div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Nav */}
      <nav className="border-b border-dark-700 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent-green rounded-lg flex items-center justify-center">
            <span className="text-dark-900 font-bold text-sm">TJ</span>
          </div>
          <span className="text-white font-bold text-lg">TradingJournal</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login"
            className="px-4 py-2 text-dark-300 hover:text-white text-sm transition-colors">
            Connexion
          </Link>
          <Link to="/register"
            className="px-4 py-2 bg-accent-green text-dark-900 rounded-lg text-sm font-medium hover:bg-accent-green/80 transition-colors">
            Commencer gratuitement
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-accent-green/10 border border-accent-green/20 rounded-full px-4 py-1.5 text-accent-green text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          Plateforme de trading éducative
        </div>

        <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
          Suivez vos trades.
          <br />
          <span className="text-accent-green">Améliorez vos performances.</span>
        </h1>

        <p className="text-dark-300 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          Un journal de trading complet pour analyser vos résultats, identifier vos patterns,
          et progresser grâce à des statistiques détaillées — inspiré de TradingView.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register"
            className="px-8 py-3 bg-accent-green text-dark-900 rounded-xl font-semibold text-base hover:bg-accent-green/80 transition-colors">
            Créer un compte gratuit
          </Link>
          <Link to="/login"
            className="px-8 py-3 bg-dark-700 border border-dark-500 text-white rounded-xl font-semibold text-base hover:bg-dark-600 transition-colors">
            Voir la démo
          </Link>
        </div>

        {/* Terminal décoratif */}
        <div className="mt-16 bg-dark-800 border border-dark-600 rounded-2xl p-6 text-left max-w-3xl mx-auto shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-accent-red/70" />
            <div className="w-3 h-3 rounded-full bg-accent-gold/70" />
            <div className="w-3 h-3 rounded-full bg-accent-green/70" />
            <span className="text-dark-500 text-xs ml-2">TradingJournal Dashboard</span>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: "Win Rate", value: "67%",    color: "text-accent-green" },
              { label: "PnL Total", value: "+$2,840", color: "text-accent-green" },
              { label: "RR Moyen", value: "2.3R",   color: "text-accent-gold" },
              { label: "Trades",   value: "142",    color: "text-accent-blue" },
            ].map((s) => (
              <div key={s.label} className="bg-dark-700 rounded-lg p-3 border border-dark-600">
                <p className={`font-bold font-mono text-lg ${s.color}`}>{s.value}</p>
                <p className="text-dark-400 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {[
              { pair: "EUR/USD", dir: "BUY",  result: "WIN",  pnl: "+$240" },
              { pair: "BTC/USDT",dir: "SELL", result: "WIN",  pnl: "+$580" },
              { pair: "GBP/USD", dir: "BUY",  result: "LOSS", pnl: "-$120" },
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-between bg-dark-700/50 rounded-lg px-3 py-2 text-xs font-mono">
                <span className="text-white font-medium w-20">{t.pair}</span>
                <span className={`w-10 text-center font-bold ${t.dir === "BUY" ? "text-accent-green" : "text-accent-red"}`}>{t.dir}</span>
                <span className={`w-16 text-center px-2 py-0.5 rounded-full text-xs ${t.result === "WIN" ? "bg-accent-green/10 text-accent-green" : "bg-accent-red/10 text-accent-red"}`}>{t.result}</span>
                <span className={`w-16 text-right font-bold ${t.pnl.startsWith("+") ? "text-accent-green" : "text-accent-red"}`}>{t.pnl}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-dark-700 py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          <Stat value="1,200+"  label="Traders actifs" />
          <Stat value="50k+"    label="Trades analysés" />
          <Stat value="89%"     label="Satisfaction" />
          <Stat value="100%"    label="Open source" />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-white text-3xl font-bold mb-3">Tout ce dont vous avez besoin</h2>
          <p className="text-dark-400 max-w-xl mx-auto">
            Une suite complète d'outils pour devenir un trader plus discipliné et rentable
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Feature icon="📊" title="Journal de Trades"
            desc="Enregistrez chaque trade avec prix d'entrée, SL, TP, émotions, setup et notes. Gardez une trace complète." />
          <Feature icon="📈" title="Analytics Avancées"
            desc="Win rate, courbe d'équité, meilleure paire, jour rentable, analyse des setups — tout en graphiques." />
          <Feature icon="📅" title="Vue Calendrier"
            desc="Visualisez vos trades par date pour identifier les jours et semaines les plus performants." />
          <Feature icon="🏆" title="Leaderboard"
            desc="Compétez avec d'autres traders en temps réel. Classement par PnL, win rate ou nombre de trades." />
          <Feature icon="🏪" title="Marketplace"
            desc="Publiez ou achetez des stratégies de trading. Notez et commentez les stratégies des autres traders." />
          <Feature icon="🧠" title="Analyse Psychologique"
            desc="Trackez vos émotions avant et après chaque trade pour identifier l'impact de la psychologie." />
        </div>
      </section>

      {/* Rôles */}
      <section className="bg-dark-800 border-y border-dark-700 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-white text-2xl font-bold text-center mb-8">Choisissez votre rôle</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { role: "Trader",           icon: "👤", desc: "Journal personnel, analytics de base, notes de trading", color: "border-dark-500" },
              { role: "Premium Trader",   icon: "⭐", desc: "Analytics avancées, leaderboard, statistiques détaillées", color: "border-accent-gold/40" },
              { role: "Strategy Seller",  icon: "💼", desc: "Publiez vos stratégies, recevez des avis et construisez votre réputation", color: "border-accent-blue/40" },
            ].map((r) => (
              <div key={r.role} className={`bg-dark-700 border ${r.color} rounded-xl p-5`}>
                <span className="text-3xl mb-3 block">{r.icon}</span>
                <h3 className="text-white font-semibold mb-2">{r.role}</h3>
                <p className="text-dark-400 text-sm">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="text-white text-3xl font-bold mb-4">Prêt à progresser ?</h2>
        <p className="text-dark-400 mb-8">
          Rejoignez des milliers de traders qui utilisent TradingJournal pour améliorer leurs performances.
        </p>
        <Link to="/register"
          className="px-10 py-4 bg-accent-green text-dark-900 rounded-xl font-bold text-base hover:bg-accent-green/80 transition-colors inline-block">
          Commencer maintenant — Gratuit
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-700 px-6 py-6 text-center">
        <p className="text-dark-500 text-sm">
          © 2024 TradingJournal — Projet éducatif MERN Stack
        </p>
      </footer>
    </div>
  );
}
