import { motion } from 'motion/react';
import {
  ArrowRight,
  Sparkles,
  Zap,
  Globe,
  Cpu,
  Camera,
  Instagram,
  Facebook,
  MessageCircle,
  Mail,
  LayoutGrid,
  FileText,
  Volume2,
  Grid3X3,
} from 'lucide-react';
import type { Tool } from '../../types';
import { t } from '../../utils/i18n';

interface HomeProps {
  onNavigate: (tool: Tool) => void;
}

const SOCIAL_LINKS = [
  {
    icon: Instagram,
    href: 'https://www.instagram.com/abdallaessaa/',
    label: 'Instagram',
  },
  {
    icon: Facebook,
    href: 'https://www.facebook.com/AbdallaEissaDesigns/',
    label: 'Facebook',
  },
  {
    icon: MessageCircle,
    href: 'https://wa.me/201065479474',
    label: 'WhatsApp',
  },
  {
    icon: Mail,
    href: 'mailto:abdallaahmedessa@gmail.com',
    label: 'Email',
  },
];

const FEATURES: Array<{
  id: Tool;
  icon: any;
  title: string;
  titleAr: string;
  desc: string;
  descAr: string;
  color: string;
}> = [
  {
    id: 'brand-dna',
    icon: Sparkles,
    title: 'Brand DNA Analyzer',
    titleAr: 'محلل هوية العلامة',
    desc: 'Upload a product photo and get instant brand analysis + multiple ad ideas with ready-to-use storyboard prompts.',
    descAr: 'ارفع صورة المنتج واحصل على تحليل فوري للعلامة التجارية + أفكار إعلانية متعددة مع موجهات لوحة قصة جاهزة.',
    color: 'from-indigo-500 to-violet-600',
  },
  {
    id: 'storyboard',
    icon: LayoutGrid,
    title: 'Storyboard Generator',
    titleAr: 'منشئ لوحة القصة',
    desc: 'Generate cinematic 3×3 grid storyboards in 40+ visual styles. Perfect for Nano Banana Pro, GPT-Image, Imagen 4.',
    descAr: 'أنشئ لوحات قصصية سينمائية 3×3 في أكثر من 40 نمطًا بصريًا.',
    color: 'from-fuchsia-500 to-pink-600',
  },
  {
    id: 'ad-script',
    icon: FileText,
    title: 'Ad Script Writer',
    titleAr: 'كاتب نص الإعلان',
    desc: 'Professional voiceover scripts in any language. Multiple tones: promotional, storytelling, UGC, informational.',
    descAr: 'نصوص إعلانية احترافية بأي لغة وبنبرات متعددة.',
    color: 'from-emerald-500 to-cyan-600',
  },
  {
    id: 'sound-effects',
    icon: Volume2,
    title: 'Sound FX Designer',
    titleAr: 'مصمم المؤثرات الصوتية',
    desc: 'AI-powered sound effect suggestions matched to your visual mood and action.',
    descAr: 'اقتراحات مؤثرات صوتية بالذكاء الاصطناعي مطابقة لمزاج المشهد.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'extractor',
    icon: Grid3X3,
    title: 'Frame Extractor',
    titleAr: 'مستخرج الإطارات',
    desc: 'Extract individual high-resolution frames from your generated grids with optimized prompts.',
    descAr: 'استخرج إطارات فردية بدقة عالية من الشبكات المولدة.',
    color: 'from-blue-500 to-indigo-600',
  },
];

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className="min-h-full flex flex-col">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.15),transparent_60%)]" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-fuchsia-500/10 blur-[120px] rounded-full" />

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="space-y-10"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-[0.3em]"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                {t('Pro v2.0 · Multi-Model AI', 'بروفي ٢.٠ · ذكاء متعدد')}
              </motion.div>

              <h1 className="text-7xl md:text-8xl lg:text-[8.5rem] font-black tracking-tighter leading-[0.85] select-none">
                <span className="text-[var(--text-primary)]">Abdalla</span>
                <br />
                <span className="text-gradient-accent serif italic">Eissa</span>
              </h1>

              <p className="text-xl text-[var(--text-secondary)] max-w-xl leading-relaxed font-light">
                {t(
                  'Professional AI Ad Creator Studio. Multi-model intelligence with Gemini, Claude, and GPT — built for creators, marketers, and brand designers.',
                  'استوديو احترافي لإنشاء الإعلانات بالذكاء الاصطناعي. ذكاء متعدد النماذج مع Gemini و Claude و GPT.'
                )}
              </p>

              {/* Quick model badges */}
              <div className="flex flex-wrap gap-2">
                {['Claude Opus 4.7', 'Sonnet 4.6', 'Gemini 2.5 Pro', 'GPT-5'].map(
                  (m) => (
                    <span
                      key={m}
                      className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[var(--text-secondary)]"
                    >
                      {m}
                    </span>
                  )
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate('brand-dna')}
                  className="px-10 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-2xl font-bold text-base transition-all flex items-center gap-3 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 group"
                >
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  {t('Analyze My Product', 'حلل منتجي')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <button
                  onClick={() => onNavigate('storyboard')}
                  className="px-8 py-4 bg-white/5 border border-white/10 text-[var(--text-primary)] rounded-2xl font-bold text-base transition-all flex items-center gap-3 hover:bg-white/10"
                >
                  {t('Storyboard Tool', 'أداة لوحة القصة')}
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 pt-2">
                {SOCIAL_LINKS.map((s, i) => (
                  <motion.a
                    key={i}
                    whileHover={{ y: -3 }}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-[var(--text-secondary)] flex items-center justify-center hover:bg-white/10 hover:text-[var(--text-primary)] transition-all"
                    title={s.label}
                  >
                    <s.icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Hero Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="hidden lg:block relative"
            >
              <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-white/10 p-12 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.3),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(217,70,239,0.2),transparent_60%)]" />

                <div className="relative h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
                        <Cpu className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                          {t('System Status', 'حالة النظام')}
                        </div>
                        <div className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          OPERATIONAL
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <StatRow label="MODELS" value="10+" />
                      <StatRow label="VISUAL STYLES" value="40+" />
                      <StatRow label="LANGUAGES" value="EN · AR · +" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                      {t('Engine Performance', 'أداء المحرك')}
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '92%' }}
                        transition={{ duration: 2, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
                      />
                    </div>
                    <div className="text-xs text-[var(--text-muted)] font-mono">
                      AI_AD_CREATOR_PRO_v2.0
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">
              <Zap className="w-3 h-3" />
              {t('Built-in Tools', 'الأدوات المدمجة')}
            </div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter">
              {t('Everything you need.', 'كل ما تحتاجه.')}
              <br />
              <span className="text-gradient-accent">
                {t('In one place.', 'في مكان واحد.')}
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.button
                key={f.id}
                onClick={() => onNavigate(f.id)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="group p-7 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-left hover:border-[var(--border-strong)] hover:shadow-2xl hover:shadow-indigo-500/5 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg`}
                >
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 tracking-tight">
                  {t(f.title, f.titleAr)}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {t(f.desc, f.descAr)}
                </p>
                <div className="mt-5 flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
                  {t('Open', 'افتح')}
                  <ArrowRight className="w-3 h-3" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + Footer */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-12 md:p-16 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="relative space-y-6 max-w-2xl">
              <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-[0.95]">
                {t(
                  'Ready to create magic?',
                  'هل أنت مستعد للسحر؟'
                )}
              </h3>
              <p className="text-white/80 text-lg leading-relaxed">
                {t(
                  'Join the next generation of creators using AI to build cinematic content faster than ever.',
                  'انضم إلى الجيل الجديد من المبدعين.'
                )}
              </p>
              <button
                onClick={() => onNavigate('brand-dna')}
                className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:scale-105 transition-transform inline-flex items-center gap-3"
              >
                <Sparkles className="w-4 h-4" />
                {t('Start Free Now', 'ابدأ مجاناً الآن')}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-16 px-6 border-t border-[var(--border-color)] bg-black/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tighter">
              ABDALLA EISSA
            </span>
          </div>
          <p className="text-[var(--text-muted)] text-xs font-mono">
            © {new Date().getFullYear()} ABDALLA_EISSA_STUDIO ·{' '}
            {t('ALL RIGHTS RESERVED', 'جميع الحقوق محفوظة')}
          </p>
          <div className="flex gap-2">
            {SOCIAL_LINKS.map((s, i) => (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-[var(--text-secondary)] flex items-center justify-center hover:bg-white/10 hover:text-[var(--text-primary)] transition-all"
              >
                <s.icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5">
      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
        {label}
      </span>
      <span className="text-sm font-bold font-mono text-[var(--text-primary)]">{value}</span>
    </div>
  );
}
