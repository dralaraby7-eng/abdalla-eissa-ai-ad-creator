import { t } from '../utils/i18n';

// =====================================================
// CINEMATIC STYLES (preserved from v1, expanded)
// =====================================================

export interface CinematicStyle {
  id: string;
  label: string;
  labelAr: string;
  description: string;
  category: 'auto' | 'core' | 'luxury' | 'motion' | 'retro' | 'technical';
}

export const CINEMATIC_STYLES: CinematicStyle[] = [
  // AUTO
  { id: '', label: 'AI-Driven', labelAr: 'توقع ذكي', description: t('Intelligent style prediction', 'توقع النمط الذكي'), category: 'auto' },

  // CORE STORYBOARD STYLES
  { id: 'storyboard', label: 'Storyboard', labelAr: 'لوحة قصة', description: t('Sequence from nothing to 3D reveal', 'تسلسل من العدم إلى الكشف ثلاثي الأبعاد'), category: 'core' },
  { id: 'product reveal', label: 'Product Reveal', labelAr: 'كشف المنتج', description: t('Cinematic product unveiling', 'كشف سينمائي للمنتج'), category: 'core' },
  { id: '3d angles', label: '3D Macro', labelAr: 'ماكرو ثلاثي الأبعاد', description: t('Extreme close-ups, texture focus', 'لقطات قريبة للغاية، تركيز على الملمس'), category: 'core' },
  { id: 'Simple/Minimalist', label: 'Minimalist', labelAr: 'بسيط', description: t('Clean and simple', 'نظيف وبسيط'), category: 'core' },
  { id: 'Dynamic/Action', label: 'Dynamic', labelAr: 'ديناميكي', description: t('Dynamic and action-packed', 'ديناميكي ومليء بالحركة'), category: 'core' },

  // LUXURY / EDITORIAL
  { id: 'Luxury/High-End', label: 'Luxury', labelAr: 'فاخر', description: t('Luxury and high-end', 'فاخر وراقٍ'), category: 'luxury' },
  { id: 'EDITORIAL', label: 'Editorial', labelAr: 'تحريري', description: t('Fashion-forward, refined composition', 'عصري، تكوين مصفى'), category: 'luxury' },
  { id: 'HYPERREAL PRODUCT', label: 'Hyperreal', labelAr: 'منتج واقعي للغاية', description: t('Polished surfaces, ad-grade realism', 'أسطح مصقولة، واقعية بمستوى إعلاني'), category: 'luxury' },
  { id: 'BESPOKE', label: 'Bespoke', labelAr: 'مخصص', description: t('Tailored, crafted, high-end feel', 'مفصل، مصنوع، شعور راقٍ'), category: 'luxury' },
  { id: 'CHROME', label: 'Chrome', labelAr: 'كروم', description: t('Reflective metals, bold highlights', 'معادن عاكسة، إضاءات قوية'), category: 'luxury' },
  { id: 'LIQUID METAL', label: 'Liquid Metal', labelAr: 'معدن سائل', description: t('Flowing reflections, premium futurism', 'انعكاسات متدفقة، مستقبلية متميزة'), category: 'luxury' },
  { id: 'GLASSMORPHIC', label: 'Glassmorphic', labelAr: 'زجاجي شفاف', description: t('Frosted layers, soft depth', 'طبقات متجمدة، عمق ناعم'), category: 'luxury' },
  { id: 'MONOCHROME', label: 'Monochrome', labelAr: 'أحادي اللون', description: t('Restrained palette, strong form', 'لوحة ألوان مقيدة، شكل قوي'), category: 'luxury' },

  // MOTION / DYNAMIC
  { id: 'ZERO GRAVITY', label: 'Zero Gravity', labelAr: 'انعدام الجاذبية', description: t('Floating objects, suspended elegance', 'أجسام طافية، أناقة معلقة'), category: 'motion' },
  { id: 'ORGANIC FLUID', label: 'Organic Fluid', labelAr: 'سائل عضوي', description: t('Liquid motion, soft morphing', 'حركة سائلة، تحول ناعم'), category: 'motion' },
  { id: 'IMPACT FRAME', label: 'Impact', labelAr: 'إطار تأثير', description: t('Punchy cuts, explosive transitions', 'لقطات قوية، انتقالات انفجارية'), category: 'motion' },
  { id: 'PULSE', label: 'Pulse', labelAr: 'نبض', description: t('Rhythmic motion, music-reactive', 'حركة إيقاعية، شعور متفاعل مع الموسيقى'), category: 'motion' },
  { id: 'TRAILS', label: 'Trails', labelAr: 'مسارات', description: t('Streaks, echoes, motion residue', 'خطوط، أصداء، بقايا حركة'), category: 'motion' },
  { id: 'SPORT / PERFORMANCE', label: 'Sport', labelAr: 'رياضي', description: t('Speed, impact, high intensity', 'سرعة، تأثير، كثافة عالية'), category: 'motion' },
  { id: 'ATMOSPHERIC', label: 'Atmospheric', labelAr: 'جوي', description: t('Mist, haze, cinematic light shafts', 'ضباب، سديم، أشعة ضوء سينمائية'), category: 'motion' },

  // RETRO / STYLIZED
  { id: 'Y2K CHROME', label: 'Y2K Chrome', labelAr: 'كروم الألفية', description: t('Nostalgic tech futurism', 'مستقبلية تقنية حنينية'), category: 'retro' },
  { id: 'RETRO SCI-FI', label: 'Retro Sci-Fi', labelAr: 'خيال علمي ريترو', description: t('Vintage future, analog imagination', 'مستقبل عتيق، خيال تناظري'), category: 'retro' },
  { id: 'POP SURREAL', label: 'Pop Surreal', labelAr: 'سريالية بوب', description: t('Dreamlike, colorful, unexpected', 'شبيه بالحلم، ملون، غير متوقع'), category: 'retro' },
  { id: 'MEMPHIS 3D', label: 'Memphis 3D', labelAr: 'ممفيس ثلاثي الأبعاد', description: t('Geometric, fun, graphic play', 'هندسي، ممتع، لعب جرافيكي'), category: 'retro' },
  { id: 'CLAYMATION', label: 'Claymation', labelAr: 'صلصال', description: t('Handmade, soft sculpted feel', 'مصنوع يدوياً، شعور منحوت ناعم'), category: 'retro' },
  { id: 'TOON 3D', label: 'Toon 3D', labelAr: 'تون ثلاثي الأبعاد', description: t('Stylized shading, playful volume', 'تظليل فني، حجم مرح'), category: 'retro' },

  // TECHNICAL / EDITORIAL
  { id: '3D Explanatory/Technical', label: 'Technical', labelAr: 'تقني', description: t('3D explanatory and technical', 'شرح ثلاثي الأبعاد وتقني'), category: 'technical' },
  { id: 'EXPLODED VIEW', label: 'Exploded View', labelAr: 'عرض مفكك', description: t('Parts separated, technical beauty', 'أجزاء منفصلة، جمال تقني'), category: 'technical' },
  { id: 'CUTAWAY', label: 'Cutaway', labelAr: 'مقطع عرضي', description: t('Interior reveals, layered storytelling', 'كشف داخلي، سرد قصصي متعدد الطبقات'), category: 'technical' },
  { id: 'ISOMETRIC', label: 'Isometric', labelAr: 'أيزومتريك', description: t('Clean perspective, structured scenes', 'منظور نظيف، مشاهد منظمة'), category: 'technical' },
  { id: 'SWISS GRID', label: 'Swiss Grid', labelAr: 'شبكة سويسرية', description: t('Clean structure, typographic precision', 'هيكل نظيف، دقة طباعية'), category: 'technical' },
  { id: 'ARCHITECTURAL', label: 'Architectural', labelAr: 'معماري', description: t('Spatial, elegant, controlled lighting', 'مكاني، أنيق، إضاءة محكمة'), category: 'technical' },
  { id: 'MACRO ABSTRACT', label: 'Macro Abstract', labelAr: 'ماكرو تجريدي', description: t('Extreme close-ups, texture focus', 'لقطات قريبة للغاية، تركيز على الملمس'), category: 'technical' },
  { id: 'ORBITAL', label: 'Orbital', labelAr: 'مداري', description: t('Rotating camera, central hero object', 'كاميرا دوارة، جسم بطل مركزي'), category: 'technical' },
];

