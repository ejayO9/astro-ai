import type { AstrologyChart, PlanetPosition } from "@/types/astrology"
import { logInfo, logDebug, logError } from "@/lib/logging-service"

// Planet significations and characteristics
export const PLANET_CHARACTERISTICS = {
  Sun: {
    nature: "Malefic",
    element: "Fire",
    gender: "Male",
    caste: "Kshatriya",
    significations: ["Soul", "Father", "Authority", "Government", "Vitality", "Leadership", "Ego", "Self-confidence"] as string[],
    friends: ["Moon", "Mars", "Jupiter"] as string[],
    enemies: ["Venus", "Saturn"] as string[],
    neutral: ["Mercury"] as string[],
    exaltationSign: "Aries",
    debilitationSign: "Libra",
    ownSigns: ["Leo"] as string[],
    moolTrikonaSign: "Leo",
    directionalStrength: 10, // 10th house
  },
  Moon: {
    nature: "Benefic",
    element: "Water",
    gender: "Female",
    caste: "Vaishya",
    significations: ["Mind", "Mother", "Emotions", "Public", "Water", "Comfort", "Nurturing", "Intuition"] as string[],
    friends: ["Sun", "Mercury"] as string[],
    enemies: [] as string[],
    neutral: ["Mars", "Jupiter", "Venus", "Saturn"] as string[],
    exaltationSign: "Taurus",
    debilitationSign: "Scorpio",
    ownSigns: ["Cancer"] as string[],
    moolTrikonaSign: "Taurus",
    directionalStrength: 4, // 4th house
  },
  Mars: {
    nature: "Malefic",
    element: "Fire",
    gender: "Male",
    caste: "Kshatriya",
    significations: ["Energy", "Courage", "Brothers", "Land", "Property", "Accidents", "Surgery", "Sports"] as string[],
    friends: ["Sun", "Moon", "Jupiter"] as string[],
    enemies: ["Mercury"] as string[],
    neutral: ["Venus", "Saturn"] as string[],
    exaltationSign: "Capricorn",
    debilitationSign: "Cancer",
    ownSigns: ["Aries", "Scorpio"] as string[],
    moolTrikonaSign: "Aries",
    directionalStrength: 10, // 10th house
  },
  Mercury: {
    nature: "Benefic",
    element: "Earth",
    gender: "Neutral",
    caste: "Vaishya",
    significations: ["Intelligence", "Communication", "Business", "Education", "Analysis", "Writing", "Mathematics"] as string[],
    friends: ["Sun", "Venus"] as string[],
    enemies: ["Moon"] as string[],
    neutral: ["Mars", "Jupiter", "Saturn"] as string[],
    exaltationSign: "Virgo",
    debilitationSign: "Pisces",
    ownSigns: ["Gemini", "Virgo"] as string[],
    moolTrikonaSign: "Virgo",
    directionalStrength: 1, // 1st house
  },
  Jupiter: {
    nature: "Benefic",
    element: "Ether",
    gender: "Male",
    caste: "Brahmin",
    significations: ["Wisdom", "Children", "Wealth", "Spirituality", "Teacher", "Knowledge", "Dharma", "Fortune"] as string[],
    friends: ["Sun", "Moon", "Mars"] as string[],
    enemies: ["Mercury", "Venus"] as string[],
    neutral: ["Saturn"] as string[],
    exaltationSign: "Cancer",
    debilitationSign: "Capricorn",
    ownSigns: ["Sagittarius", "Pisces"] as string[],
    moolTrikonaSign: "Sagittarius",
    directionalStrength: 1, // 1st house
  },
  Venus: {
    nature: "Benefic",
    element: "Water",
    gender: "Female",
    caste: "Brahmin",
    significations: ["Love", "Marriage", "Luxury", "Arts", "Vehicles", "Comforts", "Beauty", "Relationships"] as string[],
    friends: ["Mercury", "Saturn"] as string[],
    enemies: ["Sun", "Moon"] as string[],
    neutral: ["Mars", "Jupiter"] as string[],
    exaltationSign: "Pisces",
    debilitationSign: "Virgo",
    ownSigns: ["Taurus", "Libra"] as string[],
    moolTrikonaSign: "Libra",
    directionalStrength: 4, // 4th house
  },
  Saturn: {
    nature: "Malefic",
    element: "Air",
    gender: "Neutral",
    caste: "Shudra",
    significations: ["Discipline", "Delays", "Obstacles", "Longevity", "Hard work", "Service", "Sorrow", "Karma"] as string[],
    friends: ["Mercury", "Venus"] as string[],
    enemies: ["Sun", "Moon", "Mars"] as string[],
    neutral: ["Jupiter"] as string[],
    exaltationSign: "Libra",
    debilitationSign: "Aries",
    ownSigns: ["Capricorn", "Aquarius"] as string[],
    moolTrikonaSign: "Aquarius",
    directionalStrength: 7, // 7th house
  },
  Rahu: {
    nature: "Malefic",
    element: "Air",
    gender: "Neutral",
    caste: "Outcaste",
    significations: ["Obsession", "Foreign", "Innovation", "Materialism", "Confusion", "Illusion", "Technology"] as string[],
    friends: ["Venus", "Saturn"] as string[],
    enemies: ["Sun", "Moon", "Mars"] as string[],
    neutral: ["Mercury", "Jupiter"] as string[],
    exaltationSign: "Gemini",
    debilitationSign: "Sagittarius",
    ownSigns: [] as string[],
    moolTrikonaSign: "",
    directionalStrength: 0,
  },
  Ketu: {
    nature: "Malefic",
    element: "Fire",
    gender: "Neutral",
    caste: "Outcaste",
    significations: ["Spirituality", "Liberation", "Detachment", "Past life", "Mysticism", "Research", "Isolation"] as string[],
    friends: ["Mars", "Jupiter"] as string[],
    enemies: ["Sun", "Moon"] as string[],
    neutral: ["Mercury", "Venus", "Saturn"] as string[],
    exaltationSign: "Sagittarius",
    debilitationSign: "Gemini",
    ownSigns: [] as string[],
    moolTrikonaSign: "",
    directionalStrength: 0,
  },
}

