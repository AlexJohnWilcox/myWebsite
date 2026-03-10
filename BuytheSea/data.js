'use strict';

// ═══════════════════════════════════════════════════════════════
//  ZONE ARCHITECTURE  (from masterGameLayout.md)
//  Beginner: Coast → Shallows → Sandbank → Reef → Coral Sprawl
//  Intermediate: Sand Dunes → Old Mine → Shark Den → Abandoned City → Seawall
// ═══════════════════════════════════════════════════════════════

const ZONES = [
  {
    id: 0, name: 'THE COAST', code: 'ZONE-01', depth: 5, tier: 'BEGINNER',
    unlockCost: null, implemented: true,
    fish: ['glow_anchovy', 'blister_crab', 'hollow_mackerel', 'tide_gazer', 'shore_wraith'],
    spawnWeights: [50, 30, 10, 9, 1], maxFish: 4,
    color: '#00cc88',
    ambientMessages: [
      '> The water is warmer than it should be for this time of year.',
      '> Something glints under the surface. Your scanner shows nothing.',
      '> The birds left three days ago. No one mentioned it.',
      '> Salinity reading: NORMAL. Second reading: ERROR.',
      '> The tide is going out. It has not come back.',
    ],
  },
  {
    id: 1, name: 'THE SHALLOWS', code: 'ZONE-02', depth: 35, tier: 'BEGINNER',
    unlockCost: 1500, implemented: true,
    fish: ['pale_goby', 'linked_eel', 'jaw_fish', 'signal_carp', 'mirror_scale'],
    spawnWeights: [50, 30, 10, 9, 1], maxFish: 5,
    color: '#44aadd',
    ambientMessages: [
      '> The shallows are quieter than they should be.',
      '> [PING] Sonar returned an unexpected shape. Logged and ignored.',
      '> Two fish moved in perfect synchrony. Neither noticed the other.',
      '> Depth: 20m. Something is pressed against the sand below.',
      '> The water here tastes like static electricity.',
    ],
  },
  {
    id: 2, name: 'THE SANDBANK', code: 'ZONE-03', depth: 90, tier: 'BEGINNER',
    unlockCost: 6000, implemented: true,
    fish: ['dust_feeder', 'multi_eye', 'the_knot', 'depth_worm', 'sandborn'],
    spawnWeights: [50, 30, 10, 9, 1], maxFish: 5,
    color: '#ccaa44',
    ambientMessages: [
      '> The sandbank shifts. It shifted the wrong direction.',
      '> Bio-scanner shows density clusters. Organic. Dense.',
      '> Something has been arranged under the sand. Deliberately.',
      '> Pressure anomaly at 55m. It moved when the scanner swept past it.',
      '> The sand here is too fine. Too uniform. Too deliberate.',
    ],
  },
  {
    id: 3, name: 'THE REEF', code: 'ZONE-04', depth: 200, tier: 'BEGINNER',
    unlockCost: 20000, implemented: true,
    fish: ['irradiated_perch', 'rust_eel', 'deep_scout', 'abyssal_leech', 'the_watcher'],
    spawnWeights: [50, 30, 10, 9, 1], maxFish: 5,
    color: '#cc55aa',
    ambientMessages: [
      '> The reef is alive. It is also watching.',
      '> [SONAR PING] Contact at 140m. Classification: ERROR. Reclassification: IGNORE.',
      '> Bioluminescence detected. Pattern: non-random. Meaning: unknown.',
      '> Irradiation levels above threshold. Your equipment says this is fine.',
      '> The coral here grows toward you when you are not looking.',
    ],
  },
  {
    id: 4, name: 'THE CORAL SPRAWL', code: 'ZONE-05', depth: 450, tier: 'BEGINNER',
    unlockCost: 55000, implemented: true,
    fish: ['coral_drifter', 'polyp_snapper', 'branch_crawler', 'neon_medusa', 'the_colony'],
    spawnWeights: [50, 30, 10, 9, 1], maxFish: 6,
    color: '#ff6644',
    ambientMessages: [
      '> The coral here is not growing. It is assembling.',
      '> Colors shift when you look directly at them. Peripheral vision shows the truth.',
      '> A polyp opened its mouth. Inside: another polyp. Inside that: teeth.',
      '> Bioluminescent pulses detected. Frequency matches your heartbeat.',
      '> The sprawl extends further than your scanner can reach. It was not this large yesterday.',
    ],
  },
  {
    id: 5, name: 'THE SAND DUNES', code: 'ZONE-06', depth: 1200, tier: 'INTERMEDIATE',
    unlockCost: 100000, implemented: true,
    fish: ['dune_slider', 'silt_phantom', 'glass_ray', 'storm_warden', 'the_buried'],
    spawnWeights: [50, 30, 10, 9, 1], maxFish: 6,
    color: '#ddaa44',
    ambientMessages: [
      '> The dunes migrate. They do not follow the current.',
      '> Sand composition: 40% silica, 30% calcium, 30% UNKNOWN ORGANIC.',
      '> Something large moved beneath the dune. The dune did not shift.',
      '> Visibility dropping. The sand is rising. There is no current.',
      '> A dune collapsed. Beneath it: another dune. Beneath that: something breathing.',
    ],
  },
  {
    id: 6, name: 'THE OLD MINE', code: 'ZONE-07', depth: 2400, tier: 'INTERMEDIATE',
    unlockCost: 350000, implemented: true,
    fish: ['ore_nibbler', 'slag_eel', 'drill_fish', 'vein_crawler', 'the_foreman'],
    spawnWeights: [50, 30, 10, 9, 1], maxFish: 6,
    color: '#8888aa',
    ambientMessages: [
      '> Mine shaft 7 is still operational. Records show it was sealed in 1987.',
      '> Pick marks on the walls. They were made from the inside.',
      '> Ore deposits detected. The ore is warm. It should not be warm.',
      '> A rail cart moved past on rusted tracks. No one was pushing it.',
      '> The mine shaft groans. It sounds like language.',
    ],
  },
  {
    id: 7, name: 'THE SHARK DEN', code: 'ZONE-08', depth: 4000, tier: 'INTERMEDIATE',
    unlockCost: 900000, implemented: true,
    fish: ['reef_pup', 'hammerhead_ghost', 'blood_fin', 'apex_shadow', 'the_matriarch'],
    spawnWeights: [50, 30, 10, 9, 1], maxFish: 5,
    color: '#cc3333',
    ambientMessages: [
      '> Tooth marks on the scanner housing. The scanner was in your hand.',
      '> Blood in the water. Analysis: not from any known species.',
      '> Shark count: 7. Shark count: 12. Shark count: ERROR. Shark count: 1.',
      '> The den has a hierarchy. You are being ranked.',
      '> Something circled you three times. Your sonar only detected it once.',
    ],
  },
  {
    id: 8, name: 'THE ABANDONED CITY', code: 'ZONE-09', depth: 6500, tier: 'INTERMEDIATE',
    unlockCost: 2500000, implemented: true,
    fish: ['pipe_swimmer', 'ruin_lurker', 'glass_walker', 'signal_ghost', 'the_architect'],
    spawnWeights: [50, 30, 10, 9, 1], maxFish: 6,
    color: '#6688bb',
    ambientMessages: [
      '> The city was not abandoned. The inhabitants simply stopped being visible.',
      '> Street signs in a language that predates language.',
      '> A window opened. Light came from inside. There is no power source.',
      '> The buildings are too symmetrical. Geometry this precise requires intent.',
      '> Population records found. The last census counted something that is not a number.',
    ],
  },
  {
    id: 9, name: 'THE SEAWALL', code: 'ZONE-10', depth: 9000, tier: 'INTERMEDIATE',
    unlockCost: 6000000, implemented: true,
    fish: ['wall_clinger', 'breach_eel', 'abyss_angler', 'pressure_pike', 'void_sentinel', 'the_barrier'],
    spawnWeights: [50, 30, 10, 9, 0.7, 0.3], maxFish: 5,
    color: '#556677',
    ambientMessages: [
      '> The wall was not built to keep things out. It was built to keep things in.',
      '> Structural analysis: the wall is growing. 2.3mm per year. For how long?',
      '> A crack in the wall. Something is looking through it. From the other side.',
      '> Pressure readings on both sides of the wall are identical. They should not be.',
      '> The wall hums at a frequency that makes your teeth ache. The fish do not seem to mind.',
    ],
  },
  {
    id: 10, name: 'THE ABYSS', code: 'ZONE-11', depth: 20000, tier: 'ADVANCED',
    unlockCost: 15000000, implemented: true,
    fish: ['void_minnow', 'pressure_eel', 'fissure_crab', 'null_ray', 'the_depth'],
    spawnWeights: [50, 30, 10, 9, 1], maxFish: 5,
    color: '#4422aa',
    ambientMessages: [
      '> There is no light here. There has never been light here.',
      '> Your depth gauge reads ERROR. It has been reading ERROR for some time.',
      '> The pressure should have crushed you. It chose not to.',
      '> Something vast just moved beneath you. Your instruments did not register it.',
      '> The void is not empty. It is full of something your sensors cannot name.',
    ],
  },
  {
    id: 11, name: 'THE HIDDEN PASSAGE', code: 'ZONE-12', depth: 35000, tier: 'ADVANCED',
    unlockCost: 40000000, implemented: true,
    fish: ['tunnel_dart', 'echo_fish', 'passage_worm', 'gate_keeper', 'the_shortcut'],
    spawnWeights: [50, 30, 10, 9, 1], maxFish: 5,
    color: '#338866',
    ambientMessages: [
      '> The passage was not here yesterday. It will not be here tomorrow.',
      '> Echoes arrive before you make a sound.',
      '> The walls are smooth. Something polished them. Recently.',
      '> Your sonar shows the passage extending 400km. That is not possible.',
      '> You are not the first to find this place. You may be the last.',
    ],
  },
  {
    id: 12, name: 'THE MERMAID\'S LAIR', code: 'ZONE-13', depth: 50000, tier: 'ADVANCED',
    unlockCost: 100000000, implemented: true,
    fish: ['siren_minnow', 'pearl_jaw', 'coral_mimic', 'deep_siren', 'the_enchantress'],
    spawnWeights: [50, 30, 10, 9, 1], maxFish: 5,
    color: '#cc44ff',
    ambientMessages: [
      '> You hear singing. Your audio equipment is off.',
      '> The water here tastes sweet. That should concern you.',
      '> Pearls litter the floor. They are arranged in a pattern you almost recognize.',
      '> Something beautiful swam past. You cannot describe it. You do not want to.',
      '> The lair welcomes you. That is the most frightening thing about it.',
    ],
  },
  {
    id: 13, name: 'THE TWILIGHT DEPTHS', code: 'ZONE-14', depth: 70000, tier: 'ADVANCED',
    unlockCost: 250000000, implemented: true,
    fish: ['dusk_swimmer', 'shadow_fin', 'twilight_jelly', 'fading_leviathan', 'the_last_light'],
    spawnWeights: [50, 30, 10, 9, 1], maxFish: 5,
    color: '#553388',
    ambientMessages: [
      '> The light here is dying. It has been dying for a very long time.',
      '> Shadows move independently of their sources.',
      '> Your headlamp flickers. When it returns, things have moved.',
      '> Twilight is not a time of day here. It is a permanent state.',
      '> Something faded out of existence as you watched. You are not sure it was a fish.',
    ],
  },
  {
    id: 14, name: 'THE MIDNIGHT TRENCH', code: 'ZONE-15', depth: 100000, tier: 'ADVANCED',
    unlockCost: 600000000, implemented: true,
    fish: ['trench_crawler', 'blind_hunter', 'mariana_eel', 'crushing_maw', 'the_bottom'],
    spawnWeights: [50, 30, 10, 9, 1], maxFish: 5,
    color: '#222233',
    ambientMessages: [
      '> This is the deepest point. Nothing should live here. Everything does.',
      '> The trench walls are closing. They have always been closing.',
      '> Pressure: LETHAL. Status: ALIVE. Explanation: NONE.',
      '> You have reached the bottom. The bottom disagrees.',
      '> There is something below the trench. There should not be anything below the trench.',
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
//  FISH DATA
// ═══════════════════════════════════════════════════════════════

const RARITY_ORDER  = { COMMON: 0, UNCOMMON: 1, RARE: 2, EPIC: 3, LEGENDARY: 4 };
const RARITY_COLORS = {
  COMMON:    { color: '#00cc66', glow: '#00ff88', eye: '#00ff88' },
  UNCOMMON:  { color: '#88ccff', glow: '#aaddff', eye: '#88ccff' },
  RARE:      { color: '#ff4466', glow: '#ff7799', eye: '#ff0033' },
  EPIC:      { color: '#cc44ff', glow: '#dd77ff', eye: '#cc00ff' },
  LEGENDARY: { color: '#ffcc44', glow: '#ffee88', eye: '#ffcc44' },
};

const FISH = {
  // ── ZONE 0: THE COAST ──
  glow_anchovy: {
    name: 'GLOW SPRAT', zone: 0, rarity: 'COMMON', goldValue: 1,
    speed: 72, size: 18, wave: { amp: 4, freq: 3 },
    desc: 'Bioluminescent. Edible, probably.',
  },
  blister_crab: {
    name: 'BLISTER CRAB', zone: 0, rarity: 'UNCOMMON', goldValue: 3,
    speed: 57, size: 24, wave: { amp: 8, freq: 4 },
    desc: 'Calcified protrusions on the shell. Not natural.', shape: 'crab',
  },
  hollow_mackerel: {
    name: 'HOLLOW MACKEREL', zone: 0, rarity: 'RARE', goldValue: 12,
    speed: 105, size: 20, wave: { amp: 6, freq: 2.5 },
    desc: 'Interior completely empty. Still alive.', shape: 'slim',
  },
  tide_gazer: {
    name: 'TIDE GAZER', zone: 0, rarity: 'EPIC', goldValue: 38,
    speed: 141, size: 26, wave: { amp: 28, freq: 2.2 },
    desc: 'Its eye tracks you even after being caught.', shape: 'blob',
  },
  shore_wraith: {
    name: 'SHORE WRAITH', zone: 0, rarity: 'LEGENDARY', goldValue: 135,
    speed: 178, size: 15, wave: { amp: 45, freq: 1.0 },
    desc: 'You saw it. Your scanner did not.',
  },

  // ── ZONE 1: THE SHALLOWS ──
  pale_goby: {
    name: 'PALE GOBY', zone: 1, rarity: 'COMMON', goldValue: 2,
    speed: 79, size: 20, wave: { amp: 5, freq: 2.8 }, shape: 'slim',
    desc: 'No pigment. Appears to have lost something recently.',
  },
  linked_eel: {
    name: 'LINKED EEL', zone: 1, rarity: 'UNCOMMON', goldValue: 6,
    speed: 116, size: 32, wave: { amp: 36, freq: 1.8 }, shape: 'eel',
    desc: 'Always found in pairs. The other is never caught.',
  },
  jaw_fish: {
    name: 'JAW FISH', zone: 1, rarity: 'RARE', goldValue: 24,
    speed: 152, size: 25, wave: { amp: 7, freq: 2.2 }, shape: 'jaw',
    desc: 'Mouth constitutes 60% of body mass.',
  },
  signal_carp: {
    name: 'SIGNAL CARP', zone: 1, rarity: 'EPIC', goldValue: 75,
    speed: 174, size: 22, wave: { amp: 20, freq: 3.0 }, shape: 'flat',
    desc: 'Constantly broadcasting. No one is responding.',
  },
  mirror_scale: {
    name: 'MIRROR SCALE', zone: 1, rarity: 'LEGENDARY', goldValue: 260,
    speed: 226, size: 18, wave: { amp: 50, freq: 0.9 }, shape: 'flat',
    desc: 'It shows you something. You cannot repeat what you saw.',
  },

  // ── ZONE 2: THE SANDBANK ──
  dust_feeder: {
    name: 'DUST FEEDER', zone: 2, rarity: 'COMMON', goldValue: 3,
    speed: 88, size: 21, wave: { amp: 6, freq: 5 }, shape: 'fish',
    desc: 'Consumes sediment. Excretes something crystalline.',
  },
  multi_eye: {
    name: 'MULTI-EYE', zone: 2, rarity: 'UNCOMMON', goldValue: 11,
    speed: 123, size: 28, wave: { amp: 24, freq: 2.5 }, shape: 'blob',
    desc: 'Eleven eyes. None of them blink at the same time.',
  },
  the_knot: {
    name: 'THE KNOT', zone: 2, rarity: 'RARE', goldValue: 45,
    speed: 156, size: 19, wave: { amp: 8, freq: 3.0 }, shape: 'eel',
    desc: 'Spine tied into a reef knot. Still functional.',
  },
  depth_worm: {
    name: 'DEPTH WORM', zone: 2, rarity: 'EPIC', goldValue: 135,
    speed: 185, size: 38, wave: { amp: 55, freq: 1.5 }, shape: 'eel',
    desc: 'Pressure at this depth should kill it. Noted.',
  },
  sandborn: {
    name: 'SANDBORN', zone: 2, rarity: 'LEGENDARY', goldValue: 450,
    speed: 220, size: 22, wave: { amp: 30, freq: 2.0 }, shape: 'blob',
    desc: 'Did not swim here. Emerged from below.',
  },

  // ── ZONE 3: THE REEF ──
  irradiated_perch: {
    name: 'IRRADIATED PERCH', zone: 3, rarity: 'COMMON', goldValue: 6,
    speed: 79, size: 24, wave: { amp: 5, freq: 2.5 }, shape: 'fish',
    desc: 'Glows faintly. Probably fine.',
  },
  rust_eel: {
    name: 'RUST EEL', zone: 3, rarity: 'UNCOMMON', goldValue: 21,
    speed: 132, size: 34, wave: { amp: 34, freq: 2.0 }, shape: 'eel',
    desc: 'Corroded metallic scales. Moves in waves.',
  },
  deep_scout: {
    name: 'DEEP SCOUT', zone: 3, rarity: 'RARE', goldValue: 80,
    speed: 218, size: 26, wave: { amp: 10, freq: 1.8 }, shape: 'shark',
    desc: 'It appears to be studying you. Do not make eye contact.',
  },
  abyssal_leech: {
    name: 'ABYSSAL LEECH', zone: 3, rarity: 'EPIC', goldValue: 240,
    speed: 163, size: 28, wave: { amp: 22, freq: 3.2 }, shape: 'blob',
    desc: 'Parasitic. It has been following you longer than you realize.',
  },
  the_watcher: {
    name: 'THE WATCHER', zone: 3, rarity: 'LEGENDARY', goldValue: 800,
    speed: 220, size: 38, wave: { amp: 18, freq: 0.7 }, shape: 'shark',
    desc: 'You cannot be certain if you caught it, or if it allowed itself to be caught.',
  },

  // ── ZONE 4: THE CORAL SPRAWL ──
  coral_drifter: {
    name: 'CORAL DRIFTER', zone: 4, rarity: 'COMMON', goldValue: 11,
    speed: 85, size: 22, wave: { amp: 7, freq: 2.6 }, shape: 'fish',
    desc: 'Camouflaged as coral. Only visible when it moves.',
  },
  polyp_snapper: {
    name: 'POLYP SNAPPER', zone: 4, rarity: 'UNCOMMON', goldValue: 40,
    speed: 130, size: 26, wave: { amp: 12, freq: 2.8 }, shape: 'jaw',
    desc: 'Feeds exclusively on polyps. The polyps do not resist.',
  },
  branch_crawler: {
    name: 'BRANCH CRAWLER', zone: 4, rarity: 'RARE', goldValue: 150,
    speed: 170, size: 20, wave: { amp: 15, freq: 3.2 }, shape: 'crab',
    desc: 'Walks along coral branches upside down. Gravity is a suggestion.',
  },
  neon_medusa: {
    name: 'NEON JELLY', zone: 4, rarity: 'EPIC', goldValue: 450,
    speed: 195, size: 30, wave: { amp: 35, freq: 1.4 }, shape: 'jellyfish',
    desc: 'Tentacles emit light in patterns that induce calm. Do not stare.',
  },
  the_colony: {
    name: 'THE COLONY', zone: 4, rarity: 'LEGENDARY', goldValue: 1500,
    speed: 245, size: 35, wave: { amp: 20, freq: 0.8 }, shape: 'blob',
    desc: 'Not one organism. Not many. The distinction does not apply.',
  },

  // ── ZONE 5: THE SAND DUNES ──
  dune_slider: {
    name: 'DUNE SLIDER', zone: 5, rarity: 'COMMON', goldValue: 22,
    speed: 110, size: 24, wave: { amp: 5, freq: 2.2 }, shape: 'flat',
    desc: 'Glides along the sand surface. Leaves no trail.',
  },
  silt_phantom: {
    name: 'SILT PHANTOM', zone: 5, rarity: 'UNCOMMON', goldValue: 75,
    speed: 167, size: 22, wave: { amp: 18, freq: 2.5 }, shape: 'slim',
    desc: 'Visible only in disturbed sediment. Invisible otherwise.',
  },
  glass_ray: {
    name: 'GLASS RAY', zone: 5, rarity: 'RARE', goldValue: 280,
    speed: 220, size: 30, wave: { amp: 10, freq: 1.6 }, shape: 'flat',
    desc: 'Transparent body reveals internal organs. All of them are wrong.',
  },
  storm_warden: {
    name: 'STORM WARDEN', zone: 5, rarity: 'EPIC', goldValue: 800,
    speed: 253, size: 28, wave: { amp: 28, freq: 2.0 }, shape: 'shark',
    desc: 'Appears before underwater storms. The storms follow it.',
  },
  the_buried: {
    name: 'THE BURIED', zone: 5, rarity: 'LEGENDARY', goldValue: 2800,
    speed: 310, size: 26, wave: { amp: 40, freq: 1.2 }, shape: 'eel',
    desc: 'Erupts from the sand. Returns before you can look away.',
  },

  // ── ZONE 6: THE OLD MINE ──
  ore_nibbler: {
    name: 'ORE NIBBLER', zone: 6, rarity: 'COMMON', goldValue: 40,
    speed: 120, size: 20, wave: { amp: 4, freq: 3.0 }, shape: 'fish',
    desc: 'Teeth made of mineral deposits. It eats the walls.',
  },
  slag_eel: {
    name: 'SLAG EEL', zone: 6, rarity: 'UNCOMMON', goldValue: 140,
    speed: 184, size: 34, wave: { amp: 30, freq: 1.8 }, shape: 'eel',
    desc: 'Body coated in industrial waste. Thriving.',
  },
  drill_fish: {
    name: 'DRILL FISH', zone: 6, rarity: 'RARE', goldValue: 520,
    speed: 242, size: 26, wave: { amp: 8, freq: 2.6 }, shape: 'slim',
    desc: 'Rotating head segment. Bores through rock. And other things.',
  },
  vein_crawler: {
    name: 'VEIN CRAWLER', zone: 6, rarity: 'EPIC', goldValue: 1500,
    speed: 282, size: 32, wave: { amp: 22, freq: 1.5 }, shape: 'crab',
    desc: 'Follows mineral veins through solid stone. Should not be possible.',
  },
  the_foreman: {
    name: 'THE FOREMAN', zone: 6, rarity: 'LEGENDARY', goldValue: 5200,
    speed: 345, size: 40, wave: { amp: 15, freq: 0.7 }, shape: 'shark',
    desc: 'Wears something on its head. It looks like a helmet. It is not a helmet.',
  },

  // ── ZONE 7: THE SHARK DEN ──
  reef_pup: {
    name: 'REEF PUP', zone: 7, rarity: 'COMMON', goldValue: 75,
    speed: 150, size: 26, wave: { amp: 6, freq: 2.4 }, shape: 'shark',
    desc: 'Juvenile predator. Curious. Hungry.',
  },
  hammerhead_ghost: {
    name: 'HAMMERHEAD GHOST', zone: 7, rarity: 'UNCOMMON', goldValue: 260,
    speed: 220, size: 32, wave: { amp: 14, freq: 1.8 }, shape: 'shark',
    desc: 'A hammerhead that is not entirely there. Translucent in direct light.',
  },
  blood_fin: {
    name: 'BLOOD FIN', zone: 7, rarity: 'RARE', goldValue: 950,
    speed: 294, size: 28, wave: { amp: 10, freq: 2.2 }, shape: 'shark',
    desc: 'Fins stained permanently red. The color spreads to nearby water.',
  },
  apex_shadow: {
    name: 'APEX SHADOW', zone: 7, rarity: 'EPIC', goldValue: 2800,
    speed: 338, size: 36, wave: { amp: 18, freq: 1.2 }, shape: 'shark',
    desc: 'Casts a shadow but is not visible. The shadow has teeth.',
  },
  the_matriarch: {
    name: 'THE MATRIARCH', zone: 7, rarity: 'LEGENDARY', goldValue: 9500,
    speed: 412, size: 44, wave: { amp: 12, freq: 0.6 }, shape: 'shark',
    desc: 'She has been here longer than the ocean. The den is hers.',
  },

  // ── ZONE 8: THE ABANDONED CITY ──
  pipe_swimmer: {
    name: 'PIPE SWIMMER', zone: 8, rarity: 'COMMON', goldValue: 135,
    speed: 169, size: 22, wave: { amp: 5, freq: 2.8 }, shape: 'slim',
    desc: 'Lives inside rusted pipes. Emerges to feed on rust.',
  },
  ruin_lurker: {
    name: 'RUIN LURKER', zone: 8, rarity: 'UNCOMMON', goldValue: 480,
    speed: 244, size: 28, wave: { amp: 20, freq: 2.0 }, shape: 'blob',
    desc: 'Hides in collapsed structures. Multiple eyes reflect no light.',
  },
  glass_walker: {
    name: 'GLASS WALKER', zone: 8, rarity: 'RARE', goldValue: 1750,
    speed: 325, size: 24, wave: { amp: 8, freq: 2.4 }, shape: 'crab',
    desc: 'Walks on broken windows. The glass does not cut it. It should.',
  },
  signal_ghost: {
    name: 'SIGNAL GHOST', zone: 8, rarity: 'EPIC', goldValue: 5200,
    speed: 375, size: 30, wave: { amp: 25, freq: 1.6 }, shape: 'jellyfish',
    desc: 'Emits radio signals on frequencies abandoned decades ago. Someone is listening.',
  },
  the_architect: {
    name: 'THE HAMMERHEAD', zone: 8, rarity: 'LEGENDARY', goldValue: 17500,
    speed: 456, size: 42, wave: { amp: 15, freq: 0.5 }, shape: 'blob',
    desc: 'It did not build the city. But it remembers who did.',
  },

  // ── ZONE 9: THE SEAWALL ──
  wall_clinger: {
    name: 'WALL CLINGER', zone: 9, rarity: 'COMMON', goldValue: 250,
    speed: 195, size: 24, wave: { amp: 4, freq: 3.2 }, shape: 'crab',
    desc: 'Attached to the wall. Has been attached for a very long time.',
  },
  breach_eel: {
    name: 'BREACH EEL', zone: 9, rarity: 'UNCOMMON', goldValue: 880,
    speed: 280, size: 36, wave: { amp: 32, freq: 1.6 }, shape: 'eel',
    desc: 'Squeezes through cracks in the wall. What it brings back is concerning.',
  },
  abyss_angler: {
    name: 'ABYSS ANGLER', zone: 9, rarity: 'UNCOMMON', goldValue: 1000,
    speed: 250, size: 32, wave: { amp: 15, freq: 1.2 }, shape: 'angler',
    desc: 'A light dangles before its mouth. It is not a lure. It is a warning.',
  },
  pressure_pike: {
    name: 'PRESSURE PIKE', zone: 9, rarity: 'RARE', goldValue: 3300,
    speed: 370, size: 28, wave: { amp: 6, freq: 2.0 }, shape: 'slim',
    desc: 'Body adapted to impossible pressure. It moves like a bullet.',
  },
  void_sentinel: {
    name: 'VOID SENTINEL', zone: 9, rarity: 'EPIC', goldValue: 9500,
    speed: 429, size: 34, wave: { amp: 20, freq: 1.0 }, shape: 'shark',
    desc: 'Guards something beyond the wall. It does not want you to know what.',
  },
  the_barrier: {
    name: 'THE BLOBFISH', zone: 9, rarity: 'LEGENDARY', goldValue: 33000,
    speed: 520, size: 48, wave: { amp: 10, freq: 0.4 }, shape: 'blob',
    desc: 'It is the wall. A piece of the wall that decided to swim.',
  },

  // ── SPECIAL: clickable creatures per zone ──
  shore_crab: {
    name: 'SHORE CRAB', zone: 0, rarity: 'RARE', goldValue: 38,
    speed: 0, size: 22, wave: null,
    desc: 'Spotted watching from the rocks. You were faster.',
  },
  tide_starfish: {
    name: 'TIDE STARFISH', zone: 1, rarity: 'RARE', goldValue: 48,
    speed: 0, size: 20, wave: null,
    desc: 'Five arms. Each one points somewhere different.',
  },
  buried_dollar: {
    name: 'BURIED DOLLAR', zone: 2, rarity: 'RARE', goldValue: 65,
    speed: 0, size: 18, wave: null,
    desc: 'Partially exposed. The sand was hiding it deliberately.',
  },
  reef_urchin: {
    name: 'REEF URCHIN', zone: 3, rarity: 'RARE', goldValue: 120,
    speed: 0, size: 18, wave: null,
    desc: 'Spines retract when observed directly. Extend when you look away.',
  },
  coral_pearl: {
    name: 'CORAL PEARL', zone: 4, rarity: 'RARE', goldValue: 185,
    speed: 0, size: 16, wave: null,
    desc: 'Found nestled in living coral. The coral tried to close around it.',
  },
  sand_fossil: {
    name: 'SAND FOSSIL', zone: 5, rarity: 'RARE', goldValue: 370,
    speed: 0, size: 20, wave: null,
    desc: 'A fossil of something that should not have existed. The dating is wrong.',
  },
  mine_gem: {
    name: 'MINE GEM', zone: 6, rarity: 'RARE', goldValue: 650,
    speed: 0, size: 16, wave: null,
    desc: 'Embedded in the wall. Glows when no one is watching.',
  },
  loose_tooth: {
    name: 'LOOSE TOOTH', zone: 7, rarity: 'RARE', goldValue: 1200,
    speed: 0, size: 20, wave: null,
    desc: 'Not from any species on record. The bite marks match nothing.',
  },
  city_relic: {
    name: 'CITY RELIC', zone: 8, rarity: 'RARE', goldValue: 2200,
    speed: 0, size: 18, wave: null,
    desc: 'A piece of something that was important once. It still hums.',
  },
  wall_shard: {
    name: 'WALL SHARD', zone: 9, rarity: 'RARE', goldValue: 4000,
    speed: 0, size: 22, wave: null,
    desc: 'Broke from the wall. The wall did not notice. Or chose not to.',
  },
  abyss_crystal: {
    name: 'ABYSS CRYSTAL', zone: 10, rarity: 'RARE', goldValue: 7500,
    speed: 0, size: 18, wave: null,
    desc: 'Crystallized darkness. It absorbs the light from your headlamp.',
  },
  passage_key: {
    name: 'PASSAGE KEY', zone: 11, rarity: 'RARE', goldValue: 14000,
    speed: 0, size: 20, wave: null,
    desc: 'A key to a door that does not exist yet. Or does not exist anymore.',
  },
  siren_scale: {
    name: 'SIREN SCALE', zone: 12, rarity: 'RARE', goldValue: 26000,
    speed: 0, size: 16, wave: null,
    desc: 'Iridescent. When you hold it to your ear, you hear a lullaby.',
  },
  twilight_orb: {
    name: 'TWILIGHT ORB', zone: 13, rarity: 'RARE', goldValue: 48000,
    speed: 0, size: 18, wave: null,
    desc: 'Contains the last photon of a dying star. It pulses slowly.',
  },
  trench_bone: {
    name: 'TRENCH BONE', zone: 14, rarity: 'RARE', goldValue: 90000,
    speed: 0, size: 22, wave: null,
    desc: 'From something enormous. The species is not in any database.',
  },

  // ── ZONE 10: THE ABYSS ──
  void_minnow: {
    name: 'VOID MINNOW', zone: 10, rarity: 'COMMON', goldValue: 480,
    speed: 210, size: 18, wave: { amp: 6, freq: 3.4 }, shape: 'slim',
    desc: 'Exists in the space between light and nothing. Barely visible.',
  },
  pressure_eel: {
    name: 'PRESSURE EEL', zone: 10, rarity: 'UNCOMMON', goldValue: 1650,
    speed: 305, size: 38, wave: { amp: 35, freq: 1.4 }, shape: 'eel',
    desc: 'Its body is compressed to a fraction of what it should be. Still moving.',
  },
  fissure_crab: {
    name: 'FISSURE CRAB', zone: 10, rarity: 'RARE', goldValue: 6200,
    speed: 398, size: 26, wave: { amp: 8, freq: 2.8 }, shape: 'crab',
    desc: 'Crawls out of cracks that were not there before. The cracks close behind it.',
  },
  null_ray: {
    name: 'NULL RAY', zone: 10, rarity: 'EPIC', goldValue: 18000,
    speed: 468, size: 34, wave: { amp: 22, freq: 1.0 }, shape: 'flat',
    desc: 'Absorbs all light that touches it. Your scanner returns blank.',
  },
  the_depth: {
    name: 'THE DEPTH', zone: 10, rarity: 'LEGENDARY', goldValue: 62000,
    speed: 560, size: 46, wave: { amp: 14, freq: 0.4 }, shape: 'blob',
    desc: 'The abyss looked back. This is what it sent.',
  },

  // ── ZONE 11: THE HIDDEN PASSAGE ──
  tunnel_dart: {
    name: 'TUNNEL DART', zone: 11, rarity: 'COMMON', goldValue: 920,
    speed: 240, size: 20, wave: { amp: 4, freq: 3.0 }, shape: 'slim',
    desc: 'Navigates passages too narrow to exist. Never touches the walls.',
  },
  echo_fish: {
    name: 'ECHO FISH', zone: 11, rarity: 'UNCOMMON', goldValue: 3200,
    speed: 340, size: 24, wave: { amp: 16, freq: 2.4 }, shape: 'fish',
    desc: 'You hear it before you see it. The sound arrives from the wrong direction.',
  },
  passage_worm: {
    name: 'PASSAGE WORM', zone: 11, rarity: 'RARE', goldValue: 12000,
    speed: 430, size: 40, wave: { amp: 40, freq: 1.2 }, shape: 'eel',
    desc: 'Burrows through solid rock. The tunnels heal behind it.',
  },
  gate_keeper: {
    name: 'GATE KEEPER', zone: 11, rarity: 'EPIC', goldValue: 35000,
    speed: 510, size: 32, wave: { amp: 18, freq: 1.6 }, shape: 'shark',
    desc: 'Patrols the passage entrance. It decides who passes. Not you.',
  },
  the_shortcut: {
    name: 'THE SHORTCUT', zone: 11, rarity: 'LEGENDARY', goldValue: 120000,
    speed: 620, size: 36, wave: { amp: 12, freq: 0.5 }, shape: 'jellyfish',
    desc: 'Swims between two points without crossing the space between them.',
  },

  // ── ZONE 12: THE MERMAID'S LAIR ──
  siren_minnow: {
    name: 'SIREN MINNOW', zone: 12, rarity: 'COMMON', goldValue: 1800,
    speed: 265, size: 22, wave: { amp: 8, freq: 2.8 }, shape: 'fish',
    desc: 'Sings at a frequency that makes you want to follow. Do not follow.',
  },
  pearl_jaw: {
    name: 'PEARL JAW', zone: 12, rarity: 'UNCOMMON', goldValue: 6200,
    speed: 375, size: 28, wave: { amp: 14, freq: 2.2 }, shape: 'jaw',
    desc: 'Teeth replaced entirely with pearls. Still bites.',
  },
  coral_mimic: {
    name: 'CORAL MIMIC', zone: 12, rarity: 'RARE', goldValue: 23000,
    speed: 465, size: 26, wave: { amp: 10, freq: 2.6 }, shape: 'crab',
    desc: 'Looks exactly like coral. The coral disagrees.',
  },
  deep_siren: {
    name: 'DEEP SIREN', zone: 12, rarity: 'EPIC', goldValue: 68000,
    speed: 548, size: 36, wave: { amp: 30, freq: 1.0 }, shape: 'jellyfish',
    desc: 'Its song rewrites your sonar data. The new data is more beautiful.',
  },
  the_enchantress: {
    name: 'THE ENCHANTRESS', zone: 12, rarity: 'LEGENDARY', goldValue: 230000,
    speed: 680, size: 44, wave: { amp: 20, freq: 0.4 }, shape: 'eel',
    desc: 'You do not remember catching it. Your inventory says otherwise.',
  },

  // ── ZONE 13: THE TWILIGHT DEPTHS ──
  dusk_swimmer: {
    name: 'DUSK SWIMMER', zone: 13, rarity: 'COMMON', goldValue: 3500,
    speed: 290, size: 24, wave: { amp: 6, freq: 2.6 }, shape: 'fish',
    desc: 'Only visible in the exact moment between light and dark.',
  },
  shadow_fin: {
    name: 'SHADOW FIN', zone: 13, rarity: 'UNCOMMON', goldValue: 12000,
    speed: 410, size: 30, wave: { amp: 20, freq: 1.8 }, shape: 'shark',
    desc: 'Its shadow is a different shape than its body.',
  },
  twilight_jelly: {
    name: 'TWILIGHT JELLY', zone: 13, rarity: 'RARE', goldValue: 44000,
    speed: 505, size: 28, wave: { amp: 28, freq: 1.4 }, shape: 'jellyfish',
    desc: 'Bioluminescence shifts between colors that do not exist.',
  },
  fading_leviathan: {
    name: 'FADING LEVIATHAN', zone: 13, rarity: 'EPIC', goldValue: 130000,
    speed: 590, size: 42, wave: { amp: 16, freq: 0.8 }, shape: 'shark',
    desc: 'Enormous. Fading in and out of visibility. Each time there is less of it.',
  },
  the_last_light: {
    name: 'THE LAST LIGHT', zone: 13, rarity: 'LEGENDARY', goldValue: 440000,
    speed: 740, size: 38, wave: { amp: 25, freq: 0.3 }, shape: 'blob',
    desc: 'The final photon before absolute darkness. It has learned to swim.',
  },

  // ── ZONE 14: THE MIDNIGHT TRENCH ──
  trench_crawler: {
    name: 'TRENCH CRAWLER', zone: 14, rarity: 'COMMON', goldValue: 6800,
    speed: 320, size: 22, wave: { amp: 4, freq: 3.2 }, shape: 'crab',
    desc: 'Clings to the trench walls. Has never seen light. Does not want to.',
  },
  blind_hunter: {
    name: 'BLIND HUNTER', zone: 14, rarity: 'UNCOMMON', goldValue: 23000,
    speed: 455, size: 32, wave: { amp: 12, freq: 2.0 }, shape: 'shark',
    desc: 'No eyes. Hunts by sensing the fear of other fish.',
  },
  mariana_eel: {
    name: 'MARIANA EEL', zone: 14, rarity: 'RARE', goldValue: 85000,
    speed: 550, size: 44, wave: { amp: 45, freq: 1.0 }, shape: 'eel',
    desc: 'Longer than your instruments can measure. Both ends are never visible.',
  },
  crushing_maw: {
    name: 'CRUSHING MAW', zone: 14, rarity: 'EPIC', goldValue: 250000,
    speed: 640, size: 38, wave: { amp: 20, freq: 1.2 }, shape: 'angler',
    desc: 'Its mouth is larger than its body. Geometry does not apply here.',
  },
  the_bottom: {
    name: 'THE BOTTOM', zone: 14, rarity: 'LEGENDARY', goldValue: 850000,
    speed: 800, size: 52, wave: { amp: 8, freq: 0.3 }, shape: 'blob',
    desc: 'There is nothing deeper. There is nothing after. This is the end.',
  },
};

// ═══════════════════════════════════════════════════════════════
//  MATERIALS (item 20)
// ═══════════════════════════════════════════════════════════════

const MATERIALS = {
  glowing_rod: {
    name: 'GLOWING ROD', desc: 'A faintly luminescent rod pulled from the catch. Warm to the touch.',
    source: 'glow_anchovy', dropChance: 0.05,
  },
  hollow_scale: {
    name: 'HOLLOW SCALE', desc: 'A scale with nothing inside. Lighter than air.',
    source: 'hollow_mackerel', dropChance: 0.08,
  },
  depth_crystal: {
    name: 'DEPTH CRYSTAL', desc: 'Crystallized pressure. It hums at a frequency you cannot hear.',
    source: 'dust_feeder', dropChance: 0.04,
  },
};

// ═══════════════════════════════════════════════════════════════
//  COAST ZONE DECORATION DATA
// ═══════════════════════════════════════════════════════════════

const COAST_SAND_LEVEL = 0.85;
const COAST_ROCKS = [
  { fx: 0.14, fy: 0.82 },
  { fx: 0.50, fy: 0.84 },
  { fx: 0.80, fy: 0.81 },
];

// ═══════════════════════════════════════════════════════════════
//  UPGRADES
// ═══════════════════════════════════════════════════════════════

const UPGRADE_CATEGORIES = [
  { name: 'LINE CONTROL',  roots: ['rod_speed'] },
  { name: 'HARPOON',       roots: ['harpoon'] },
  { name: 'AUTOMATION',    roots: ['auto_hook'] },
  { name: 'ABILITIES',     roots: ['bait_bomb', 'multi_cast'] },
  { name: 'BLACK FISH',    roots: ['bf_spawn_rate'] },
  { name: 'CONSUMABLES',   roots: [], special: 'consumables' },
  { name: 'NAVIGATION',    roots: ['atlas_access'] },
  { name: 'SUBMARINE',     roots: ['submarine'] },
];

const CONSUMABLES_DEF = [
  { id: 'small_net', name: 'SMALL NET',  desc: 'Throw a net that captures all fish in a small area. Click to activate, then click on the water.',  cost: 1000, netRadius: 90  },
  { id: 'big_net',   name: 'BIG NET',    desc: 'A larger net. Captures all fish in a wide area. Click to activate, then click on the water.',       cost: 1500, netRadius: 180 },
  { id: 'black_fish_bait', name: 'BLACK FISH BAIT', desc: 'Immediately spawns a black fish.',  cost: 1000000 },
];

const UPGRADES_DEF = [
  // ── LINE CONTROL ──────────────────────────────────────────
  { id: 'rod_speed',          name: 'FASTER ROD I',      desc: 'Increase cast speed.',                        baseCost: 10,    max: 10, costMult: 1.25, tierOf: 'rod_speed' },
  { id: 'rod_speed_2',        name: 'FASTER ROD II',     desc: 'Further increase cast speed.',                baseCost: 300,   max: 10, costMult: 1.25, tierOf: 'rod_speed', parent: 'rod_speed' },
  { id: 'rod_speed_3',        name: 'FASTER ROD III',    desc: 'Greatly increase cast speed.',                baseCost: 9000,  max: 10, costMult: 1.4, tierOf: 'rod_speed', parent: 'rod_speed_2' },
  { id: 'faster_reel',        name: 'FASTER RELOAD I',   desc: 'Decrease cast cooldown.',                     baseCost: 12,    max: 10, costMult: 1.4, tierOf: 'faster_reel', parent: 'rod_speed' },
  { id: 'faster_reel_2',      name: 'FASTER RELOAD II',  desc: 'Further decrease cast cooldown.',             baseCost: 360,   max: 10, costMult: 1.4, tierOf: 'faster_reel', parent: 'faster_reel' },
  { id: 'instant_retract',    name: 'RETRACT ROD',       desc: 'Unlocks right-click to retract your hook.',   baseCost: 15,    max: 1,  parent: 'rod_speed' },
  { id: 'retract_speed',      name: 'RETRACT SPEED I',   desc: 'Increases retract speed.',                    baseCost: 18,    max: 10, costMult: 1.4, tierOf: 'retract_speed', parent: 'instant_retract' },
  { id: 'retract_speed_2',    name: 'RETRACT SPEED II',  desc: 'Further increases retract speed.',            baseCost: 540,   max: 10, costMult: 1.4, tierOf: 'retract_speed', parent: 'retract_speed' },
  { id: 'targeting_scope',    name: 'HOOK SIZE I',       desc: 'Increase hook catch radius.',                 baseCost: 14,    max: 10, costMult: 1.4, tierOf: 'targeting_scope', parent: 'rod_speed' },
  { id: 'targeting_scope_2',  name: 'HOOK SIZE II',      desc: 'Further increase hook catch radius.',         baseCost: 420,   max: 10, costMult: 1.4, tierOf: 'targeting_scope', parent: 'targeting_scope' },
  { id: 'fish_magnet',        name: 'FISH MAGNET',       desc: 'Fish drift toward your hook while it lingers.', baseCost: 35, max: 10, costMult: 1.4, tierOf: 'fish_magnet', parent: 'rod_speed' },
  { id: 'fish_magnet_2',      name: 'FISH MAGNET II',    desc: 'Stronger magnetic pull on your hook.',          baseCost: 2000, max: 10, costMult: 1.4, tierOf: 'fish_magnet', parent: 'fish_magnet' },
  { id: 'net_place',          name: 'CAST NET',          desc: 'Unlocks placeable nets that auto-catch fish.',  baseCost: 1500, max: 1,  parent: 'targeting_scope' },
  { id: 'net_slots',          name: 'NET SLOTS',         desc: '+1 additional placeable net.',                 max: 3, costs: [25000, 100000, 500000], parent: 'net_place' },
  { id: 'net_size',           name: 'NET RADIUS',        desc: 'Increases net catch radius.',                  max: 3, costs: [15000, 60000, 250000], parent: 'net_place' },

  // ── HARPOON ──────────────────────────────────────────────
  { id: 'harpoon',            name: 'HARPOON',           desc: 'Unlocks the Harpoon.', baseCost: 250, max: 1 },
  { id: 'harpoon_damage',     name: 'HARPOON DAMAGE I',  desc: 'Increases harpoon damage.',                   baseCost: 200,   max: 10, costMult: 1.3, tierOf: 'harpoon_damage', parent: 'harpoon' },
  { id: 'harpoon_damage_2',   name: 'HARPOON DAMAGE II', desc: 'Further increases harpoon damage.',           baseCost: 6000,  max: 10, costMult: 1.3, tierOf: 'harpoon_damage', parent: 'harpoon_damage' },
  { id: 'harpoon_speed',      name: 'HARPOON SPEED I',   desc: 'Increases harpoon cast speed.',               baseCost: 300,   max: 10, costMult: 1.3, tierOf: 'harpoon_speed', parent: 'harpoon' },
  { id: 'harpoon_speed_2',    name: 'HARPOON SPEED II',  desc: 'Further increases harpoon cast speed.',       baseCost: 9000,  max: 10, costMult: 1.3, tierOf: 'harpoon_speed', parent: 'harpoon_speed' },

  // ── AUTOMATION ────────────────────────────────────────────
  { id: 'auto_hook',          name: 'AUTO HOOK',         desc: 'Automate Hook Casting.',                      baseCost: 100,   max: 1 },
  { id: 'auto_hook_speed',    name: 'AUTO SPEED I',      desc: 'Reduces auto hook interval by 1s.',           baseCost: 40,    max: 10, costMult: 1.3, tierOf: 'auto_hook_speed', parent: 'auto_hook' },
  { id: 'auto_hook_speed_2',  name: 'AUTO SPEED II',     desc: 'Further reduces auto hook interval.',         baseCost: 1200,  max: 10, costMult: 1.3, tierOf: 'auto_hook_speed', parent: 'auto_hook_speed' },
  { id: 'auto_hook_reload',   name: 'AUTO RELOAD I',     desc: 'Reduces recast delay after auto hook.',       baseCost: 35,    max: 10, costMult: 1.3, tierOf: 'auto_hook_reload', parent: 'auto_hook' },
  { id: 'auto_hook_reload_2', name: 'AUTO RELOAD II',    desc: 'Further reduces recast delay.',               baseCost: 1050,  max: 10, costMult: 1.3, tierOf: 'auto_hook_reload', parent: 'auto_hook_reload' },
  { id: 'fish_density',       name: 'DEEP BROADCAST I',  desc: 'Increases fish spawn rate.',                  baseCost: 30,    max: 10, costMult: 1.3, tierOf: 'fish_density', parent: 'auto_hook' },
  { id: 'fish_density_2',     name: 'DEEP BROADCAST II', desc: 'Further increases fish spawn rate.',          baseCost: 900,   max: 10, costMult: 1.3, tierOf: 'fish_density', parent: 'fish_density' },
  { id: 'fish_density_3',     name: 'DEEP BROADCAST III',desc: 'Even further increases fish spawn rate.',     baseCost: 27000, max: 10, costMult: 1.3, tierOf: 'fish_density', parent: 'fish_density_2' },
  { id: 'gold_boost',         name: 'GOLD BOOST I',      desc: '+5% gold per fish per level.',                baseCost: 50,    max: 10, costMult: 1.3, tierOf: 'gold_boost', parent: 'auto_hook' },
  { id: 'gold_boost_2',       name: 'GOLD BOOST II',     desc: '+5% gold per fish per level.',                baseCost: 1500,  max: 10, costMult: 1.3, tierOf: 'gold_boost', parent: 'gold_boost' },
  { id: 'luck_boost',         name: 'RARE FREQUENCY I',  desc: 'Increases rare fish, decreases common.',      baseCost: 75,    max: 10, costMult: 1.3, tierOf: 'luck_boost', parent: 'fish_density' },
  { id: 'luck_boost_2',       name: 'RARE FREQUENCY II', desc: 'Further increases rare fish spawns.',         baseCost: 2250,  max: 10, costMult: 1.3, tierOf: 'luck_boost', parent: 'luck_boost' },
  { id: 'legendary_slow',     name: 'DEPTH ANCHOR',      desc: 'Slows legendary fish by 15% per level.',      baseCost: 50000, max: 5, costMult: 2.0, parent: 'luck_boost_2' },
  { id: 'auto_sell',          name: 'AUTO SELL',         desc: 'Auto-sells caught fish. Toggle on/off.',      baseCost: 200,   max: 1,  parent: 'gold_boost' },

  // ── ABILITIES ─────────────────────────────────────────────
  { id: 'bait_bomb',        name: 'BAIT BOMB',        desc: 'Scatter bait to draw a frenzy of fish for 5s.',    baseCost: 800,   max: 1 },
  { id: 'bait_cooldown',    name: 'BAIT EFFICIENCY',  desc: 'Reduces bait cooldown by 30s.',                    baseCost: 600,   max: 5,  parent: 'bait_bomb' },
  { id: 'bait_strength',    name: 'BAIT POTENCY',     desc: 'Bait attracts +6 extra fish.',                     baseCost: 700,   max: 5,  parent: 'bait_bomb' },
  { id: 'multi_cast',       name: 'MULTI-CAST',       desc: 'Cast in 3 directions for 15s.',                    baseCost: 2000,  max: 1 },
  { id: 'multi_cooldown',   name: 'MULTI SPEED',      desc: 'Reduces multi-cast cooldown by 15s.',              baseCost: 1200,  max: 5,  parent: 'multi_cast' },
  { id: 'multi_duration',   name: 'MULTI EXTEND',     desc: '+3s multi-cast duration.',                         baseCost: 1100,  max: 5,  parent: 'multi_cast' },
  { id: 'multi_rods',       name: 'MULTI RODS',       desc: '+1 extra rod during multi-cast.',                  baseCost: 1500,  max: 4,  parent: 'multi_cast' },
  { id: 'auto_bait',        name: 'AUTO BAIT',        desc: 'Automatically uses Bait Bomb when off cooldown.',  baseCost: 150000,max: 1,  parent: 'bait_cooldown' },
  { id: 'auto_multi',       name: 'AUTO MULTI',       desc: 'Automatically uses Multi-Cast when off cooldown.', baseCost: 250000,max: 1,  parent: 'multi_cooldown' },

  // ── BLACK FISH ────────────────────────────────────────────
  { id: 'bf_spawn_rate',      name: 'DARK FREQUENCY',     desc: 'Increases black fish spawn rate.',                   baseCost: 100, max: 20, costMult: 1.2, tierOf: 'bf_spawn_rate' },
  { id: 'bf_spawn_rate_2',    name: 'DARK FREQUENCY II',  desc: 'Further increases black fish spawn rate.',           baseCost: 5000, max: 20, costMult: 1.2, tierOf: 'bf_spawn_rate', parent: 'bf_spawn_rate' },
  { id: 'bf_effect_duration', name: 'LINGERING DARKNESS', desc: 'Increases effect duration of black fish bonuses.',   baseCost: 250, max: 15, costMult: 1.2, tierOf: 'bf_effect_duration', parent: 'bf_spawn_rate' },
  { id: 'bf_sell_multiplier', name: 'SHADOW PROFIT',      desc: 'Increases sell value multiplier from black fish.',   baseCost: 300, max: 10, costMult: 1.2, tierOf: 'bf_sell_multiplier', parent: 'bf_spawn_rate' },
  { id: 'bf_frenzy_count',    name: 'DARK FRENZY',        desc: 'Increases fish spawned by Feeding Frenzy.',          baseCost: 350, max: 10, costMult: 1.2, tierOf: 'bf_frenzy_count', parent: 'bf_spawn_rate' },

  // ── NAVIGATION ────────────────────────────────────────────
  { id: 'atlas_access',     name: 'THE ATLAS',        desc: 'Chart the depths. Travel between zones.',        baseCost: 300,   max: 1 },
  { id: 'boat_access',      name: 'THE BOAT',         desc: 'Tune rod configuration and equipment.',          baseCost: 400,   max: 1,  parent: 'atlas_access' },
  { id: 'catalog_access',   name: 'THE CATALOG',      desc: 'Track every species encountered.',               baseCost: 600,   max: 1,  parent: 'atlas_access' },

  // ── SUBMARINE ────────────────────────────────────────────
  { id: 'submarine',        name: 'THE SUBMARINE',    desc: 'Control a submarine with WASD. The reel deploys from the sub.', baseCost: 5000, max: 1 },
];

// ═══════════════════════════════════════════════════════════════
//  BOSS DATA
// ═══════════════════════════════════════════════════════════════

const BOSSES = [
  null, // zone 0 has no boss gate (starting zone)
  { name: 'THE TIDE MOTHER',    hp: 50,    color: '#44aadd', size: 120, speed: 0,  oscillation: 1.0, desc: 'Guardian of the shallows.' },
  { name: 'THE SAND KING',      hp: 120,   color: '#ccaa44', size: 130, speed: 0,  oscillation: 1.2, desc: 'Buried lord of the sandbank.' },
  { name: 'THE CORAL WARDEN',   hp: 250,   color: '#cc55aa', size: 140, speed: 0,  oscillation: 1.4, desc: 'Ancient keeper of the reef.' },
  { name: 'THE SPRAWL HEART',   hp: 500,   color: '#ff6644', size: 150, speed: 0,  oscillation: 1.6, desc: 'The living core of the coral.' },
  { name: 'THE DUNE WYRM',      hp: 900,   color: '#ddaa44', size: 160, speed: 0,  oscillation: 1.8, desc: 'It sleeps beneath the sand.' },
  { name: 'THE FOREMAN PRIME',  hp: 1600,  color: '#8888aa', size: 170, speed: 0,  oscillation: 2.0, desc: 'The mine remembers its master.' },
  { name: 'THE APEX',           hp: 2800,  color: '#cc3333', size: 180, speed: 0,  oscillation: 2.3, desc: 'Ruler of the den. Unquestioned.' },
  { name: 'THE CITY GOD',       hp: 5000,  color: '#6688bb', size: 190, speed: 0,  oscillation: 2.6, desc: 'It built the city. It IS the city.' },
  { name: 'THE WALL ITSELF',    hp: 9000,  color: '#556677', size: 200, speed: 0,  oscillation: 3.0, desc: 'The final barrier. It breathes.' },
  { name: 'THE VOID MAW',       hp: 15000, color: '#4422aa', size: 210, speed: 0,  oscillation: 3.4, desc: 'Beyond the wall, something waits.' },
  { name: 'THE PASSAGE KEEPER', hp: 25000, color: '#338866', size: 200, speed: 0,  oscillation: 3.8, desc: 'It decides who passes.' },
  { name: 'THE SIREN QUEEN',    hp: 40000, color: '#cc44ff', size: 210, speed: 0,  oscillation: 4.2, desc: 'Her song rewrites reality.' },
  { name: 'THE TWILIGHT',       hp: 65000, color: '#553388', size: 220, speed: 0,  oscillation: 4.6, desc: 'The last light is fading.' },
  { name: 'THE BOTTOM FEEDER',  hp: 100000,color: '#222233', size: 240, speed: 0,  oscillation: 5.0, desc: 'There is nothing deeper.' },
];

function getHarpoonDamage() {
  const base = 5;
  return base + getUpgradeLevel('harpoon_damage') * 3;
}

function getHarpoonCastSpeed() {
  return 400 * (1 + getUpgradeLevel('harpoon_speed') * 0.06);
}

const BLEED_MULTIPLIERS = { COMMON: 0.03, UNCOMMON: 0.10, RARE: 0.40, EPIC: 1.5, LEGENDARY: 4.0 };
const BLEED_DISTANCE_PENALTY = 0.35; // multiplier for fish 2 zones away

// Progression unlock thresholds (total fish caught)
const PROGRESSION_THRESHOLDS = {
  AUTOMATION: 15,
  ABILITIES: 35,
  BLACK_FISH: 45,
  CONSUMABLES: 50,
  NAVIGATION: 60,
};

const UPGRADES_MAP = {};
for (const def of UPGRADES_DEF) UPGRADES_MAP[def.id] = def;
const CONSUMABLES_MAP = {};
for (const def of CONSUMABLES_DEF) CONSUMABLES_MAP[def.id] = def;

// Build tier groups: { baseId: [id1, id2, id3, ...] }
const TIER_GROUPS = {};
for (const def of UPGRADES_DEF) {
  if (def.tierOf) {
    if (!TIER_GROUPS[def.tierOf]) TIER_GROUPS[def.tierOf] = [];
    TIER_GROUPS[def.tierOf].push(def.id);
  }
}

function getUpgradeLevel(baseId) {
  const tiers = TIER_GROUPS[baseId];
  if (!tiers) return state.upgrades[baseId] || 0;
  let total = 0;
  for (const id of tiers) total += (state.upgrades[id] || 0);
  return total;
}

function getEffectiveMax(id) {
  const def = UPGRADES_MAP[id];
  if (!def) return 0;
  const base = def.max || 0;
  if (!def.tierOf) return base; // non-tiered upgrades don't get extra levels
  const extra = (state.prestige.upgrades.pearl_extra_tiers || 0) * 2;
  return base + extra;
}

// ═══════════════════════════════════════════════════════════════
//  ACHIEVEMENTS
// ═══════════════════════════════════════════════════════════════

const ACHIEVEMENTS = [
  {
    id: 'collect_20_fish', name: 'FIRST HAUL',
    desc: 'Collect 20 fish.',
    check: () => state.stats.totalCaught >= 20,
    reward: { gold: 100 },
    rewardDesc: '100 ✧',
  },
];

// ═══════════════════════════════════════════════════════════════
//  PRESTIGE UPGRADES
// ═══════════════════════════════════════════════════════════════

const PRESTIGE_UPGRADES_DEF = [
  { id: 'infinite_kelp',    name: 'THE INFINITE KELP',  desc: 'Unlocks the prestige tree.',              baseCost: 1,  max: 1 },
  { id: 'pearl_sell_boost', name: 'PEARL COATING',      desc: '+10% fish sell value per level.',         baseCost: 10, max: 10, costMult: 1.3, parent: 'infinite_kelp' },
  { id: 'pearl_rod_speed',  name: 'TIDAL FORCE',        desc: '+10% permanent rod speed per level.',     baseCost: 10, max: 10, costMult: 1.3, parent: 'infinite_kelp' },
  { id: 'pearl_spawn_rate', name: 'DEEP CURRENT',       desc: '+10% permanent fish spawn rate per level.',baseCost: 10, max: 10, costMult: 1.3, parent: 'infinite_kelp' },
  { id: 'pearl_extra_tiers', name: 'ABYSSAL MASTERY',   desc: '+2 max level to all tiered upgrades per level.', baseCost: 20, max: 5, costMult: 1.5, parent: 'infinite_kelp' },
  { id: 'pearl_blender',    name: 'THE BLENDER',        desc: 'Unlocks the Blender. Blend fish into pearls.', baseCost: 50, max: 1, parent: 'infinite_kelp' },
  // Submarine
  { id: 'pearl_sub_speed',  name: 'FASTER SUB',         desc: 'Increases submarine movement speed.',     baseCost: 100, max: 1, parent: 'infinite_kelp' },
  { id: 'pearl_zone_skip',       name: 'DEPTH CLEARANCE',     desc: 'Start with next zone unlocked after prestige. Skips boss.', baseCost: 20, max: 10, costMult: 10, parent: 'infinite_kelp' },
];

const PRESTIGE_UPGRADES_MAP = {};
for (const def of PRESTIGE_UPGRADES_DEF) PRESTIGE_UPGRADES_MAP[def.id] = def;

function prestigeUpgradeCost(id) {
  const def = PRESTIGE_UPGRADES_MAP[id];
  const level = state.prestige.upgrades[id] || 0;
  return Math.ceil(def.baseCost * Math.pow(def.costMult || 1, level));
}

function getPearlsForRun() {
  return Math.floor(state.totalGoldEarned / 10000);
}

function getPrestigeSellMultiplier() {
  return 1 + (state.prestige.upgrades.pearl_sell_boost || 0) * 0.1;
}

function getPrestigeRodSpeedMultiplier() {
  return 1 + (state.prestige.upgrades.pearl_rod_speed || 0) * 0.10;
}

function getPrestigeSpawnRateMultiplier() {
  return 1 / (1 + (state.prestige.upgrades.pearl_spawn_rate || 0) * 0.10);
}
