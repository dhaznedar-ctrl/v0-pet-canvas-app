// ── Theme definitions for AI portrait generation ──
// Each theme has a unique fal.ai prompt, display metadata, and tab assignment.
// "intelligent" uses the tab's default prompt (royal-portrait for pets, family-portrait for family, etc.)

export type TabCategory = 'pets' | 'family' | 'kids' | 'couples' | 'self'

export interface ThemeConfig {
  name: string
  description: string
  model: string
  prompt: string
  colors: string[]
  thumbnail?: string // path to thumbnail image in /public
  tabs: TabCategory[] // which tabs this theme appears in
  settings: {
    aspect_ratio: string
    resolution: string
    num_images: number
    output_format: string
  }
}

const DEFAULT_SETTINGS = {
  aspect_ratio: '4:5',
  resolution: '2K',
  num_images: 1,
  output_format: 'png',
}

const MODEL = 'fal-ai/nano-banana-pro/edit'

// ── PET THEMES ──

const PET_BASE = `Transform the subject from the reference photo into an ultra-detailed authentic Old Master oil painting. The subject must dominate the composition as the primary focal point, positioned dead center and filling at least 70% of the frame — large, prominent, and commanding attention. Preserve the subject's exact natural colors, face, eyes, expression, fur texture, and all distinguishing physical features with photographic precision — do not yellow, warm-tint, or alter the subject's natural coloring in any way. Remove any modern accessories such as collars, leashes, harnesses, bows, or tags.`

const PET_FINISH = `Render with extreme attention to realistic detail: individual hairs and fur strands, fabric weave texture, light reflections on gold, soft shadow gradients on fur. Paint with visible impasto brushstrokes, authentic craquelure aging cracks, rich layered glazing, and warm sfumato transitions. Museum-quality masterpiece, majestic, dignified, timeless.`

// ── HUMAN THEMES (family, kids, couples, self) ──

const HUMAN_BASE = `Transform all subjects from the reference photo into an ultra-detailed authentic Old Master oil painting. Preserve every subject's face, eyes, expression, skin tone, hair color, and distinguishing features with absolute photographic accuracy — each person must be instantly recognizable.`

const HUMAN_FINISH = `Render with extreme realistic detail: skin pores, fabric weave, lace threadwork, light catching on pearls and gold, soft hair strands. Paint with visible impasto brushstrokes, craquelure aging texture, rich layered glazing, and warm sfumato transitions. Museum-quality masterpiece, elegant, dignified, timeless.`