// Sign characteristics
export const SIGN_CHARACTERISTICS = {
  Aries: {
    element: "Fire",
    quality: "Cardinal",
    ruler: "Mars",
    nature: "Movable",
    gender: "Male",
    direction: "East",
    bodyParts: ["Head", "Brain"],
    characteristics: ["Pioneering", "Impulsive", "Leadership", "Courage", "Independence"],
  },
  Taurus: {
    element: "Earth",
    quality: "Fixed",
    ruler: "Venus",
    nature: "Fixed",
    gender: "Female",
    direction: "South",
    bodyParts: ["Face", "Neck", "Throat"],
    characteristics: ["Stable", "Sensual", "Practical", "Stubborn", "Material"],
  },
  Gemini: {
    element: "Air",
    quality: "Mutable",
    ruler: "Mercury",
    nature: "Dual",
    gender: "Male",
    direction: "West",
    bodyParts: ["Arms", "Shoulders", "Lungs"],
    characteristics: ["Communicative", "Adaptable", "Curious", "Restless", "Intellectual"],
  },
  Cancer: {
    element: "Water",
    quality: "Cardinal",
    ruler: "Moon",
    nature: "Movable",
    gender: "Female",
    direction: "North",
    bodyParts: ["Chest", "Stomach", "Breasts"],
    characteristics: ["Nurturing", "Emotional", "Protective", "Intuitive", "Home-loving"],
  },
  Leo: {
    element: "Fire",
    quality: "Fixed",
    ruler: "Sun",
    nature: "Fixed",
    gender: "Male",
    direction: "East",
    bodyParts: ["Heart", "Back", "Spine"],
    characteristics: ["Creative", "Dramatic", "Generous", "Proud", "Leadership"],
  },
  Virgo: {
    element: "Earth",
    quality: "Mutable",
    ruler: "Mercury",
    nature: "Dual",
    gender: "Female",
    direction: "South",
    bodyParts: ["Intestines", "Digestive system"],
    characteristics: ["Analytical", "Perfectionist", "Service-oriented", "Practical", "Critical"],
  },
  Libra: {
    element: "Air",
    quality: "Cardinal",
    ruler: "Venus",
    nature: "Movable",
    gender: "Male",
    direction: "West",
    bodyParts: ["Kidneys", "Lower back"],
    characteristics: ["Balanced", "Diplomatic", "Artistic", "Harmonious", "Indecisive"],
  },
  Scorpio: {
    element: "Water",
    quality: "Fixed",
    ruler: "Mars",
    nature: "Fixed",
    gender: "Female",
    direction: "North",
    bodyParts: ["Reproductive organs", "Pelvis"],
    characteristics: ["Intense", "Secretive", "Transformative", "Passionate", "Mysterious"],
  },
  Sagittarius: {
    element: "Fire",
    quality: "Mutable",
    ruler: "Jupiter",
    nature: "Dual",
    gender: "Male",
    direction: "East",
    bodyParts: ["Thighs", "Hips"],
    characteristics: ["Philosophical", "Adventurous", "Optimistic", "Freedom-loving", "Spiritual"],
  },
  Capricorn: {
    element: "Earth",
    quality: "Cardinal",
    ruler: "Saturn",
    nature: "Movable",
    gender: "Female",
    direction: "South",
    bodyParts: ["Knees", "Bones"],
    characteristics: ["Ambitious", "Disciplined", "Practical", "Conservative", "Responsible"],
  },
  Aquarius: {
    element: "Air",
    quality: "Fixed",
    ruler: "Saturn",
    nature: "Fixed",
    gender: "Male",
    direction: "West",
    bodyParts: ["Calves", "Ankles"],
    characteristics: ["Innovative", "Humanitarian", "Independent", "Eccentric", "Progressive"],
  },
  Pisces: {
    element: "Water",
    quality: "Mutable",
    ruler: "Jupiter",
    nature: "Dual",
    gender: "Female",
    direction: "North",
    bodyParts: ["Feet", "Lymphatic system"],
    characteristics: ["Intuitive", "Compassionate", "Artistic", "Dreamy", "Spiritual"],
  },
} as const

// House significations
export const HOUSE_SIGNIFICATIONS = {
  1: {
    name: "Tanu Bhava",
    significations: ["Self", "Physical body", "Personality", "Overall health", "Beginnings", "Appearance"],
    naturalSign: "Aries",
    naturalRuler: "Mars",
    bodyParts: ["Head", "Brain", "Overall constitution"],
  },
  2: {
    name: "Dhana Bhava",
    significations: ["Wealth", "Family", "Speech", "Food", "Education", "Values", "Accumulated resources"],
    naturalSign: "Taurus",
    naturalRuler: "Venus",
    bodyParts: ["Face", "Eyes", "Mouth", "Teeth"],
  },
  3: {
    name: "Sahaja Bhava",
    significations: ["Courage", "Siblings", "Short journeys", "Communication", "Hobbies", "Skills", "Efforts"],
    naturalSign: "Gemini",
    naturalRuler: "Mercury",
    bodyParts: ["Arms", "Shoulders", "Hands"],
  },
  4: {
    name: "Sukha Bhava",
    significations: ["Mother", "Home", "Emotional well-being", "Property", "Vehicles", "Education", "Happiness"],
    naturalSign: "Cancer",
    naturalRuler: "Moon",
    bodyParts: ["Chest", "Heart", "Lungs"],
  },
  5: {
    name: "Putra Bhava",
    significations: ["Children", "Creativity", "Intelligence", "Romance", "Speculation", "Past merits", "Education"],
    naturalSign: "Leo",
    naturalRuler: "Sun",
    bodyParts: ["Heart", "Upper abdomen"],
  },
  6: {
    name: "Ripu Bhava",
    significations: ["Enemies", "Obstacles", "Illness", "Debts", "Service", "Competition", "Daily routine"],
    naturalSign: "Virgo",
    naturalRuler: "Mercury",
    bodyParts: ["Intestines", "Digestive system"],
  },
  7: {
    name: "Kalatra Bhava",
    significations: ["Marriage", "Partnerships", "Business", "Foreign travel", "Public relations", "Spouse"],
    naturalSign: "Libra",
    naturalRuler: "Venus",
    bodyParts: ["Kidneys", "Lower back"],
  },
  8: {
    name: "Ayur Bhava",
    significations: ["Longevity", "Hidden knowledge", "Inheritance", "Accidents", "Transformation", "Occult"],
    naturalSign: "Scorpio",
    naturalRuler: "Mars",
    bodyParts: ["Reproductive organs", "Excretory system"],
  },
  9: {
    name: "Dharma Bhava",
    significations: ["Fortune", "Higher education", "Spirituality", "Father", "Long journeys", "Dharma", "Luck"],
    naturalSign: "Sagittarius",
    naturalRuler: "Jupiter",
    bodyParts: ["Thighs", "Hips"],
  },
  10: {
    name: "Karma Bhava",
    significations: ["Career", "Authority", "Reputation", "Government", "Fame", "Status", "Profession"],
    naturalSign: "Capricorn",
    naturalRuler: "Saturn",
    bodyParts: ["Knees", "Joints"],
  },
  11: {
    name: "Labha Bhava",
    significations: ["Income", "Gains", "Social networks", "Elder siblings", "Aspirations", "Friends", "Profits"],
    naturalSign: "Aquarius",
    naturalRuler: "Saturn",
    bodyParts: ["Calves", "Ankles"],
  },
  12: {
    name: "Vyaya Bhava",
    significations: ["Losses", "Expenses", "Spiritual liberation", "Isolation", "Foreign residence", "Moksha"],
    naturalSign: "Pisces",
    naturalRuler: "Jupiter",
    bodyParts: ["Feet", "Left eye"],
  },
} as const

// Planetary position analysis result
export interface PlanetaryPositionAnalysis {
  planet: string
  house: number
  sign: string
  degree: number
  nakshatra: string
  nakshatraPada: number
  isRetrograde: boolean
  dignity: "Exalted" | "Own Sign" | "Mool Trikona" | "Friend's Sign" | "Neutral" | "Enemy's Sign" | "Debilitated"
  strength: "Very Strong" | "Strong" | "Average" | "Weak" | "Very Weak"
  signCharacteristics: (typeof SIGN_CHARACTERISTICS)[keyof typeof SIGN_CHARACTERISTICS]
  houseSignifications: (typeof HOUSE_SIGNIFICATIONS)[keyof typeof HOUSE_SIGNIFICATIONS]
  planetCharacteristics: (typeof PLANET_CHARACTERISTICS)[keyof typeof PLANET_CHARACTERISTICS]
  interpretation: string
  effects: string[]
  remedies: string[]
}