export const SUGGESTED_KEYWORDS = [
  'Soft Lighting', 'Rim Light', '3D Render', 'Volumetric Fog',
  'Macro 100mm', 'Zero Gravity', 'Cinematic', 'Octane Render', 'Unreal Engine 5',
  'Specular Highlight', 'Subsurface Scattering', 'Depth of Field',
  'Anamorphic', 'Bokeh', 'Light Rays', 'Studio Lighting'
];

export const FEEL_OPTIONS = [
  { id: 'auto', label: 'Auto-Detect', labelAr: 'كشف تلقائي' },
  { id: 'luxury', label: 'Luxury & Premium', labelAr: 'فاخر ومميز' },
  { id: 'fun', label: 'Fun & Playful', labelAr: 'مرح ولعوب' },
  { id: 'eco', label: 'Eco & Natural', labelAr: 'بيئي وطبيعي' },
  { id: 'sporty', label: 'Sporty & Energetic', labelAr: 'رياضي ونشط' },
  { id: 'tech', label: 'Tech & Futuristic', labelAr: 'تقني ومستقبلي' },
  { id: 'minimal', label: 'Minimal & Clean', labelAr: 'بسيط ونظيف' },
  { id: 'bold', label: 'Bold & Loud', labelAr: 'جريء وقوي' },
  { id: 'elegant', label: 'Elegant & Refined', labelAr: 'أنيق ومكرر' },
  { id: 'youthful', label: 'Youthful & Trendy', labelAr: 'شبابي وعصري' },
];

