# 🧙‍♂️ Guruji Prompt Generation System

## 📋 Overview

This is a **CRITICAL** system that extracts and analyzes comprehensive astrological information based on user intent and generates highly sophisticated system prompts for the Guruji AI agent. The system follows traditional Vedic astrology principles while leveraging modern AI for precise analysis.

## 🎯 **Core Implementation - 5-Step Analysis Process**

### **Step 1: User Intent Analysis** ✅
- **File**: `lib/astrology/intent-analyzer.ts`
- **Function**: `analyzeUserIntent(userQuery: string)`
- **Output**: Comprehensive intent analysis with confidence levels and focus areas
- **Example**: "When will I get married?" → Marriage intent with 95% confidence

### **Step 2: Relevant Planets Extraction** ✅
- **File**: `lib/astrology/guruji-prompt-generator.ts`
- **Function**: `extractRelevantPlanets(chartData, intentAnalysis)`
- **Logic**: Maps intent categories to specific houses and planets
- **Output**: Planets with house significance and lordship analysis

### **Step 3: Complete Planetary Context** ✅
- **Planetary Significances**: 9 planets × 12 houses comprehensive matrix
- **House Lordship**: Which houses each planet rules and placement effects
- **Sign Information**: Full sign placement with nakshatra details
- **Retrograde Status**: Accounts for retrograde planetary effects

### **Step 4: Relevant Yogas Extraction** ✅
- **File**: `lib/astrology/yoga-analyzer.ts`
- **Function**: `extractRelevantYogas(allYogas, intentAnalysis, relevantPlanets)`
- **Logic**: Filters yogas based on planets involved and intent categories
- **Output**: Yoga definitions, results, and strength analysis

### **Step 5: Dasha/Antardasha Analysis** ✅
- **File**: `lib/astrology/dasha-calculator.ts`
- **Function**: `extractRelevantDashas(chartData, relevantPlanets)`
- **Output**: 
  - Current active periods (Mahadasha → Antardasha → Pratyantardasha)
  - Future relevant periods with exact dates
  - Timing predictions for when effects will manifest

## 📁 **File Structure**

```
lib/astrology/
├── guruji-prompt-generator.ts       # 🔥 MAIN SYSTEM FILE
├── guruji-integration.ts            # Integration & validation
├── intent-analyzer.ts               # Step 1: Intent analysis
├── yoga-analyzer.ts                 # Step 4: Yoga extraction
├── dasha-calculator.ts              # Step 5: Dasha analysis
└── planetary-analyzer.ts            # Planetary significance data
```

## 🚀 **Usage Examples**

### **Basic Usage**
```typescript
import { generateCompleteGururjiPrompt } from '@/lib/astrology/guruji-prompt-generator'

const prompt = await generateCompleteGururjiPrompt(
  "When will I get married?",    // User query
  chartData,                     // Complete astrology chart
  birthDetails                   // Birth information
)
```

### **With Integration & Validation**
```typescript
import { generateGururjiAnalysisPrompt, validateGururjiPrompt } from '@/lib/astrology/guruji-integration'

const systemPrompt = await generateGururjiAnalysisPrompt(userQuery, chartData, birthDetails)
const validation = validateGururjiPrompt(systemPrompt)

console.log(`Prompt valid: ${validation.isValid}`)
console.log(`Missing elements: ${validation.missingElements}`)
```

## 🎛️ **Intent Category Mapping**

The system automatically maps user queries to astrological domains:

| **Intent Category** | **Relevant Houses** | **Key Planets** |
|-------------------|-------------------|----------------|
| **Career** | 1, 2, 6, 10, 11 | Sun, Mars, Mercury, Jupiter, Saturn |
| **Marriage** | 1, 2, 5, 7, 8, 11, 12 | Venus, Mars, Jupiter, Moon, Rahu, Ketu |
| **Health** | 1, 6, 8, 12 | Sun, Moon, Mars, Saturn |
| **Wealth** | 1, 2, 5, 9, 11 | Jupiter, Venus, Mercury, Moon |
| **Children** | 1, 5, 9 | Jupiter, Sun, Moon, Venus |
| **Spirituality** | 1, 5, 8, 9, 12 | Jupiter, Ketu, Saturn, Moon |