// House occupancy analysis
export interface HouseOccupancyAnalysis {
  house: number
  sign: string
  planets: string[]
  isEmpty: boolean
  houseStrength: "Very Strong" | "Strong" | "Average" | "Weak" | "Very Weak"
  signCharacteristics: (typeof SIGN_CHARACTERISTICS)[keyof typeof SIGN_CHARACTERISTICS]
  houseSignifications: (typeof HOUSE_SIGNIFICATIONS)[keyof typeof HOUSE_SIGNIFICATIONS]
  interpretation: string
  effects: string[]
}

// --- BEGIN PLANET-IN-HOUSE SIGNIFICANCE MAP ---
// Use Record<string, Record<number, string>> for flexible typing
const PLANET_HOUSE_SIGNIFICANCE: Record<string, Record<number, string>> = {
  Sun: {
    1: "Strong willpower, leadership, authoritative personality. Weak Sun can cause low immunity or ego issues.",
    2: "Wealth through government/politics, strong speech, strained family ties.",
    3: "Courageous siblings, success in media/sports, short travels.",
    4: "Property disputes, strained mother relationship, frequent relocations.",
    5: "Intelligent children, leadership in creative fields, speculative gains.",
    6: "Victory over enemies, health-conscious, government job benefits.",
    7: "Dominant spouse, legal partnerships, possible divorce if afflicted.",
    8: "Longevity struggles, inheritance delays, interest in occult.",
    9: "Strong dharma, father's influence, foreign connections.",
    10: "Fame, political success, career recognition.",
    11: "Gains through authority figures, influential friends.",
    12: "Expenses on prestige, spiritual retreats, foreign stays."
  },
  Moon: {
    1: "Emotional, intuitive, fluctuating health (digestive issues).",
    2: "Wealth through liquids (milk, oil), sweet speech, family bonds.",
    3: "Creative siblings, writing talent, short journeys.",
    4: "Happy home, inheritance, strong motherly love.",
    5: "Fertility, artistic children, success in creative arts.",
    6: "Healing abilities, victory in disputes, dietary habits affect health.",
    7: "Attractive spouse, moody relationships, business partnerships.",
    8: "Emotional trauma, psychic sensitivity, inheritance delays.",
    9: "Pilgrimages, spiritual mother, foreign connections.",
    10: "Public recognition in arts/medicine, fluctuating career.",
    11: "Gains through women/mother figures, social popularity.",
    12: "Interest in dreams/psychology, solitude, hospital visits."
  },
  Mars: {
    1: "Aggressive, athletic, prone to injuries/accidents.",
    2: "Wealth through engineering/military, sharp speech, family disputes.",
    3: "Courageous, competitive siblings, success in sports.",
    4: "Property disputes, restless mind, frequent relocations.",
    5: "Passionate love affairs, sports-loving children.",
    6: "Strong immunity, success over enemies, surgical profession.",
    7: "Fiery spouse, legal battles in marriage, business conflicts.",
    8: "Accidental risks, interest in surgery/occult.",
    9: "Warrior spirit, interest in martial arts, foreign travel.",
    10: "Career in defense/engineering, authoritative position.",
    11: "Gains through courage/competition, influential friends.",
    12: "Hospitalization, secret enemies, interest in weapons."
  },
  Mercury: {
    1: "Intelligent, witty, nervous energy, youthful appearance.",
    2: "Wealth through writing/trading, multilingual skills.",
    3: "Journalistic talent, communicative siblings, short trips.",
    4: "Education-focused family, multiple properties, vehicle interest.",
    5: "Brilliant children, success in astrology/mathematics.",
    6: "Success in debates, health writing (medical reports).",
    7: "Business partnerships, youthful spouse, legal agreements.",
    8: "Interest in mysteries, research skills, sudden gains/losses.",
    9: "Philosophical mind, higher education, foreign languages.",
    10: "Career in media/IT, fame through communication.",
    11: "Gains through networking, tech-related income.",
    12: "Interest in subconscious mind, writing in isolation."
  },
  Jupiter: {
    1: "Optimistic, wise, respected, spiritual growth.",
    2: "Wealth through teaching/priesthood, family values.",
    3: "Scholarly siblings, success in publishing, short pilgrimages.",
    4: "Happy home, ancestral property, mother's wisdom.",
    5: "Blessed with children, spiritual wisdom, teaching success.",
    6: "Victory in legal matters, healing profession.",
    7: "Wise spouse, harmonious marriage, consultancy income.",
    8: "Interest in metaphysics, inheritance after delays.",
    9: "Strong dharma, guru blessings, foreign travel.",
    10: "Career in law/religion, social respect.",
    11: "Gains through mentors, charitable income.",
    12: "Philanthropy, spiritual liberation, foreign stays."
  },
  Venus: {
    1: "Charming, artistic, beauty-conscious, luxury-loving.",
    2: "Wealth through arts/music, melodious voice.",
    3: "Creative siblings, success in performing arts.",
    4: "Luxurious home, artistic mother, vehicle collection.",
    5: "Romantic relationships, artistic children.",
    6: "Beauty-related health issues, success in fashion.",
    7: "Harmonious marriage, attractive spouse, business partnerships.",
    8: "Secret affairs, inheritance through spouse.",
    9: "Artistic guru, foreign spouse, luxury travel.",
    10: "Career in arts/entertainment, fame through beauty.",
    11: "Gains through arts, influential social circle.",
    12: "Secret relationships, indulgence in bed pleasures."
  },
  Saturn: {
    1: "Disciplined, reserved, delays in early life.",
    2: "Slow wealth accumulation, frugal speech.",
    3: "Hardworking siblings, delayed communication skills.",
    4: "Emotional detachment from family, property struggles.",
    5: "Few/delayed children, interest in serious studies.",
    6: "Success over enemies, health discipline.",
    7: "Delayed marriage, older/spouse with responsibilities.",
    8: "Longevity struggles, interest in occult.",
    9: "Late spiritual growth, foreign struggles.",
    10: "Late-career success, authority through hard work.",
    11: "Gains after struggles, influential elder friends.",
    12: "Isolation, meditation, karmic liberation."
  },
  Rahu: {
    1: "Unconventional identity, fame/notoriety.",
    2: "Wealth through unconventional means, speech controversies.",
    3: "Innovative siblings, success in technology.",
    4: "Unstable home, foreign property.",
    5: "Unconventional children, speculative gains.",
    6: "Victory through strategy, hidden enemies.",
    7: "Unusual partnerships, foreign spouse.",
    8: "Occult interests, sudden gains/losses.",
    9: "Unconventional guru, foreign connections.",
    10: "Fame through controversy, tech career.",
    11: "Sudden gains, influential but manipulative friends.",
    12: "Secretive, interest in alien/UFO topics."
  },
  Ketu: {
    1: "Detached, spiritual, health mysteries.",
    2: "Non-materialistic, speech hurdles.",
    3: "Few siblings, introverted communication.",
    4: "Emotional detachment from family.",
    5: "Few children, past-life spiritual wisdom.",
    6: "Hidden enemies, healing abilities.",
    7: "Karmic marriage, solitude in relationships.",
    8: "Psychic abilities, past-life trauma.",
    9: "Sudden spiritual awakening.",
    10: "Unconventional career, fame in metaphysics.",
    11: "Sudden losses/gains, detached from desires.",
    12: "Enlightenment, monastic tendencies."
  },
}
// --- END PLANET-IN-HOUSE SIGNIFICANCE MAP ---

