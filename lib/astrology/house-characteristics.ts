import { logInfo, logDebug } from "@/lib/logging-service"

/**
 * Comprehensive house characteristics based on traditional Vedic astrology
 */
export interface HouseCharacteristics {
  number: number
  name: string
  physical: string[]
  identity: string[]
  abilities: string[]
  lifeEvents: string[]
  material: string[]
  family: string[]
  body: string[]
  skills: string[]
  relationships: string[]
  personalTraits: string[]
  emotionalState: string[]
  education: string[]
  spiritual: string[]
  emotions: string[]
  status: string[]
  adversity: string[]
  work: string[]
  health: string[]
  activities: string[]
  career: string[]
  social: string[]
  habits: string[]
  travel: string[]
}

/**
 * Complete house significations database
 */
export const HOUSE_CHARACTERISTICS: Record<number, HouseCharacteristics> = {
  1: {
    number: 1,
    name: "Tanu Bhava (House of Self)",
    physical: ["Body", "Head", "Complexion", "Appearance", "Physical constitution", "Vitality"],
    identity: ["Nature of birth", "Caste", "Fame", "Personality", "Character", "Self-identity"],
    abilities: ["Intelligence", "Strength", "Energy", "Leadership", "Initiative", "Confidence"],
    lifeEvents: ["Success", "Fame", "Recognition", "New beginnings", "Personal achievements"],
    material: ["Personal assets", "Self-earned wealth"],
    family: ["Self in relation to family"],
    body: ["Head", "Brain", "Face", "Overall health"],
    skills: ["Leadership skills", "Personal abilities"],
    relationships: ["Relationship with self"],
    personalTraits: ["Temperament", "Nature", "Disposition"],
    emotionalState: ["Self-confidence", "Personal happiness"],
    education: ["Basic learning capacity"],
    spiritual: ["Spiritual inclination", "Dharma"],
    emotions: ["Self-love", "Personal emotions"],
    status: ["Personal status", "Individual recognition"],
    adversity: ["Personal challenges", "Health issues"],
    work: ["Personal work", "Individual efforts"],
    health: ["General health", "Vitality", "Life force"],
    activities: ["Personal activities", "Individual pursuits"],
    career: ["Personal career path", "Individual profession"],
    social: ["Social personality", "Public image"],
    habits: ["Personal habits", "Individual behavior"],
    travel: ["Personal journeys", "Individual travels"],
  },

  2: {
    number: 2,
    name: "Dhana Bhava (House of Wealth)",
    physical: ["Eyes", "Mouth", "Face", "Voice", "Right eye"],
    identity: ["Family background", "Inherited traits", "Cultural identity"],
    abilities: ["Speech abilities", "Communication skills", "Artistic talents"],
    lifeEvents: ["Wealth accumulation", "Family events", "Financial gains"],
    material: ["Wealth", "Assets", "Food", "Movable property", "Bank balance", "Jewelry"],
    family: ["Family ties", "Inherited traits", "Family wealth", "Family values"],
    body: ["Eyes", "Mouth", "Face", "Voice", "Teeth", "Tongue"],
    skills: ["Speech", "Communication", "Singing", "Languages"],
    relationships: ["Family relationships", "Close relatives"],
    personalTraits: ["Speaking ability", "Truthfulness"],
    emotionalState: ["Family happiness", "Material satisfaction"],
    education: ["Early education", "Learning through family"],
    spiritual: ["Family traditions", "Religious values"],
    emotions: ["Attachment to family", "Material desires"],
    status: ["Family status", "Financial position"],
    adversity: ["Financial problems", "Family disputes"],
    work: ["Family business", "Inherited profession"],
    health: ["Eye problems", "Speech disorders"],
    activities: ["Family activities", "Cultural pursuits"],
    career: ["Family profession", "Traditional business"],
    social: ["Family social circle", "Cultural community"],
    habits: ["Eating habits", "Speaking patterns"],
    travel: ["Family travels", "Cultural journeys"],
  },

  3: {
    number: 3,
    name: "Sahaja Bhava (House of Siblings)",
    physical: ["Throat", "Ears", "Arms", "Hands", "Shoulders"],
    identity: ["Relationship with siblings", "Communication style"],
    abilities: ["Courage", "Mental strength", "Communication skills", "Artistic abilities"],
    lifeEvents: ["Travels", "Father's death", "Sibling events", "Short journeys"],
    material: ["Expenditure on vehicles", "House expenses", "Communication tools"],
    family: ["Younger siblings", "Confidants", "Close friends"],
    body: ["Throat", "Ears", "Arms", "Hands", "Right ear"],
    skills: ["Communication", "Creativity", "Writing", "Arts", "Music"],
    relationships: ["Younger siblings", "Confidants", "Neighbors"],
    personalTraits: ["Courage", "Mental strength", "Initiative", "Adventurous nature"],
    emotionalState: ["Enthusiasm", "Curiosity", "Restlessness"],
    education: ["Technical education", "Skill development"],
    spiritual: ["Devotional practices", "Religious communication"],
    emotions: ["Sibling love", "Friendship"],
    status: ["Recognition for skills", "Local fame"],
    adversity: ["Sibling conflicts", "Communication problems"],
    work: ["Communication work", "Media", "Writing"],
    health: ["Throat problems", "Ear issues", "Arm injuries"],
    activities: ["Creative pursuits", "Sports", "Hobbies"],
    career: ["Media", "Communication", "Arts", "Sports"],
    social: ["Local community", "Neighbors", "Friends"],
    habits: ["Communication habits", "Creative expressions"],
    travel: ["Short journeys", "Local travels", "Pilgrimages"],
  },

  4: {
    number: 4,
    name: "Sukha Bhava (House of Happiness)",
    physical: ["Heart", "Chest", "Lungs"],
    identity: ["Emotional identity", "Cultural roots"],
    abilities: ["Emotional intelligence", "Nurturing abilities"],
    lifeEvents: ["Mother's events", "Property acquisition", "Home changes"],
    material: ["Vehicles", "House", "Lands", "Immovable property", "Real estate wealth"],
    family: ["Mother", "Relatives", "Maternal family"],
    body: ["Heart", "Chest", "Lungs", "Breasts"],
    skills: ["Nurturing skills", "Domestic abilities"],
    relationships: ["Mother", "Maternal relatives", "Close family"],
    personalTraits: ["Emotional nature", "Caring disposition"],
    emotionalState: ["Happiness", "Comforts", "Peace", "Childhood memories", "Contentment"],
    education: ["Basic education", "Primary schooling", "Foundational learning"],
    spiritual: ["Devotion to mother goddess", "Ancestral worship"],
    emotions: ["Love for mother", "Emotional security", "Nostalgia"],
    status: ["Family honor", "Property ownership"],
    adversity: ["Mother's health", "Property disputes", "Emotional disturbances"],
    work: ["Real estate", "Agriculture", "Home-based work"],
    health: ["Heart problems", "Chest issues", "Emotional disorders"],
    activities: ["Home activities", "Family gatherings", "Property management"],
    career: ["Real estate", "Agriculture", "Education", "Hospitality"],
    social: ["Family social circle", "Community elders"],
    habits: ["Home habits", "Family traditions"],
    travel: ["Travels related to property", "Family visits"],
  },

  5: {
    number: 5,
    name: "Putra Bhava (House of Children)",
    physical: ["Stomach", "Digestive system", "Upper abdomen"],
    identity: ["Creative identity", "Intellectual identity"],
    abilities: ["Intelligence", "Knowledge", "Judgment", "Creative abilities", "Speculative skills"],
    lifeEvents: ["Children's birth", "Educational achievements", "Creative success"],
    material: ["Speculative gains", "Investment returns", "Creative income"],
    family: ["Children", "Progeny"],
    body: ["Stomach", "Digestive system", "Liver", "Gall bladder"],
    skills: ["Teaching", "Creative arts", "Speculation", "Entertainment"],
    relationships: ["Children", "Students", "Romantic partners"],
    personalTraits: ["Creative nature", "Intellectual disposition"],
    emotionalState: ["Joy from children", "Creative satisfaction"],
    education: ["Higher education", "Specialized knowledge", "Academic achievements"],
    spiritual: ["Poorvapunya (past karma)", "Devotion", "Mantras", "Religious practices"],
    emotions: ["Love", "Affection", "Speculation", "Romance", "Parental love"],
    status: ["Authority", "Fame", "Recognition for creativity"],
    adversity: ["Children's problems", "Speculative losses", "Creative blocks"],
    work: ["Teaching", "Entertainment", "Creative fields", "Speculation"],
    health: ["Digestive problems", "Stomach issues", "Liver problems"],
    activities: ["Creative pursuits", "Entertainment", "Sports", "Games"],
    career: ["Education", "Entertainment", "Creative arts", "Stock market"],
    social: ["Creative community", "Educational circles"],
    habits: ["Creative habits", "Entertainment preferences"],
    travel: ["Educational travels", "Entertainment trips"],
  },

  6: {
    number: 6,
    name: "Ripu Bhava (House of Enemies)",
    physical: ["Hips", "Lower back", "Kidneys"],
    identity: ["Service identity", "Health consciousness"],
    abilities: ["Service abilities", "Healing skills", "Problem-solving"],
    lifeEvents: ["Health issues", "Legal battles", "Service opportunities"],
    material: ["Service income", "Medical expenses", "Legal costs"],
    family: ["Relatives (mother's younger brother)", "Servants", "Employees"],
    body: ["Hips", "Lower back", "Kidneys", "Small intestine"],
    skills: ["Service skills", "Medical abilities", "Legal knowledge"],
    relationships: ["Enemies", "Competitors", "Servants", "Employees"],
    personalTraits: ["Service orientation", "Competitive nature"],
    emotionalState: ["Stress", "Anxiety", "Worry"],
    education: ["Medical education", "Service training"],
    spiritual: ["Service to others", "Healing practices"],
    emotions: ["Compassion for suffering", "Competitive feelings"],
    status: ["Recognition for service", "Professional reputation"],
    adversity: ["Enemies", "Mental tension", "Accidents", "Diseases", "Injuries", "Hospitalization"],
    work: ["Service", "Servants", "Agriculture", "Medical field", "Legal profession"],
    health: ["Diseases", "Injuries", "Hospitalization", "Chronic ailments"],
    activities: ["Service activities", "Health care", "Legal matters"],
    career: ["Medicine", "Law", "Agriculture", "Service sector"],
    social: ["Professional associations", "Service organizations"],
    habits: ["Health habits", "Service routines"],
    travel: ["Medical travels", "Service-related journeys"],
  },

  7: {
    number: 7,
    name: "Kalatra Bhava (House of Partnership)",
    physical: ["Lower abdomen (below navel)", "Reproductive organs"],
    identity: ["Partnership identity", "Marital status"],
    abilities: ["Relationship skills", "Diplomatic abilities"],
    lifeEvents: ["Marriage", "Business partnerships", "Long journeys", "Death"],
    material: ["Partnership wealth", "Business income", "Marital assets"],
    family: ["Life partner", "Spouse's family"],
    body: ["Lower abdomen", "Reproductive organs", "Kidneys"],
    skills: ["Diplomatic skills", "Relationship management"],
    relationships: ["Marriage", "Life partner", "Business partners", "Spouse"],
    personalTraits: ["Partnership orientation", "Diplomatic nature"],
    emotionalState: ["Marital happiness", "Partnership satisfaction"],
    education: ["Education through partnerships", "Foreign education"],
    spiritual: ["Spiritual partnerships", "Joint spiritual practices"],
    emotions: ["Romantic love", "Partnership emotions"],
    status: ["Marital status", "Partnership recognition"],
    adversity: ["Marital problems", "Partnership disputes", "Relationship conflicts"],
    work: ["Partnership business", "Foreign business", "Diplomatic work"],
    health: ["Reproductive health", "Kidney problems"],
    activities: ["Sex", "Passion", "Long journeys", "Partnership activities"],
    career: ["Foreign business", "Partnerships", "Diplomacy"],
    social: ["Partner's social circle", "Foreign contacts"],
    habits: ["Relationship habits", "Partnership patterns"],
    travel: ["Long journeys", "Foreign travels", "Honeymoon trips"],
  },

  8: {
    number: 8,
    name: "Ayur Bhava (House of Longevity)",
    physical: ["Genitals", "Excretory organs"],
    identity: ["Hidden identity", "Occult identity"],
    abilities: ["Research abilities", "Occult knowledge", "Investigative skills"],
    lifeEvents: ["Longevity", "Death", "Inheritance", "Sudden events", "Accidents"],
    material: ["Debts", "Unearned wealth", "Occult gains", "Insurance", "Inheritance"],
    family: ["In-laws", "Spouse's family"],
    body: ["Genitals", "Excretory organs", "Colon"],
    skills: ["Research", "Investigation", "Occult sciences"],
    relationships: ["In-laws", "Hidden relationships"],
    personalTraits: ["Mysterious nature", "Investigative mind"],
    emotionalState: ["Hidden emotions", "Psychological depths"],
    education: ["Occult education", "Research studies"],
    spiritual: ["Occult practices", "Tantric knowledge", "Death meditation"],
    emotions: ["Hidden desires", "Psychological complexes"],
    status: ["Hidden status", "Occult reputation"],
    adversity: ["Ill-fame", "Disgrace", "Secrets", "Scandals", "Sudden losses"],
    work: ["Research work", "Occult practices", "Insurance"],
    health: ["Chronic diseases", "Hidden ailments", "Psychological disorders"],
    activities: ["Research", "Investigation", "Occult practices"],
    career: ["Research", "Investigation", "Insurance", "Occult sciences"],
    social: ["Hidden social circles", "Occult groups"],
    habits: ["Secretive habits", "Hidden behaviors"],
    travel: ["Secret travels", "Research expeditions"],
  },

  9: {
    number: 9,
    name: "Dharma Bhava (House of Fortune)",
    physical: ["Thighs", "Hips"],
    identity: ["Religious identity", "Philosophical identity"],
    abilities: ["Teaching abilities", "Philosophical thinking", "Religious knowledge"],
    lifeEvents: ["Father's events", "Religious ceremonies", "Higher education"],
    material: ["Fortune", "Religious donations", "Educational expenses"],
    family: ["Father", "Grandchildren", "Guru", "Teacher"],
    body: ["Thighs", "Hips", "Liver"],
    skills: ["Teaching", "Preaching", "Philosophical discourse"],
    relationships: ["Father", "Grandchildren", "Guru", "Teacher", "Religious community"],
    personalTraits: ["Religious nature", "Philosophical disposition"],
    emotionalState: ["Spiritual joy", "Religious satisfaction"],
    education: ["Higher studies", "Teachers", "University education", "Philosophical learning"],
    spiritual: ["Religion", "Dharma", "Past life causes", "Spiritual practices", "Pilgrimage"],
    emotions: ["Devotion", "Spiritual love", "Reverence"],
    status: ["Religious status", "Academic recognition"],
    adversity: ["Father's problems", "Religious conflicts", "Educational obstacles"],
    work: ["Teaching", "Religious work", "Publishing", "Law"],
    health: ["Thigh problems", "Hip issues", "Liver problems"],
    activities: ["Religious activities", "Teaching", "Pilgrimage"],
    career: ["Teaching", "Religion", "Law", "Publishing", "Philosophy"],
    social: ["Religious community", "Academic circles"],
    habits: ["Religious habits", "Study routines"],
    travel: ["Foreign lands", "Diksha (spiritual initiation)", "Pilgrimage", "Educational travels"],
  },

  10: {
    number: 10,
    name: "Karma Bhava (House of Career)",
    physical: ["Knees", "Joints"],
    identity: ["Professional identity", "Social status"],
    abilities: ["Leadership abilities", "Professional skills", "Management"],
    lifeEvents: ["Career achievements", "Professional recognition", "Government honors"],
    material: ["Professional income", "Career-related assets"],
    family: ["Professional family", "Colleagues"],
    body: ["Knees", "Joints", "Bones"],
    skills: ["Professional skills", "Leadership", "Management"],
    relationships: ["Boss", "Authority figures", "Government officials"],
    personalTraits: ["Professional nature", "Ambitious disposition"],
    emotionalState: ["Professional satisfaction", "Career pride"],
    education: ["Professional education", "Career training"],
    spiritual: ["Dharmic profession", "Service to society"],
    emotions: ["Professional passion", "Career ambition"],
    status: ["Fame", "Honors", "Self-respect", "Professional recognition"],
    adversity: ["Career obstacles", "Professional conflicts", "Loss of reputation"],
    work: ["Profession", "Karma", "Conduct in society", "Government work"],
    health: ["Knee problems", "Joint issues", "Work-related stress"],
    activities: ["Professional activities", "Career development"],
    career: ["Profession", "Karma", "Conduct in society", "Government service"],
    social: ["Professional network", "Industry associations"],
    habits: ["Work habits", "Professional routines"],
    travel: ["Professional travels", "Business trips"],
  },

  11: {
    number: 11,
    name: "Labha Bhava (House of Gains)",
    physical: ["Ankles", "Calves"],
    identity: ["Social identity", "Network identity"],
    abilities: ["Networking abilities", "Social skills"],
    lifeEvents: ["Financial gains", "Social achievements", "Friend's events"],
    material: ["Income", "Gains", "Hopes realized", "Profit", "Salary"],
    family: ["Elder siblings", "Friends as family"],
    body: ["Ankles", "Calves", "Left ear"],
    skills: ["Networking", "Social skills", "Business acumen"],
    relationships: ["Elder siblings", "Friends", "Social network"],
    personalTraits: ["Social nature", "Ambitious for gains"],
    emotionalState: ["Satisfaction from gains", "Social happiness"],
    education: ["Education through friends", "Group learning"],
    spiritual: ["Group spiritual practices", "Social service"],
    emotions: ["Friendship", "Social bonding", "Desire for gains"],
    status: ["Social status", "Recognition from peers"],
    adversity: ["Loss of friends", "Social conflicts", "Unfulfilled desires"],
    work: ["Group work", "Social organizations", "Network business"],
    health: ["Ankle problems", "Circulation issues"],
    activities: ["Social activities", "Group pursuits", "Networking"],
    career: ["Social work", "Network marketing", "Group enterprises"],
    social: ["Friends", "Social circles", "Professional networks"],
    habits: ["Social habits", "Networking patterns"],
    travel: ["Social travels", "Group trips", "Friend visits"],
  },

  12: {
    number: 12,
    name: "Vyaya Bhava (House of Losses)",
    physical: ["Left eye", "Feet"],
    identity: ["Spiritual identity", "Hidden identity"],
    abilities: ["Spiritual abilities", "Meditation skills", "Charitable nature"],
    lifeEvents: ["Spiritual liberation", "Foreign residence", "Hospitalization"],
    material: ["Losses", "Punishment", "Imprisonment", "Expenditure", "Donations"],
    family: ["Foreign family", "Spiritual family"],
    body: ["Left eye", "Feet", "Lymphatic system"],
    skills: ["Meditation", "Spiritual practices", "Foreign languages"],
    relationships: ["Secret enemies", "Spiritual guides", "Foreign contacts"],
    personalTraits: ["Spiritual nature", "Charitable disposition"],
    emotionalState: ["Spiritual peace", "Detachment"],
    education: ["Foreign education", "Spiritual learning"],
    spiritual: ["Meditation", "Moksha (liberation)", "Spiritual practices", "Renunciation"],
    emotions: ["Spiritual love", "Compassion", "Detachment"],
    status: ["Spiritual status", "Foreign recognition"],
    adversity: ["Losses", "Punishment", "Imprisonment", "Secret enemies", "Hospitalization"],
    work: ["Foreign work", "Spiritual work", "Charitable organizations"],
    health: ["Eye problems", "Foot issues", "Mental disorders", "Hospitalization"],
    activities: ["Meditation", "Charity", "Foreign activities"],
    career: ["Foreign service", "Spiritual work", "Charitable organizations"],
    social: ["Foreign social circles", "Spiritual communities"],
    habits: ["Sleep", "Pleasures in bed", "Bad habits", "Spiritual routines"],
    travel: ["Foreign travels", "Spiritual journeys", "Exile"],
  },
}