## 📊 **Generated Prompt Structure**

The final system prompt includes:

### **1. Native's Information**
- Complete birth details
- Query context

### **2. Intent Analysis**
- Primary focus with confidence levels
- Matched categories and focus areas
- Timeline context

### **3. Relevant Planetary Positions**
- House-wise significance for each relevant planet
- Lordship analysis and effects
- Retrograde status and nakshatra placement

### **4. Current Dasha Hierarchy**
- Active Mahadasha, Antardasha, Pratyantardasha
- Period details with exact dates
- Balance remaining at birth

### **5. Future Relevant Dashas**
- Next 5 relevant planetary periods
- Exact start/end dates for timing predictions
- Significance of each period

### **6. Relevant Yogas**
- Applicable yogas with definitions
- Results and strength analysis
- Planets and houses involved

### **7. Traditional Guidelines**
- Response structure requirements
- Classical text references
- Remedial measure guidelines

## 🔍 **Planetary House Significance Matrix**

Complete 9×12 matrix covering:
- **Sun**: Leadership, government, authority, ego, vitality
- **Moon**: Emotions, mother, public, comfort, intuition
- **Mars**: Energy, siblings, property, courage, accidents
- **Mercury**: Communication, business, intelligence, education
- **Jupiter**: Wisdom, children, wealth, spirituality, dharma
- **Venus**: Love, marriage, arts, luxury, relationships
- **Saturn**: Discipline, delays, hard work, karma, longevity
- **Rahu**: Innovation, foreign, materialism, technology
- **Ketu**: Spirituality, detachment, liberation, past life

Each combination provides specific interpretations (e.g., "Mars in 10th House: Career in defense/engineering, authoritative position").

## ⚡ **Key Features**

### **🎯 Intent-Driven Analysis**
- Automatically identifies relevant planets and houses based on user query
- Filters yogas and dashas relevant to the specific question
- Provides context-specific astrological guidance

### **📈 Hierarchical Dasha System**
- Complete 3-level dasha analysis (Mahadasha → Antardasha → Pratyantardasha)
- Future period identification for timing predictions
- Traditional calculation methods with precise dates

### **🔮 Comprehensive Yoga Analysis**
- 50+ traditional yogas with definitions and results
- Strength assessment (Strong/Moderate/Weak)
- Relevance filtering based on user intent

### **📚 Traditional Authority**
- References classical texts (Brihat Parashara Hora Shastra, Saravali)
- Follows authentic Vedic principles
- Maintains traditional terminology with modern accessibility

## ⚠️ **Critical Implementation Notes**

1. **Null Safety**: All functions include proper null checks for optional properties
2. **Error Handling**: Comprehensive error handling with fallback prompts
3. **Performance**: Optimized for real-time chart analysis
4. **Accuracy**: Uses precise astronomical calculations for dasha periods
5. **Validation**: Built-in prompt validation ensures completeness

## 🧪 **Testing & Validation**

The system includes validation functions to ensure prompt quality:

```typescript
const validation = validateGururjiPrompt(prompt)
// Checks for:
// - All required sections present
// - Sufficient detail and length
// - Traditional authenticity markers
// - Response guideline compliance
```

## 🔗 **Integration Points**

- **Chart Calculation**: Integrates with `enhanced-calculator.ts`
- **Intent Analysis**: Uses LLM-based intent extraction
- **Yoga Analysis**: Connects with comprehensive yoga database
- **Dasha Calculation**: Utilizes hierarchical dasha system
- **UI Display**: Ready for astrology summary component integration

## 🎉 **Result**

This system produces **authentic, comprehensive, and highly contextual** system prompts that enable the Guruji AI agent to provide traditional Vedic astrology guidance with:

- ✅ **Precise timing predictions** based on dasha periods
- ✅ **Relevant planetary analysis** specific to user queries
- ✅ **Traditional authenticity** following classical texts
- ✅ **Modern accessibility** with clear explanations
- ✅ **Actionable guidance** including remedial measures

The implementation is **production-ready** and follows all traditional Vedic astrology principles while leveraging cutting-edge AI for accurate analysis! 🌟 