// --- BEGIN HOUSE LORD PLACEMENT SIGNIFICANCE MAP ---
// Maps house lords placed in different houses (e.g., 1st lord in 7th house)
export const HOUSE_LORD_PLACEMENT_SIGNIFICANCE: Record<number, Record<number, { effect: string; reference: string }>> = {
  1: { // 1st House Lord (Ascendant Lord) in All 12 Houses
    1: { effect: "Strong self-identity, good health, leadership qualities.", reference: "Brihat Parashara Hora Shastra (BPHS) 4.1" },
    2: { effect: "Wealth through self-effort, strong speech, family support.", reference: "Phaladeepika 6.3" },
    3: { effect: "Courageous, communicative, gains through siblings.", reference: "Jataka Parijata 4.12" },
    4: { effect: "Strong roots, property gains, emotional stability.", reference: "BPHS 4.4" },
    5: { effect: "Creative, intelligent, good relationship with children.", reference: "Saravali 25.5" },
    6: { effect: "Health struggles, but strong ability to overcome enemies.", reference: "Phaladeepika 6.6" },
    7: { effect: "Marriage-focused, partnerships shape identity.", reference: "BPHS 4.7" },
    8: { effect: "Longevity issues, interest in occult, transformative life.", reference: "Jataka Parijata 4.8" },
    9: { effect: "Spiritual, fortunate, long-distance travel.", reference: "Saravali 25.9" },
    10: { effect: "Career-driven, public recognition.", reference: "BPHS 4.10" },
    11: { effect: "Gains through social networks, ambitious.", reference: "Phaladeepika 6.11" },
    12: { effect: "Foreign connections, solitude, possible expenses.", reference: "BPHS 4.12" }
  },
  2: { // 2nd House Lord (Wealth, Speech, Family) in All 12 Houses
    1: { effect: "Wealth through self, articulate speaker.", reference: "BPHS 5.1" },
    2: { effect: "Strong finances, family inheritance.", reference: "Phaladeepika 7.2" },
    3: { effect: "Earnings through writing, communication.", reference: "Jataka Parijata 5.3" },
    4: { effect: "Property gains, family wealth.", reference: "BPHS 5.4" },
    5: { effect: "Gains from speculation, children bring wealth.", reference: "Saravali 26.5" },
    6: { effect: "Debts, legal disputes over money.", reference: "Phaladeepika 7.6" },
    7: { effect: "Wealth through marriage or partnerships.", reference: "BPHS 5.7" },
    8: { effect: "Sudden gains/losses, inheritance issues.", reference: "Jataka Parijata 5.8" },
    9: { effect: "Fortune through spirituality or foreign sources.", reference: "Saravali 26.9" },
    10: { effect: "Earnings through career, public reputation.", reference: "BPHS 5.10" },
    11: { effect: "High income, financial growth.", reference: "Phaladeepika 7.11" },
    12: { effect: "Expenditures, donations, foreign income.", reference: "BPHS 5.12" }
  },
  3: { // 3rd House Lord (Siblings, Communication, Courage) in All 12 Houses
    1: { effect: "Strong communication skills, courageous, independent.", reference: "BPHS 6.1, Phaladeepika 8.1" },
    2: { effect: "Wealth through writing/speaking, good family relations.", reference: "Jataka Parijata 6.2" },
    3: { effect: "Strong siblings, adventurous, good at negotiations.", reference: "BPHS 6.3" },
    4: { effect: "Happy home life, property gains through siblings.", reference: "Saravali 27.4" },
    5: { effect: "Creative writing, intelligent children, speculative gains.", reference: "Phaladeepika 8.5" },
    6: { effect: "Sibling rivalry, legal disputes, but victory over enemies.", reference: "BPHS 6.6" },
    7: { effect: "Business partnerships, spouse helps in communication.", reference: "Jataka Parijata 6.7" },
    8: { effect: "Sibling health issues, interest in occult writing.", reference: "Saravali 27.8" },
    9: { effect: "Long-distance travel for education, philosophical mind.", reference: "BPHS 6.9" },
    10: { effect: "Career in media/writing, public speaking success.", reference: "Phaladeepika 8.10" },
    11: { effect: "Gains through networking, supportive siblings.", reference: "Jataka Parijata 6.11" },
    12: { effect: "Foreign connections, secretive writing, losses in communication.", reference: "BPHS 6.12" }
  },
  4: { // 4th House Lord (Home, Mother, Property) in All 12 Houses
    1: { effect: "Strong attachment to home, mother's influence on personality.", reference: "BPHS 7.1, Phaladeepika 9.1" },
    2: { effect: "Wealth through property, family support.", reference: "Jataka Parijata 7.2" },
    3: { effect: "Short-distance property investments, siblings help with home.", reference: "Saravali 28.3" },
    4: { effect: "Strong roots, multiple properties, emotional stability.", reference: "BPHS 7.4" },
    5: { effect: "Emotional creativity, property gains through children.", reference: "Phaladeepika 9.5" },
    6: { effect: "Property disputes, health issues for mother.", reference: "Jataka Parijata 7.6" },
    7: { effect: "Spouse brings property, home away from birthplace.", reference: "Saravali 28.7" },
    8: { effect: "Inheritance issues, hidden property matters.", reference: "BPHS 7.8" },
    9: { effect: "Foreign property, mother's spiritual influence.", reference: "Phaladeepika 9.9" },
    10: { effect: "Career in real estate, home near workplace.", reference: "Jataka Parijata 7.10" },
    11: { effect: "Gains through property, mother's support in finances.", reference: "Saravali 28.11" },
    12: { effect: "Property abroad, detachment from home, losses in real estate.", reference: "BPHS 7.12" }
  },
  5: { // 5th House Lord (Children, Creativity, Intelligence) in All 12 Houses
    1: { effect: "Intelligent, creative, strong connection with children.", reference: "BPHS 8.1, Phaladeepika 10.1" },
    2: { effect: "Wealth through creativity, good speech.", reference: "Jataka Parijata 8.2" },
    3: { effect: "Creative writing, courageous children.", reference: "Saravali 29.3" },
    4: { effect: "Happy home with children, property gains through creativity.", reference: "BPHS 8.4" },
    5: { effect: "Highly intelligent, fortunate with children, artistic success.", reference: "Phaladeepika 10.5" },
    6: { effect: "Challenges with children, health issues, but wins in speculation.", reference: "Jataka Parijata 8.6" },
    7: { effect: "Romantic relationships, spouse supports creativity.", reference: "Saravali 29.7" },
    8: { effect: "Sudden gains/losses in speculation, hidden talents.", reference: "BPHS 8.8" },
    9: { effect: "Spiritual intelligence, children bring fortune.", reference: "Phaladeepika 10.9" },
    10: { effect: "Career in arts/education, fame through creativity.", reference: "Jataka Parijata 8.10" },
    11: { effect: "Gains through investments, children bring prosperity.", reference: "Saravali 29.11" },
    12: { effect: "Foreign connections for children, losses in speculation.", reference: "BPHS 8.12" }
  },
  6: { // 6th House Lord (Health, Enemies, Debts) in All 12 Houses
    1: { effect: "Health struggles, but strong ability to fight enemies.", reference: "BPHS 9.1, Phaladeepika 11.1" },
    2: { effect: "Wealth through service, speech-related disputes.", reference: "Jataka Parijata 9.2" },
    3: { effect: "Courage in legal battles, sibling rivalry.", reference: "Saravali 30.3" },
    4: { effect: "Domestic disputes, health issues at home.", reference: "BPHS 9.4" },
    5: { effect: "Children's health issues, speculative losses.", reference: "Phaladeepika 11.5" },
    6: { effect: "Strong immunity, success over enemies.", reference: "Jataka Parijata 9.6" },
    7: { effect: "Marital disputes, spouse with health issues.", reference: "Saravali 30.7" },
    8: { effect: "Chronic illnesses, legal battles over inheritance.", reference: "BPHS 9.8" },
    9: { effect: "Legal issues in foreign lands, health recovery.", reference: "Phaladeepika 11.9" },
    10: { effect: "Career in law/medicine, overcoming professional rivals.", reference: "Jataka Parijata 9.10" },
    11: { effect: "Gains through litigation, but hidden enemies.", reference: "Saravali 30.11" },
    12: { effect: "Hospitalization, foreign legal issues, secret enemies.", reference: "BPHS 9.12" }
  },
  7: { // 7th House Lord (Marriage, Partnerships) in All 12 Houses
    1: { effect: "Marriage shapes identity, spouse influences personality.", reference: "BPHS 10.1, Phaladeepika 12.1" },
    2: { effect: "Wealth through spouse, family-oriented partnerships.", reference: "Jataka Parijata 10.2" },
    3: { effect: "Spouse is communicative, business partnerships with siblings.", reference: "Saravali 31.3" },
    4: { effect: "Spouse from hometown, happy domestic life.", reference: "BPHS 10.4" },
    5: { effect: "Romantic marriage, creative partnerships.", reference: "Phaladeepika 12.5" },
    6: { effect: "Marital disputes, health issues in spouse.", reference: "Jataka Parijata 10.6" },
    7: { effect: "Strong marriage, balanced partnerships.", reference: "Saravali 31.7" },
    8: { effect: "Marital challenges, sudden events in partnerships.", reference: "BPHS 10.8" },
    9: { effect: "Spouse from foreign culture, fortunate alliances.", reference: "Phaladeepika 12.9" },
    10: { effect: "Career through partnerships, spouse helps professionally.", reference: "Jataka Parijata 10.10" },
    11: { effect: "Gains through marriage, social network benefits.", reference: "Saravali 31.11" },
    12: { effect: "Secret relationships, spouse may live abroad.", reference: "BPHS 10.12" }
  },
  8: { // 8th House Lord (Transformation, Occult, Inheritance) in All 12 Houses
    1: { effect: "Intense personality, interest in mysteries, health fluctuations.", reference: "BPHS 11.1, Phaladeepika 13.1" },
    2: { effect: "Sudden wealth changes, inheritance issues.", reference: "Jataka Parijata 11.2" },
    3: { effect: "Courage in crises, occult writing skills.", reference: "Saravali 32.3" },
    4: { effect: "Property disputes, hidden family matters.", reference: "BPHS 11.4" },
    5: { effect: "Sudden gains/losses in speculation, psychic children.", reference: "Phaladeepika 13.5" },
    6: { effect: "Victory over hidden enemies, health research.", reference: "Jataka Parijata 11.6" },
    7: { effect: "Transformative marriage, spouse with occult interests.", reference: "Saravali 32.7" },
    8: { effect: "Deep spiritual transformation, inheritance.", reference: "BPHS 11.8" },
    9: { effect: "Sudden foreign travel, occult philosophy.", reference: "Phaladeepika 13.9" },
    10: { effect: "Career in research/occult, sudden fame.", reference: "Jataka Parijata 11.10" },
    11: { effect: "Sudden gains, inheritance from friends.", reference: "Saravali 32.11" },
    12: { effect: "Mystical experiences, losses with hidden benefits.", reference: "BPHS 11.12" }
  },
  9: { // 9th House Lord (Fortune, Spirituality, Long Travel) in All 12 Houses
    1: { effect: "Naturally fortunate, philosophical, respected.", reference: "BPHS 12.1, Phaladeepika 14.1" },
    2: { effect: "Wealth through luck, spiritual speech.", reference: "Jataka Parijata 12.2" },
    3: { effect: "Courage through faith, writing on philosophy.", reference: "Saravali 33.3" },
    4: { effect: "Family blessings, property through luck.", reference: "BPHS 12.4" },
    5: { effect: "Wise children, fortune in speculation.", reference: "Phaladeepika 14.5" },
    6: { effect: "Overcoming legal issues through faith.", reference: "Jataka Parijata 12.6" },
    7: { effect: "Fortunate marriage, spouse from abroad.", reference: "Saravali 33.7" },
    8: { effect: "Sudden spiritual awakening, inheritance disputes.", reference: "BPHS 12.8" },
    9: { effect: "Highly spiritual, long-distance travel, guru blessings.", reference: "Phaladeepika 14.9" },
    10: { effect: "Career in law/religion, fame through wisdom.", reference: "Jataka Parijata 12.10" },
    11: { effect: "Gains through spirituality, network of gurus.", reference: "Saravali 33.11" },
    12: { effect: "Foreign spiritual journeys, monastic tendencies.", reference: "BPHS 12.12" }
  },
  10: { // 10th House Lord (Career, Reputation) in All 12 Houses
    1: { effect: "Career defines identity, self-made success.", reference: "BPHS 13.1, Phaladeepika 15.1" },
    2: { effect: "Wealth through profession, authoritative speech.", reference: "Jataka Parijata 13.2" },
    3: { effect: "Career in media/writing, courageous leadership.", reference: "Saravali 34.3" },
    4: { effect: "Work from home, real estate profession.", reference: "BPHS 13.4" },
    5: { effect: "Creative career, teaching/entertainment success.", reference: "Phaladeepika 15.5" },
    6: { effect: "Service-oriented career, overcoming rivals.", reference: "Jataka Parijata 13.6" },
    7: { effect: "Business partnerships, spouse aids career.", reference: "Saravali 34.7" },
    8: { effect: "Sudden career changes, research/occult profession.", reference: "BPHS 13.8" },
    9: { effect: "Career abroad, teaching/law profession.", reference: "Phaladeepika 15.9" },
    10: { effect: "Strong professional success, high authority.", reference: "Jataka Parijata 13.10" },
    11: { effect: "Gains through career, influential network.", reference: "Saravali 34.11" },
    12: { effect: "Career in foreign lands, behind-the-scenes work.", reference: "BPHS 13.12" }
  },
  11: { // 11th House Lord (Gains, Friends, Aspirations) in All 12 Houses
    1: { effect: "Socially connected, gains through personality.", reference: "BPHS 14.1, Phaladeepika 16.1" },
    2: { effect: "Wealth through networks, supportive friends.", reference: "Jataka Parijata 14.2" },
    3: { effect: "Gains through communication, entrepreneurial siblings.", reference: "Saravali 35.3" },
    4: { effect: "Property through friends, happy social circle.", reference: "BPHS 14.4" },
    5: { effect: "Gains from creativity, children bring prosperity.", reference: "Phaladeepika 16.5" },
    6: { effect: "Profits from litigation, health-related income.", reference: "Jataka Parijata 14.6" },
    7: { effect: "Gains through marriage, spouse's network helps.", reference: "Saravali 35.7" },
    8: { effect: "Sudden gains, inheritance from friends.", reference: "BPHS 14.8" },
    9: { effect: "Foreign income, spiritual community support.", reference: "Phaladeepika 16.9" },
    10: { effect: "Career gains, influential professional network.", reference: "Jataka Parijata 14.10" },
    11: { effect: "High financial success, fulfilled desires.", reference: "Saravali 35.11" },
    12: { effect: "Foreign gains, charitable donations.", reference: "BPHS 14.12" }
  },
  12: { // 12th House Lord (Losses, Spirituality, Foreign) in All 12 Houses
    1: { effect: "Solitary nature, spiritual pursuits, health expenses.", reference: "BPHS 15.1, Phaladeepika 17.1" },
    2: { effect: "Expenditures on family, wealth through foreign sources.", reference: "Jataka Parijata 15.2" },
    3: { effect: "Secretive communication, foreign travel for siblings.", reference: "Saravali 36.3" },
    4: { effect: "Property abroad, detachment from home.", reference: "BPHS 15.4" },
    5: { effect: "Creative solitude, children may live abroad.", reference: "Phaladeepika 17.5" },
    6: { effect: "Legal losses, but hidden victories.", reference: "Jataka Parijata 15.6" },
    7: { effect: "Marriage to foreigner, secret relationships.", reference: "Saravali 36.7" },
    8: { effect: "Occult interests, karmic losses.", reference: "BPHS 15.8" },
    9: { effect: "Spiritual foreign travel, monastic life.", reference: "Phaladeepika 17.9" },
    10: { effect: "Career abroad, behind-the-scenes fame.", reference: "Jataka Parijata 15.10" },
    11: { effect: "Gains from foreign sources, but expenses on friends.", reference: "Saravali 36.11" },
    12: { effect: "Strong spiritual life, liberation, foreign residence.", reference: "BPHS 15.12" }
  }
}
// --- END HOUSE LORD PLACEMENT SIGNIFICANCE MAP ---