export const STYLE_PROMPTS: Record<string, ThemeConfig> = {
  // ═══════════════════════════════════════
  // INTELLIGENT (default for all tabs)
  // ═══════════════════════════════════════
  'intelligent': {
    name: 'Intelligent',
    description: 'Let the AI choose the perfect style based on your photos',
    model: MODEL,
    prompt: '', // Will use the tab's default prompt at generation time
    colors: [],
    tabs: ['pets', 'family', 'kids', 'couples', 'self'],
    settings: DEFAULT_SETTINGS,
  },

  // ═══════════════════════════════════════
  // PET THEMES
  // ═══════════════════════════════════════
  'medici-garden': {
    name: 'Royal Velvet',
    description: 'Regal elegance with crimson velvet, ermine trim, and intimate Old Master darkness',
    model: MODEL,
    prompt: `Transform the subject from the reference photo into an ultra-detailed authentic 17th century Old Master oil painting. The subject must dominate the composition as the primary focal point, positioned dead center and filling at least 70% of the frame — large, prominent, and commanding attention. Preserve the subject's exact natural colors, face, eyes, expression, fur or skin texture, and all distinguishing physical features with photographic precision — do not yellow, warm-tint, or alter the subject's natural coloring in any way. Remove any modern accessories such as collars, leashes, harnesses, bows, or tags. The subject reclines regally on an oversized plush deep crimson-burgundy velvet cushion with ornate gold brocade trim and a gold tassel at the corner. Drape a rich burgundy-maroon velvet royal cape over the subject with white ermine fur trim adorned with small black spots running along the edges, and a delicate antique gold lace collar around the neck. Add a fine gold chain necklace with a single dark gemstone pendant. Background: dark, muted olive-gold tone with soft painterly brushstrokes — a single gathered dark gold-bronze velvet curtain draped on one side, the rest is a warm umber-to-dark-olive gradient with no other objects, no architecture, no landscape — just atmospheric Old Master darkness. Lighting is warm Rembrandt-style chiaroscuro from the upper left, casting a soft golden glow on the subject's face and the velvet textures while the rest falls into deep warm shadow. Render with extreme attention to realistic detail: individual hairs and fur strands with natural sheen, the deep plush texture of crimson velvet on the cushion, each tiny black spot on the ermine fur, the delicate pattern of the gold lace collar, light catching the gold chain links, soft fabric folds and creases in the cape. Paint with visible impasto brushstrokes, authentic craquelure aging cracks across the surface, rich layered oil glazing, and warm sfumato transitions between light and shadow. Color palette: deep crimson burgundy, dark olive gold, warm umber, antique bronze, ivory ermine white, and muted dark gold. Museum-quality masterpiece, majestic, dignified, intimate, and timeless.`,
    colors: ['#722F37', '#4A3728', '#C9A84C', '#B8B8B0', '#2F2F2F'],
    thumbnail: '/samples/royal-velvet.jpg',
    tabs: ['pets'],
    settings: DEFAULT_SETTINGS,
  },
  'florentine-court': {
    name: 'Florentine Court',
    description: 'Timeless elegance with refined brushwork and classical composition',
    model: MODEL,
    prompt: `${PET_BASE} The subject rests on an ornate marble pedestal draped with pale gold silk beside a classical Florentine garden terrace. Soft light filters through arched Renaissance loggia columns. Behind, a distant Tuscan landscape with cypress trees and warm golden hills under a luminous sky. The subject wears a delicate gold filigree collar with emeralds. Colors: warm ochre, soft olive, ivory, and aged gold. Refined sfumato technique with soft atmospheric perspective. ${PET_FINISH}`,
    colors: ['#C08081', '#6B6B6B', '#2F2F2F', '#C9A84C', '#B8B8B0'],
    thumbnail: '/samples/florentine-court.jpg',
    tabs: ['pets'],
    settings: DEFAULT_SETTINGS,
  },
  'pastel-court': {
    name: 'Pastel Nobility',
    description: 'Vibrant painterly style with bold brushstrokes and rich color harmonies',
    model: MODEL,
    prompt: `Transform the subject from the reference photo into an ultra-detailed authentic 18th century Rococo oil painting. The subject must dominate the composition as the primary focal point, positioned dead center and filling at least 70% of the frame — large, prominent, and commanding attention. Preserve the subject's exact natural colors, face, eyes, expression, fur or skin texture, and all distinguishing physical features with photographic precision — do not alter the subject's natural coloring in any way. Remove any modern accessories such as collars, leashes, harnesses, bows, or tags. The subject reclines elegantly on a plush soft teal-turquoise satin cushion with delicate gold piping along the edges. Drape a flowing dusty rose-pink velvet cape with white ermine fur trim adorned with small black spots, decorated with intricate floral embroidery featuring coral-red flowers, turquoise leaves, and delicate vine patterns across the fabric. Soft pastel background with dreamy painterly brushstrokes blending pale pink, cream, soft lavender, and light blue tones — like a romantic cloudy sky rendered in the style of François Boucher or Jean-Honoré Fragonard. Lighting is soft, diffused, and ethereal from the upper right, creating gentle luminous highlights and delicate shadows. Render with extreme attention to realistic detail: individual hairs and fur strands, the sheen of teal satin, intricate embroidered floral details on the pink cape, delicate lace trim texture, and soft pastel light reflections. Paint with visible soft brushstrokes, gentle craquelure aging, layered glazing, and smooth sfumato transitions. Color palette: dusty rose pink, soft teal turquoise, coral red, cream, lavender, and warm ivory. Museum-quality masterpiece, graceful, romantic, soft and luminous.`,
    colors: ['#D4A0A0', '#7BA8A0', '#E8B4B8', '#F5F0E1', '#C9A84C'],
    thumbnail: '/samples/pastel-nobility.jpg',
    tabs: ['pets'],
    settings: DEFAULT_SETTINGS,
  },
  'twilight-masters': {
    name: 'Caravaggio Twilight',
    description: 'Atmospheric Renaissance style with dramatic lighting and old master techniques',
    model: MODEL,
    prompt: `Transform the subject from the reference photo into an ultra-detailed authentic 16th-17th century Old Master Renaissance oil painting. The subject must dominate the composition as the primary focal point, positioned dead center and filling at least 70% of the frame — large, prominent, and commanding attention. Preserve the subject's exact natural colors, face, eyes, expression, fur or skin texture, and all distinguishing physical features with photographic precision — do not alter the subject's natural coloring in any way. Remove any modern accessories such as collars, leashes, harnesses, bows, or tags. The subject reclines majestically on a weathered olive-brown velvet cushion with heavy gold rope tassels, giving an aged and antique appearance. Drape a deep burgundy-maroon velvet royal cape with white ermine fur trim adorned with small black spots, decorated with subtle floral embroidery in muted rose and bronze tones, and a delicate gold lace collar. Add a gold chain necklace with a circular medallion pendant. The background features a dramatic atmospheric Renaissance landscape sky — dark stormy clouds in deep charcoal and navy blue with breaks of teal and amber light piercing through, and a distant hazy landscape horizon suggesting rolling hills. The overall composition references a grid-like classical golden ratio structure. Lighting is intense dramatic chiaroscuro with strong contrast — deep shadows and selective illumination on the subject, creating a Caravaggio-like intensity. Render with extreme attention to realistic detail: individual hairs and fur strands, worn velvet texture on the cushion, tarnished gold chain links, moody atmospheric cloud formations, and rich deep shadow gradients. Paint with visible impasto brushstrokes, heavy authentic craquelure aging cracks, dark layered oil glazing, and dramatic sfumato transitions. Color palette: deep charcoal, dark navy, teal, burgundy maroon, olive brown, antique bronze, and muted amber. Museum-quality masterpiece, dramatic, brooding, atmospheric and powerful.`,
    colors: ['#4A3728', '#2D3748', '#5F7B8A', '#722F37', '#C9A84C'],
    thumbnail: '/samples/caravaggio-twilight.jpg',
    tabs: ['pets'],
    settings: DEFAULT_SETTINGS,
  },

  // ═══════════════════════════════════════
  // HUMAN / FAMILY THEMES
  // ═══════════════════════════════════════
  'aristocrat': {
    name: 'The Aristocrat',
    description: 'Baroque aristocratic style with velvet and ermine, romantic lighting',
    model: MODEL,
    prompt: `${HUMAN_BASE} Dress all subjects in opulent Baroque aristocratic attire: men in richly embroidered velvet doublets with white lace cravats, gold buttons, and capes with ermine trim; women in corseted silk gowns with lace collars, pearl necklaces, and jeweled brooches; children in miniature aristocratic attire. Arrange subjects in a classical group composition maintaining their natural relationships. Background: softly blurred warm umber and deep brown tones painted with loose, expressive oil brushstrokes — no distinct objects, no furniture, no architecture — just atmospheric color and light. Warm Rembrandt chiaroscuro lighting from the upper left, all attention on the subjects. Palette: deep greens, burgundy, ivory, gold, ermine white. ${HUMAN_FINISH}`,
    colors: ['#808080', '#556B2F', '#DC143C', '#4682B4', '#DAA520'],
    tabs: ['family', 'kids', 'couples'],
    settings: DEFAULT_SETTINGS,
  },
  'aristocrat-self': {
    name: 'The Aristocrat',
    description: 'Victorian gentleman portrait with pure dark background and masterful restraint',
    model: MODEL,
    prompt: `${HUMAN_BASE} Dress the subject in a formal mid-19th-century Victorian gentleman's attire: a perfectly tailored black velvet double-breasted frock coat with dark buttons, a matching black waistcoat, a crisp white high-collared shirt, and a black silk cravat tied neatly at the throat. No accessories, no jewelry, no hat visible — extreme simplicity and elegance. The subject stands in a three-quarter pose with hands clasped gently at the waist, gazing calmly at the viewer. Background: extremely dark — near-black with the subtlest warm umber-brown undertone. Absolutely nothing visible — no curtain, no furniture, no props. Pure darkness. The subject emerges from the void as if painted on a black canvas. Lighting is soft, focused Rembrandt chiaroscuro from the upper left — just enough to model the face, illuminate the white shirt and cravat, and catch a faint sheen on the black velvet coat. Everything else dissolves into shadow. Paint with masterful restraint — smooth precise brushwork on the face and hands, subtle tonal gradations in the black fabrics, warm luminous skin. Minimal visible brushstrokes — a polished, refined finish. Color palette: black, near-black brown, warm umber, ivory white, natural skin tones only. ${HUMAN_FINISH}`,
    colors: ['#2F2F2F', '#3E2723', '#4A3728', '#F5F5DC', '#C9A84C'],
    thumbnail: '/samples/aristocrat-self.jpg',
    tabs: ['self'],
    settings: DEFAULT_SETTINGS,
  },
  'gilded-salon': {
    name: 'Gilded Salon',
    description: 'Theatrical flair with exotic accents and bold color contrasts',
    model: MODEL,
    prompt: `${HUMAN_BASE} Dress all subjects in lavish Art Nouveau-influenced attire: flowing silk gowns with peacock-feather motifs, velvet cloaks with gold-thread embroidery, jeweled headpieces. Background: abstract wash of turquoise and deep gold tones blended with soft painterly brushstrokes — no mirrors, no lamps, no furniture, no wallpaper — only diffused warm color gradations suggesting opulence. Dramatic theatrical lighting with strong key light from the right and deep shadows on the opposite side. Palette: turquoise, deep plum, gold, emerald, ivory. ${HUMAN_FINISH}`,
    colors: ['#6B7BA8', '#2F2F2F', '#C08081', '#C9A84C', '#5F8B6A'],
    tabs: ['family', 'kids', 'couples', 'self'],
    settings: DEFAULT_SETTINGS,
  },
  'tempest': {
    name: 'The Tempest',
    description: 'Heavy, moody, and energetic with visible brushstrokes',
    model: MODEL,
    prompt: `${HUMAN_BASE} Dress all subjects in dark romantic-era clothing: men in black frock coats with high collars and dark cravats; women in dramatic dark silk gowns with billowing sleeves and dark lace shawls. Background: loosely painted turbulent sky with swirling dark clouds and a single break of warm amber light — no trees, no landscape details, no lightning bolts — just an atmospheric stormy gradient rendered in broad impasto strokes. Dramatic chiaroscuro with warm golden light falling on the subjects from above. Heavy visible brushwork throughout. Palette: deep charcoal, storm grey, amber, burnt sienna, muted gold. ${HUMAN_FINISH}`,
    colors: ['#9B7B8E', '#2F4F4F', '#6B8E9B', '#C9A84C', '#DAA520'],
    tabs: ['family', 'couples', 'self'],
    settings: DEFAULT_SETTINGS,
  },
  'ember-wood': {
    name: 'Ember & Oak',
    description: 'A noble and emotive portrait in warm autumn tones',
    model: MODEL,
    prompt: `${HUMAN_BASE} Dress all subjects in warm-toned aristocratic attire: men in rich mahogany-brown velvet coats with copper buttons and burnt-orange silk waistcoats; women in deep amber and rust-colored silk gowns with autumn leaf embroidery and garnet jewelry. Background: warm, unfocused glow of deep umber and firelight orange blended with soft oil brushstrokes — no fireplace, no books, no furniture, no props — only a rich atmospheric warmth suggesting an intimate interior. Soft warm lighting from the lower left as if from an unseen hearth, with deep umber shadows. Palette: warm red, chestnut brown, deep amber, copper, dark forest. ${HUMAN_FINISH}`,
    colors: ['#CD5C5C', '#B8736A', '#3E2723', '#4A3728', '#5C4033'],
    tabs: ['family', 'kids', 'couples', 'self'],
    settings: DEFAULT_SETTINGS,
  },
  'golden-age': {
    name: 'Golden Age',
    description: 'A tender, intimate portrait in the 19th-century salon style',
    model: MODEL,
    prompt: `${HUMAN_BASE} Dress all subjects in elegant late 19th-century Belle Époque attire: women in high-collared lace blouses with cameo brooches, softly draped ivory and pale gold silk gowns, pearl drop earrings and delicate gold chains; men in impeccable dark suits with silk waistcoats, gold pocket watches, and cravats; children in pristine white linen with lace trim. Background: luminous soft golden haze with gentle pastel undertones — no windows, no curtains, no salon details — just diffused warm afternoon light painted in delicate, airy brushwork. Warm natural glow illuminating the subjects with soft skin luminosity. Palette: soft gold, ivory, rose pink, powder blue, pearl white. ${HUMAN_FINISH}`,
    colors: ['#B8B8B0', '#CD5C5C', '#F5F5DC', '#2F2F2F', '#C9A84C'],
    tabs: ['family', 'kids', 'couples', 'self'],
    settings: DEFAULT_SETTINGS,
  },
  'grand-baroque': {
    name: 'Grand Baroque',
    description: 'Museum-quality Baroque oil portraiture with deep contrast',
    model: MODEL,
    prompt: `${HUMAN_BASE} Dress all subjects in sumptuous Baroque-era court attire: men in slashed velvet doublets with wide lace ruffs, puffed satin sleeves, gold chain of office; women in heavily brocaded gowns with stiff lace collars, jeweled crosses, and elaborate upswept hairstyles with pearl pins. Arrange in a grand formal composition reminiscent of Velázquez court portraits. Background: deep, near-black void with only the subtlest warm undertone — no curtains, no throne, no props — pure tenebrism darkness. Intense Caravaggio-style spotlight on subjects from sharp left, extreme contrast, subjects emerging dramatically from shadow. Rich, thick impasto paint application. Palette: black, deep crimson, gold, ivory, burgundy. ${HUMAN_FINISH}`,
    colors: ['#808080', '#CD5C5C', '#3E3E3E', '#C9A84C', '#696969'],
    tabs: ['family', 'couples', 'self'],
    settings: DEFAULT_SETTINGS,
  },
  'royal-court': {
    name: 'Royal Court',
    description: 'Dramatic, museum-quality oil portraiture with vibrant colors',
    model: MODEL,
    prompt: `${HUMAN_BASE} Dress all subjects in magnificent 18th-century Royal Court attire: men in richly decorated military-style jackets with gold braid, sashes of office in royal blue and scarlet; women in wide-skirted court gowns of sky blue and gold silk with lace fichu, diamond tiaras, and ostrich-plume hair ornaments; children in matching miniature versions. Background: soft, hazy gradient of pale blue-grey and warm ivory with loose impressionistic brushstrokes — no columns, no marble floor, no throne, no architectural details — just an airy, luminous atmosphere suggesting grandeur. Brilliant, even lighting with gentle warmth. Palette: royal blue, scarlet, gold, ivory, soft green. ${HUMAN_FINISH}`,
    colors: ['#B8B8B0', '#CD5C5C', '#2F2F2F', '#C9A84C', '#DAA520'],
    tabs: ['family', 'kids', 'couples', 'self'],
    settings: DEFAULT_SETTINGS,
  },

  // ═══════════════════════════════════════
  // LEGACY ALIASES (kept for backward compat with existing jobs)
  // ═══════════════════════════════════════
  'royal-portrait': {
    name: 'Royal Portrait',
    description: 'Classic royal pet portrait',
    model: MODEL,
    prompt: `${PET_BASE} The subject sits regally on a luxurious velvet tufted cushion with intricate gold thread embroidery and golden tassels, resting on an ornate draped velvet cloth with elaborate gold brocade patterns cascading beneath. Drape a royal cape trimmed with ermine fur in a color that harmonizes with the subject's natural tones, and add a gold chain necklace with a pearl pendant. Dark background with a faint classical marble column on one side and subtle draped silk curtain on the other, warm Rembrandt chiaroscuro lighting from the upper left. ${PET_FINISH}`,
    colors: ['#DAA520', '#8B0000', '#2F2F2F', '#C9B896', '#4B0082'],
    tabs: [],
    settings: DEFAULT_SETTINGS,
  },
  'family-portrait': {
    name: 'Family Portrait',
    description: 'Classic family portrait',
    model: MODEL,
    prompt: `${HUMAN_BASE} Dress all subjects in period-appropriate Renaissance or Baroque aristocratic clothing: men in velvet doublets or coats with white lace cravats, gold buttons, and capes with gold epaulettes; women in elegant corseted silk gowns with lace collars, pearl necklaces, and embroidered details; children in miniature versions of adult aristocratic attire with lace collars and velvet fabrics. If a pet is present, include it faithfully. Arrange subjects in a classical portrait composition maintaining their original grouping. Set against a dark interior background with rich velvet burgundy curtains, a faint marble column, warm Rembrandt chiaroscuro lighting from the upper left, and an ornate Persian rug beneath. ${HUMAN_FINISH}`,
    colors: ['#DAA520', '#8B0000', '#2F2F2F', '#C9B896', '#87CEEB'],
    tabs: [],
    settings: DEFAULT_SETTINGS,
  },
  'kids-portrait': {
    name: 'Kids Portrait',
    description: 'Classic children portrait',
    model: MODEL,
    prompt: `${HUMAN_BASE} Maintain natural joyful expressions, genuine smiles, and warm childhood innocence. Dress all subjects in elegant Regency-era velvet clothing: girls in rich burgundy or crimson velvet empire-waist dresses with delicate white lace Peter Pan collars; boys in velvet suits — navy blue, forest green, or chocolate brown — with crisp white lace collars. Arrange subjects in an intimate, affectionate composition capturing the natural warmth between siblings. Paint soft rosy cheeks, luminous sparkling eyes, and warm glowing skin. Background is a romantic English landscape with dark ancient trees, golden sunset sky through foliage, and wildflowers. Warm golden Rembrandt lighting from the upper left. ${HUMAN_FINISH}`,
    colors: ['#8B4513', '#DAA520', '#2F2F2F', '#C9B896', '#87CEEB'],
    tabs: [],
    settings: DEFAULT_SETTINGS,
  },
}

// Default prompts for "intelligent" mode — maps tab to a base style
const INTELLIGENT_DEFAULTS: Record<TabCategory, string> = {
  pets: 'royal-portrait',
  family: 'family-portrait',
  kids: 'kids-portrait',
  couples: 'family-portrait',
  self: 'family-portrait',
}

/**
 * Resolve the actual style key. If "intelligent", returns the tab's default.
 */
export function resolveStyle(style: string, tab?: TabCategory): string {
  if (style === 'intelligent' && tab) {
    return INTELLIGENT_DEFAULTS[tab] || 'royal-portrait'
  }
  return style
}

export function buildGenerationRequest(style: string, imageUrl: string) {
  const config = STYLE_PROMPTS[style as keyof typeof STYLE_PROMPTS]
  if (!config) throw new Error('Unknown style: ' + style)

  return {
    model: config.model,
    input: {
      prompt: config.prompt,
      image_urls: [imageUrl],
      ...config.settings,
    },
  }
}