/**
 * Intent mapping categories for user queries
 */
export interface IntentMapping {
  category: string
  keywords: string[]
  houses: number[]
  description: string
}

/**
 * Comprehensive intent mapping database
 */
export const INTENT_MAPPINGS: IntentMapping[] = [
  // Physical Health and Body
  {
    category: "Physical Health",
    keywords: [
      "health",
      "body",
      "disease",
      "illness",
      "medical",
      "doctor",
      "hospital",
      "surgery",
      "pain",
      "injury",
      "accident",
      "vitality",
      "energy",
      "strength",
      "fitness",
      "exercise",
    ],
    houses: [1, 6, 8],
    description: "Questions about physical health, diseases, injuries, and bodily concerns",
  },
  {
    category: "Specific Body Parts",
    keywords: [
      "head",
      "face",
      "eyes",
      "mouth",
      "throat",
      "ears",
      "arms",
      "hands",
      "heart",
      "chest",
      "stomach",
      "hips",
      "thighs",
      "knees",
      "ankles",
      "feet",
      "genitals",
    ],
    houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    description: "Questions about specific body parts and related health issues",
  },

  // Wealth and Material Possessions
  {
    category: "Wealth and Money",
    keywords: [
      "money",
      "wealth",
      "rich",
      "poor",
      "income",
      "salary",
      "profit",
      "loss",
      "financial",
      "bank",
      "savings",
      "investment",
      "assets",
      "property",
      "gold",
      "jewelry",
    ],
    houses: [2, 11],
    description: "Questions about wealth, money, income, and financial matters",
  },
  {
    category: "Property and Real Estate",
    keywords: [
      "house",
      "home",
      "property",
      "land",
      "real estate",
      "building",
      "construction",
      "rent",
      "buy",
      "sell",
      "vehicle",
      "car",
      "bike",
    ],
    houses: [4, 12],
    description: "Questions about property, real estate, vehicles, and material possessions",
  },

  // Family and Relationships
  {
    category: "Family",
    keywords: [
      "family",
      "mother",
      "father",
      "parents",
      "siblings",
      "brother",
      "sister",
      "relatives",
      "grandmother",
      "grandfather",
      "uncle",
      "aunt",
    ],
    houses: [2, 3, 4, 9, 11],
    description: "Questions about family members and family relationships",
  },
  {
    category: "Marriage and Spouse",
    keywords: [
      "marriage",
      "wedding",
      "spouse",
      "husband",
      "wife",
      "partner",
      "relationship",
      "love",
      "romance",
      "dating",
      "engagement",
      "divorce",
    ],
    houses: [7],
    description: "Questions about marriage, spouse, and romantic relationships",
  },
  {
    category: "Children",
    keywords: ["children", "child", "kids", "son", "daughter", "pregnancy", "birth", "parenting", "grandchildren"],
    houses: [5],
    description: "Questions about children, pregnancy, and parenting",
  },

  // Career and Profession
  {
    category: "Career and Profession",
    keywords: [
      "career",
      "job",
      "work",
      "profession",
      "business",
      "employment",
      "office",
      "boss",
      "colleague",
      "promotion",
      "success",
      "failure",
      "government",
      "service",
    ],
    houses: [10, 6],
    description: "Questions about career, profession, job, and work-related matters",
  },
  {
    category: "Business and Partnerships",
    keywords: [
      "business",
      "partnership",
      "partner",
      "company",
      "trade",
      "commerce",
      "profit",
      "loss",
      "investment",
      "shares",
      "stock market",
    ],
    houses: [7, 10],
    description: "Questions about business, partnerships, and commercial activities",
  },

  // Education and Knowledge
  {
    category: "Education",
    keywords: [
      "education",
      "study",
      "school",
      "college",
      "university",
      "degree",
      "exam",
      "student",
      "teacher",
      "learning",
      "knowledge",
      "books",
    ],
    houses: [4, 5, 9],
    description: "Questions about education, studies, and learning",
  },
  {
    category: "Intelligence and Skills",
    keywords: [
      "intelligence",
      "smart",
      "skills",
      "talent",
      "ability",
      "creativity",
      "art",
      "music",
      "writing",
      "communication",
      "speech",
    ],
    houses: [1, 2, 3, 5],
    description: "Questions about intelligence, skills, talents, and abilities",
  },

  // Spiritual and Religious
  {
    category: "Spirituality and Religion",
    keywords: [
      "spiritual",
      "religion",
      "god",
      "temple",
      "prayer",
      "meditation",
      "dharma",
      "karma",
      "moksha",
      "liberation",
      "guru",
      "saint",
      "pilgrimage",
    ],
    houses: [5, 9, 12],
    description: "Questions about spirituality, religion, and spiritual practices",
  },
  {
    category: "Past Life and Karma",
    keywords: [
      "past life",
      "previous birth",
      "karma",
      "destiny",
      "fate",
      "poorvapunya",
      "sins",
      "good deeds",
      "bad deeds",
    ],
    houses: [5, 9],
    description: "Questions about past life, karma, and destiny",
  },

  // Travel and Foreign
  {
    category: "Travel",
    keywords: [
      "travel",
      "journey",
      "trip",
      "foreign",
      "abroad",
      "visa",
      "immigration",
      "settlement",
      "relocation",
      "pilgrimage",
    ],
    houses: [3, 7, 9, 12],
    description: "Questions about travel, foreign countries, and relocation",
  },

  // Enemies and Conflicts
  {
    category: "Enemies and Conflicts",
    keywords: [
      "enemy",
      "enemies",
      "conflict",
      "fight",
      "dispute",
      "court",
      "legal",
      "case",
      "litigation",
      "competition",
      "rival",
    ],
    houses: [6, 8],
    description: "Questions about enemies, conflicts, legal matters, and disputes",
  },

  // Death and Longevity
  {
    category: "Death and Longevity",
    keywords: ["death", "longevity", "life span", "age", "dying", "mortality", "accident", "danger", "risk"],
    houses: [8],
    description: "Questions about death, longevity, and life span",
  },

  // Hidden and Secret Matters
  {
    category: "Hidden and Occult",
    keywords: [
      "secret",
      "hidden",
      "occult",
      "mystery",
      "research",
      "investigation",
      "detective",
      "spy",
      "inheritance",
      "insurance",
    ],
    houses: [8, 12],
    description: "Questions about hidden matters, secrets, occult, and research",
  },

  // Social and Friends
  {
    category: "Friends and Social Life",
    keywords: [
      "friends",
      "friendship",
      "social",
      "society",
      "community",
      "group",
      "team",
      "network",
      "connections",
      "popularity",
    ],
    houses: [11],
    description: "Questions about friends, social life, and community",
  },

  // Losses and Expenses
  {
    category: "Losses and Expenses",
    keywords: ["loss", "losses", "expense", "expenditure", "waste", "donation", "charity", "giving", "spending"],
    houses: [12],
    description: "Questions about losses, expenses, and charitable activities",
  },

  // Fame and Recognition
  {
    category: "Fame and Recognition",
    keywords: [
      "fame",
      "famous",
      "recognition",
      "honor",
      "award",
      "reputation",
      "status",
      "respect",
      "dignity",
      "prestige",
    ],
    houses: [1, 5, 10],
    description: "Questions about fame, recognition, and social status",
  },

  // Speculation and Gambling
  {
    category: "Speculation and Gambling",
    keywords: [
      "speculation",
      "gambling",
      "lottery",
      "betting",
      "stock market",
      "shares",
      "investment",
      "risk",
      "chance",
      "luck",
    ],
    houses: [5],
    description: "Questions about speculation, gambling, and risky investments",
  },
]