/**
 * Get the significance of a house lord placed in a specific house
 * @param lordOfHouse - Which house's lord (1-12)
 * @param placedInHouse - Which house the lord is placed in (1-12)
 * @returns Object with effect and reference
 */
export function getHouseLordPlacementSignificance(lordOfHouse: number, placedInHouse: number): { effect: string; reference: string } | null {
  const lordData = HOUSE_LORD_PLACEMENT_SIGNIFICANCE[lordOfHouse];
  if (!lordData) return null;
  
  const placement = lordData[placedInHouse];
  return placement || null;
}

/**
 * Determines the dignity of a planet in a given sign
 */
function determinePlanetDignity(planet: string, sign: string): PlanetaryPositionAnalysis["dignity"] {
  const planetChar = PLANET_CHARACTERISTICS[planet as keyof typeof PLANET_CHARACTERISTICS]

  if (!planetChar) return "Neutral"

  if (planetChar.exaltationSign === sign) return "Exalted"
  if (planetChar.debilitationSign === sign) return "Debilitated"
  if (planetChar.ownSigns.includes(sign)) return "Own Sign"
  if (planetChar.moolTrikonaSign === sign) return "Mool Trikona"

  // Check friendship
  const signRuler = Object.entries(SIGN_CHARACTERISTICS).find(([signName]) => signName === sign)?.[1]?.ruler
  if (signRuler && planetChar.friends.includes(signRuler)) return "Friend's Sign"
  if (signRuler && planetChar.enemies.includes(signRuler)) return "Enemy's Sign"

  return "Neutral"
}