export const TARGET_AUDIENCES = [
  { id: 'auto', label: 'Auto-Detect', labelAr: 'كشف تلقائي' },
  { id: 'gen-z', label: 'Gen Z (16-25)', labelAr: 'الجيل Z' },
  { id: 'millennials', label: 'Millennials (26-40)', labelAr: 'جيل الألفية' },
  { id: 'gen-x', label: 'Gen X (41-55)', labelAr: 'الجيل X' },
  { id: 'professionals', label: 'Professionals', labelAr: 'محترفون' },
  { id: 'parents', label: 'Parents & Families', labelAr: 'الآباء والعائلات' },
  { id: 'luxury-buyers', label: 'Luxury Buyers', labelAr: 'مشترو الفخامة' },
  { id: 'students', label: 'Students', labelAr: 'الطلاب' },
];

export const VIDEO_DURATIONS = [
  { id: '6', label: '6 sec (Short)', labelAr: '٦ ثوانٍ (قصير)' },
  { id: '15', label: '15 sec (Story)', labelAr: '١٥ ثانية (قصة)' },
  { id: '30', label: '30 sec (Standard)', labelAr: '٣٠ ثانية (قياسي)' },
  { id: '45', label: '45 sec (Extended)', labelAr: '٤٥ ثانية (ممتد)' },
  { id: '60', label: '60 sec (Long-form)', labelAr: '٦٠ ثانية (طويل)' },
];

export const GRID_OPTIONS = ['1x2', '2x2', '3x3', '4x4'];

export const ORIENTATION_OPTIONS = [
  { id: 'horizontal', label: 'Horizontal (16:9)', labelAr: 'أفقي (١٦:٩)' },
  { id: 'vertical', label: 'Vertical (9:16)', labelAr: 'عمودي (٩:١٦)' },
  { id: 'square', label: 'Square (1:1)', labelAr: 'مربع (١:١)' },
] as const;

export const SCRIPT_TYPES = [
  { id: 'voiceover', label: 'Voiceover', labelAr: 'تعليق صوتي' },
  { id: 'dialogue', label: 'Dialogue', labelAr: 'حوار' },
  { id: 'narrative', label: 'Narrative', labelAr: 'سردي' },
  { id: 'tagline', label: 'Tagline / Slogan', labelAr: 'شعار' },
  { id: 'social-caption', label: 'Social Caption', labelAr: 'تعليق وسائل تواصل' },
];

export const TONE_OPTIONS = [
  { id: 'auto', label: 'Auto-Detect', labelAr: 'كشف تلقائي' },
  { id: 'inspiring', label: 'Inspiring', labelAr: 'ملهم' },
  { id: 'humorous', label: 'Humorous', labelAr: 'فكاهي' },
  { id: 'serious', label: 'Serious', labelAr: 'جاد' },
  { id: 'urgent', label: 'Urgent', labelAr: 'عاجل' },
  { id: 'warm', label: 'Warm & Friendly', labelAr: 'دافئ وودود' },
  { id: 'authoritative', label: 'Authoritative', labelAr: 'موثوق' },
  { id: 'playful', label: 'Playful', labelAr: 'مرح' },
];

export const LANGUAGES = [
  { id: 'English', label: 'English', labelAr: 'الإنجليزية' },
  { id: 'Arabic', label: 'العربية', labelAr: 'العربية' },
  { id: 'Bilingual', label: 'Bilingual EN/AR', labelAr: 'ثنائي اللغة EN/AR' },
  { id: 'Egyptian Arabic', label: 'Egyptian Arabic', labelAr: 'العامية المصرية' },
];