/**
 * Maps user intent to relevant houses based on keywords and context
 */
export function mapIntentToHouses(userQuery: string): {
  primaryHouses: number[]
  secondaryHouses: number[]
  matchedCategories: string[]
  confidence: number
} {
  logInfo("house-characteristics", "Mapping user intent to houses", {
    queryLength: userQuery.length,
    query: userQuery.substring(0, 100),
  })

  const query = userQuery.toLowerCase()
  const matchedMappings: { mapping: IntentMapping; score: number }[] = []

  // Score each intent mapping based on keyword matches
  INTENT_MAPPINGS.forEach((mapping) => {
    let score = 0
    let matchedKeywords = 0

    mapping.keywords.forEach((keyword) => {
      if (query.includes(keyword.toLowerCase())) {
        score += keyword.length // Longer keywords get higher scores
        matchedKeywords++
      }
    })

    if (matchedKeywords > 0) {
      // Boost score based on percentage of keywords matched
      const keywordMatchPercentage = matchedKeywords / mapping.keywords.length
      score = score * (1 + keywordMatchPercentage)

      matchedMappings.push({ mapping, score })
    }
  })

  // Sort by score (highest first)
  matchedMappings.sort((a, b) => b.score - a.score)

  logDebug("house-characteristics", "Intent mapping results", {
    totalMappings: INTENT_MAPPINGS.length,
    matchedMappings: matchedMappings.length,
    topMatches: matchedMappings.slice(0, 3).map((m) => ({
      category: m.mapping.category,
      score: m.score,
      houses: m.mapping.houses,
    })),
  })

  if (matchedMappings.length === 0) {
    return {
      primaryHouses: [],
      secondaryHouses: [],
      matchedCategories: [],
      confidence: 0,
    }
  }

  // Get primary houses (from top matches)
  const primaryHouses: number[] = []
  const secondaryHouses: number[] = []
  const matchedCategories: string[] = []

  // Take top 3 matches for primary houses
  const topMatches = matchedMappings.slice(0, 3)
  topMatches.forEach((match) => {
    matchedCategories.push(match.mapping.category)
    match.mapping.houses.forEach((house) => {
      if (!primaryHouses.includes(house)) {
        primaryHouses.push(house)
      }
    })
  })

  // Take next 2 matches for secondary houses
  const secondaryMatches = matchedMappings.slice(3, 5)
  secondaryMatches.forEach((match) => {
    match.mapping.houses.forEach((house) => {
      if (!primaryHouses.includes(house) && !secondaryHouses.includes(house)) {
        secondaryHouses.push(house)
      }
    })
  })

  // Calculate confidence based on top match score
  const maxPossibleScore = Math.max(
    ...INTENT_MAPPINGS.map((m) => m.keywords.reduce((sum, keyword) => sum + keyword.length, 0)),
  )
  const confidence = Math.min(matchedMappings[0].score / maxPossibleScore, 1)

  logInfo("house-characteristics", "Intent mapping completed", {
    primaryHouses,
    secondaryHouses,
    matchedCategories,
    confidence: Math.round(confidence * 100),
  })

  return {
    primaryHouses,
    secondaryHouses,
    matchedCategories,
    confidence,
  }
}