/**
 * Determines the overall strength of a planet based on various factors
 */
function determinePlanetStrength(
  planet: string,
  sign: string,
  house: number,
  isRetrograde: boolean,
): PlanetaryPositionAnalysis["strength"] {
  const dignity = determinePlanetDignity(planet, sign)
  const planetChar = PLANET_CHARACTERISTICS[planet as keyof typeof PLANET_CHARACTERISTICS]

  let strengthScore = 0

  // Dignity scoring
  switch (dignity) {
    case "Exalted":
      strengthScore += 5
      break
    case "Mool Trikona":
      strengthScore += 4
      break
    case "Own Sign":
      strengthScore += 3
      break
    case "Friend's Sign":
      strengthScore += 2
      break
    case "Neutral":
      strengthScore += 1
      break
    case "Enemy's Sign":
      strengthScore -= 1
      break
    case "Debilitated":
      strengthScore -= 3
      break
  }

  // Directional strength
  if (planetChar && planetChar.directionalStrength === house) {
    strengthScore += 2
  }

  // Retrograde consideration (can be both positive and negative)
  if (isRetrograde && planet !== "Sun" && planet !== "Moon" && planet !== "Rahu" && planet !== "Ketu") {
    strengthScore += 1 // Retrograde planets often gain strength
  }

  // Convert score to strength category
  if (strengthScore >= 6) return "Very Strong"
  if (strengthScore >= 3) return "Strong"
  if (strengthScore >= 0) return "Average"
  if (strengthScore >= -2) return "Weak"
  return "Very Weak"
}

/**
 * Generates interpretation for a planet's position
 */
function generatePlanetInterpretation(
  planet: string,
  house: number,
  sign: string,
  dignity: string,
  strength: string,
): string {
  const planetChar = PLANET_CHARACTERISTICS[planet as keyof typeof PLANET_CHARACTERISTICS]
  const houseInfo = HOUSE_SIGNIFICATIONS[house as keyof typeof HOUSE_SIGNIFICATIONS]
  const signChar = SIGN_CHARACTERISTICS[sign as keyof typeof SIGN_CHARACTERISTICS]

  if (!planetChar || !houseInfo || !signChar) {
    return `${planet} in ${sign} in the ${house}th house.`
  }

  let interpretation = `${planet} in ${sign} in the ${house}th house (${houseInfo.name}) `

  // Add dignity information
  switch (dignity) {
    case "Exalted":
      interpretation += `is exalted, giving excellent results. `
      break
    case "Own Sign":
      interpretation += `is in its own sign, providing strong and favorable results. `
      break
    case "Mool Trikona":
      interpretation += `is in its Mool Trikona sign, giving very good results. `
      break
    case "Friend's Sign":
      interpretation += `is in a friendly sign, providing good results. `
      break
    case "Debilitated":
      interpretation += `is debilitated, which may create challenges that lead to growth. `
      break
    case "Enemy's Sign":
      interpretation += `is in an enemy's sign, which may create some difficulties. `
      break
    default:
      interpretation += `is neutrally placed. `
  }

  // Add house-specific effects
  interpretation += `This placement influences ${houseInfo.significations.slice(0, 3).join(", ")} in your life. `

  // Add sign characteristics
  interpretation += `The ${signChar.element} element and ${signChar.characteristics.slice(0, 2).join(", ")} nature of ${sign} `
  interpretation += `colors how ${planet}'s energy of ${planetChar.significations.slice(0, 2).join(" and ")} manifests.`

  return interpretation
}

/**
 * Generates effects for a planet's position
 */
function generatePlanetEffects(
  planet: string,
  house: number,
  sign: string,
  dignity: string,
  strength: string,
): string[] {
  const effects: string[] = []
  const planetChar = PLANET_CHARACTERISTICS[planet as keyof typeof PLANET_CHARACTERISTICS]
  const houseInfo = HOUSE_SIGNIFICATIONS[house as keyof typeof HOUSE_SIGNIFICATIONS]

  if (!planetChar || !houseInfo) return effects

  // Positive effects based on strength and dignity
  if (strength === "Very Strong" || strength === "Strong") {
    effects.push(
      `Enhanced ${planetChar.significations[0].toLowerCase()} and ${planetChar.significations[1].toLowerCase()}`,
    )
    effects.push(`Favorable outcomes in ${houseInfo.significations[0].toLowerCase()}`)
  }

  // House-specific effects
  switch (house) {
    case 1:
      effects.push(`Strong personality traits related to ${planet}`)
      break
    case 2:
      effects.push(`${planet}'s influence on wealth and family matters`)
      break
    case 4:
      effects.push(`${planet}'s impact on home and emotional well-being`)
      break
    case 7:
      effects.push(`${planet}'s influence on partnerships and marriage`)
      break
    case 10:
      effects.push(`${planet}'s impact on career and reputation`)
      break
  }

  // Challenging effects for weak planets
  if (strength === "Weak" || strength === "Very Weak") {
    effects.push(`May need extra effort in areas related to ${planetChar.significations[0].toLowerCase()}`)
  }

  return effects
}

/**
 * Generates remedies for a planet based on its position and strength
 */
function generatePlanetRemedies(planet: string, strength: string, dignity: string): string[] {
  const remedies: string[] = []

  // Only suggest remedies for weak or challenging positions
  if (strength === "Weak" || strength === "Very Weak" || dignity === "Debilitated" || dignity === "Enemy's Sign") {
    switch (planet) {
      case "Sun":
        remedies.push("Offer water to the Sun every morning")
        remedies.push("Recite Aditya Hridayam or Om Suryaya Namaha")
        remedies.push("Wear ruby or red coral (after consultation)")
        break
      case "Moon":
        remedies.push("Offer milk to Shiva on Mondays")
        remedies.push("Recite Om Chandraya Namaha")
        remedies.push("Wear pearl or moonstone (after consultation)")
        break
      case "Mars":
        remedies.push("Recite Hanuman Chalisa on Tuesdays")
        remedies.push("Donate red lentils on Tuesdays")
        remedies.push("Wear red coral (after consultation)")
        break
      case "Mercury":
        remedies.push("Recite Vishnu Sahasranama on Wednesdays")
        remedies.push("Donate green items on Wednesdays")
        remedies.push("Wear emerald (after consultation)")
        break
      case "Jupiter":
        remedies.push("Recite Guru Stotram on Thursdays")
        remedies.push("Donate yellow items or turmeric on Thursdays")
        remedies.push("Wear yellow sapphire (after consultation)")
        break
      case "Venus":
        remedies.push("Recite Shukra Stotram on Fridays")
        remedies.push("Donate white items on Fridays")
        remedies.push("Wear diamond or white sapphire (after consultation)")
        break
      case "Saturn":
        remedies.push("Recite Shani Chalisa on Saturdays")
        remedies.push("Donate black items or mustard oil on Saturdays")
        remedies.push("Wear blue sapphire (after consultation)")
        break
      case "Rahu":
        remedies.push("Recite Om Rahave Namaha")
        remedies.push("Donate blue or black items")
        remedies.push("Wear hessonite garnet (after consultation)")
        break
      case "Ketu":
        remedies.push("Recite Om Ketave Namaha")
        remedies.push("Donate multicolored items")
        remedies.push("Wear cat's eye (after consultation)")
        break
    }
  }

  return remedies
}

/**
 * Analyzes the position of all planets in the chart
 */
export function analyzePlanetaryPositions(chart: AstrologyChart): PlanetaryPositionAnalysis[] {
  logInfo("planetary-analyzer", "Analyzing planetary positions", {
    planetCount: chart.planets.length,
  })

  const analyses: PlanetaryPositionAnalysis[] = []

  for (const planet of chart.planets) {
    try {
      const dignity = determinePlanetDignity(planet.name, planet.sign)
      const strength = determinePlanetStrength(planet.name, planet.sign, planet.house || 1, planet.isRetrograde)
      const interpretation = generatePlanetInterpretation(
        planet.name,
        planet.house || 1,
        planet.sign,
        dignity,
        strength,
      )
      const effects = generatePlanetEffects(planet.name, planet.house || 1, planet.sign, dignity, strength)
      const remedies = generatePlanetRemedies(planet.name, strength, dignity)

      const analysis: PlanetaryPositionAnalysis = {
        planet: planet.name,
        house: planet.house || 1,
        sign: planet.sign,
        degree: planet.longitude,
        nakshatra: planet.nakshatra,
        nakshatraPada: planet.nakshatraPada,
        isRetrograde: planet.isRetrograde,
        dignity,
        strength,
        signCharacteristics: SIGN_CHARACTERISTICS[planet.sign as keyof typeof SIGN_CHARACTERISTICS],
        houseSignifications: HOUSE_SIGNIFICATIONS[(planet.house || 1) as keyof typeof HOUSE_SIGNIFICATIONS],
        planetCharacteristics: PLANET_CHARACTERISTICS[planet.name as keyof typeof PLANET_CHARACTERISTICS],
        interpretation,
        effects,
        remedies,
      }

      analyses.push(analysis)

      logDebug("planetary-analyzer", `Analyzed ${planet.name}`, {
        house: planet.house,
        sign: planet.sign,
        dignity,
        strength,
      })
    } catch (error) {
      logError("planetary-analyzer", `Error analyzing ${planet.name}`, error)
    }
  }

  logInfo("planetary-analyzer", "Planetary position analysis completed", {
    analysisCount: analyses.length,
  })

  return analyses
}

/**
 * Analyzes house occupancy in the chart
 */