/**
 * Gets detailed characteristics for specific houses
 */
export function getHouseCharacteristics(houseNumbers: number[]): HouseCharacteristics[] {
  return houseNumbers
    .filter((num) => num >= 1 && num <= 12)
    .map((num) => HOUSE_CHARACTERISTICS[num])
    .filter(Boolean)
}

/**
 * Gets all significations for a house in a flat array
 */
export function getAllHouseSignifications(houseNumber: number): string[] {
  const house = HOUSE_CHARACTERISTICS[houseNumber]
  if (!house) return []

  return [
    ...house.physical,
    ...house.identity,
    ...house.abilities,
    ...house.lifeEvents,
    ...house.material,
    ...house.family,
    ...house.body,
    ...house.skills,
    ...house.relationships,
    ...house.personalTraits,
    ...house.emotionalState,
    ...house.education,
    ...house.spiritual,
    ...house.emotions,
    ...house.status,
    ...house.adversity,
    ...house.work,
    ...house.health,
    ...house.activities,
    ...house.career,
    ...house.social,
    ...house.habits,
    ...house.travel,
  ]
}

/**
 * Searches for specific significations across all houses
 */
export function findHousesForSignification(signification: string): number[] {
  const houses: number[] = []
  const searchTerm = signification.toLowerCase()

  for (let i = 1; i <= 12; i++) {
    const allSignifications = getAllHouseSignifications(i)
    if (allSignifications.some((sig) => sig.toLowerCase().includes(searchTerm))) {
      houses.push(i)
    }
  }

  return houses
}