export function analyzeHouseOccupancy(chart: AstrologyChart): HouseOccupancyAnalysis[] {
  logInfo("planetary-analyzer", "Analyzing house occupancy")

  const analyses: HouseOccupancyAnalysis[] = []

  for (let houseNum = 1; houseNum <= 12; houseNum++) {
    try {
      const house = chart.rashiChart[houseNum]
      if (!house) continue

      const planets = house.planets.map((p) => p.name)
      const isEmpty = planets.length === 0

      // Determine house strength based on occupants and aspects
      let strengthScore = 0

      // Natural benefics add strength
      const benefics = ["Jupiter", "Venus", "Mercury", "Moon"]
      const malefics = ["Saturn", "Mars", "Sun", "Rahu", "Ketu"]

      for (const planet of house.planets) {
        if (benefics.includes(planet.name)) {
          const dignity = determinePlanetDignity(planet.name, planet.sign)
          if (dignity === "Exalted" || dignity === "Own Sign") strengthScore += 3
          else if (dignity === "Friend's Sign") strengthScore += 2
          else strengthScore += 1
        } else if (malefics.includes(planet.name)) {
          const dignity = determinePlanetDignity(planet.name, planet.sign)
          if (dignity === "Exalted" || dignity === "Own Sign") strengthScore += 2
          else if (dignity === "Debilitated") strengthScore -= 2
          else strengthScore -= 1
        }
      }

      let houseStrength: HouseOccupancyAnalysis["houseStrength"]
      if (strengthScore >= 4) houseStrength = "Very Strong"
      else if (strengthScore >= 2) houseStrength = "Strong"
      else if (strengthScore >= 0) houseStrength = "Average"
      else if (strengthScore >= -2) houseStrength = "Weak"
      else houseStrength = "Very Weak"

      // Generate interpretation
      const houseInfo = HOUSE_SIGNIFICATIONS[houseNum as keyof typeof HOUSE_SIGNIFICATIONS]
      const signChar = SIGN_CHARACTERISTICS[house.sign as keyof typeof SIGN_CHARACTERISTICS]

      let interpretation = `The ${houseNum}th house (${houseInfo.name}) in ${house.sign} `

      if (isEmpty) {
        interpretation += `is empty, which means its results depend on the placement and condition of its lord. `
      } else {
        interpretation += `contains ${planets.join(", ")}, which directly influences ${houseInfo.significations.slice(0, 2).join(" and ")}. `
      }

      interpretation += `The ${signChar.element} element and ${signChar.characteristics.slice(0, 2).join(", ")} nature of ${house.sign} `
      interpretation += `shapes how matters of ${houseInfo.significations[0].toLowerCase()} manifest in your life.`

      // Generate effects
      const effects: string[] = []
      if (!isEmpty) {
        effects.push(`Direct planetary influence on ${houseInfo.significations[0].toLowerCase()}`)
        effects.push(`${houseStrength.toLowerCase()} results in ${houseInfo.name.toLowerCase()} matters`)
      } else {
        effects.push(`Results depend on the house lord's placement and condition`)
      }

      const analysis: HouseOccupancyAnalysis = {
        house: houseNum,
        sign: house.sign,
        planets,
        isEmpty,
        houseStrength,
        signCharacteristics: signChar,
        houseSignifications: houseInfo,
        interpretation,
        effects,
      }

      analyses.push(analysis)
    } catch (error) {
      logError("planetary-analyzer", `Error analyzing house ${houseNum}`, error)
    }
  }

  logInfo("planetary-analyzer", "House occupancy analysis completed", {
    analysisCount: analyses.length,
  })

  return analyses
}

/**
 * Gets planets in a specific house
 */
export function getPlanetsInHouse(chart: AstrologyChart, houseNumber: number): PlanetPosition[] {
  const house = chart.rashiChart[houseNumber]
  return house ? house.planets : []
}

/**
 * Gets the sign occupied by a specific planet
 */
export function getPlanetSign(chart: AstrologyChart, planetName: string): string | null {
  const planet = chart.planets.find((p) => p.name === planetName)
  return planet ? planet.sign : null
}

/**
 * Gets all planets in a specific sign
 */
export function getPlanetsInSign(chart: AstrologyChart, signName: string): PlanetPosition[] {
  return chart.planets.filter((p) => p.sign === signName)
}

/**
 * Gets the house number where a specific planet is placed
 */
export function getPlanetHouse(chart: AstrologyChart, planetName: string): number | null {
  const planet = chart.planets.find((p) => p.name === planetName)
  return planet ? planet.house || null : null
}

/**
 * Generates a comprehensive planetary position report
 */
export function generatePlanetaryPositionReport(chart: AstrologyChart): {
  planetaryAnalyses: PlanetaryPositionAnalysis[]
  houseAnalyses: HouseOccupancyAnalysis[]
  summary: string
} {
  logInfo("planetary-analyzer", "Generating comprehensive planetary position report")

  const planetaryAnalyses = analyzePlanetaryPositions(chart)
  const houseAnalyses = analyzeHouseOccupancy(chart)

  // Generate summary
  const strongPlanets = planetaryAnalyses.filter((p) => p.strength === "Very Strong" || p.strength === "Strong")
  const weakPlanets = planetaryAnalyses.filter((p) => p.strength === "Weak" || p.strength === "Very Weak")
  const exaltedPlanets = planetaryAnalyses.filter((p) => p.dignity === "Exalted")
  const debilitatedPlanets = planetaryAnalyses.filter((p) => p.dignity === "Debilitated")

  let summary = `Planetary Position Analysis Summary:\n\n`

  if (strongPlanets.length > 0) {
    summary += `Strong Planets: ${strongPlanets.map((p) => p.planet).join(", ")} - These planets will give favorable results in their respective areas.\n\n`
  }

  if (exaltedPlanets.length > 0) {
    summary += `Exalted Planets: ${exaltedPlanets.map((p) => p.planet).join(", ")} - These planets are in their highest dignity and will give excellent results.\n\n`
  }

  if (weakPlanets.length > 0) {
    summary += `Planets needing attention: ${weakPlanets.map((p) => p.planet).join(", ")} - These planets may require remedial measures for better results.\n\n`
  }

  if (debilitatedPlanets.length > 0) {
    summary += `Debilitated Planets: ${debilitatedPlanets.map((p) => p.planet).join(", ")} - These planets are in their lowest dignity but can still give good results through proper remedies and conscious effort.\n\n`
  }

  summary += `Each planet's placement in its respective house and sign creates a unique combination that influences different areas of life. The detailed analysis above provides specific insights for each planetary position.`

  logInfo("planetary-analyzer", "Planetary position report generated successfully", {
    strongPlanets: strongPlanets.length,
    weakPlanets: weakPlanets.length,
    exaltedPlanets: exaltedPlanets.length,
    debilitatedPlanets: debilitatedPlanets.length,
  })

  return {
    planetaryAnalyses,
    houseAnalyses,
    summary,
  }
}

/**
 * Given a list of house numbers and a chart, returns for each house the planets present and their significance.
 */
export function getPlanetsWithSignificanceInHouses(chart: AstrologyChart, houseNumbers: number[]) {
  const result: Array<{ house: number, planets: Array<{ name: string, significance: string }> }> = [];
  for (const houseNum of houseNumbers) {
    const planets = getPlanetsInHouse(chart, houseNum);
    const planetDetails = planets.map((planet) => ({
      name: planet.name,
      significance: (PLANET_HOUSE_SIGNIFICANCE as any)[planet.name]?.[houseNum] || "",
    }));
    result.push({ house: houseNum, planets: planetDetails });
  }
  return result;
}
