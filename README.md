# AI Shopping Assistant - E-Commerce Web Agent

An intelligent web-based shopping assistant for an e-commerce website built with Node.js, Express, and standard HTML5/CSS3/JavaScript. The assistant understands customer requirements, extracts essential criteria (category, budget, features, intended use), constructs a structured prompt, interfaces with an AI model via a secure backend, and returns personalized product recommendations formatted into interactive product cards.

---

## 📌 Project Features & Highlights

1. **Clean E-Commerce User Interface**:
   - Modern e-commerce layout without external CSS frameworks (No Tailwind CSS used).
   - Sticky header with real-time AI status indicator (🟢 Live AI / 🟡 Lab Demo Mode).
   - Quick starter query chips for rapid 1-click testing during demonstrations.
   - Requirement breakdown badges displaying Category, Budget, Key Features, and Intended Use.
   - Interactive product recommendation cards featuring name, category, formatted price, key features with checkmarks, suitability explanation, and store action buttons.
   - "Clear Chat" button to reset the session at any time.

2. **Secure AI Backend Integration**:
   - The frontend communicates solely with the backend server via `/api/chat`.
   - API keys are stored securely in `.env` and **never exposed to client-side code**.
   - Supports Google Gemini API (default), OpenAI, and Groq.
   - Built-in intelligent offline simulator mode for laboratory evaluations when internet or API credits are unavailable.

3. **Follow-up Question Logic**:
   - When customer requests are underspecified (e.g., *"I want a phone"* or *"I need headphones"*), the agent asks clarifying questions regarding budget and intended priorities instead of guessing blindly.

4. **Budget Constraint Enforcement**:
   - Products are recommended strictly within the customer's specified budget limit.

5. **Graceful Error Handling**:
   - Displays `"Sorry, I couldn't process your request. Please try again."` if an AI API request fails.

---

## 📂 Complete Project Structure

```
d:/pe lab10/
├── public/
│   ├── index.html       # Clean e-commerce webpage with header, chat, cards, and input
│   ├── style.css        # Pure CSS3 styling (Modern, responsive, no Tailwind CSS)
│   └── app.js           # Client-side chat logic, history management & card rendering
├── .env                 # Environment variables containing AI_API_KEY
├── .env.example         # Template for environment configuration
├── package.json         # Project metadata, dependencies and npm scripts
├── server.js            # Node.js/Express backend server & AI integration
├── test-agent.js        # Automated test suite testing 7 shopping scenarios
└── README.md            # Comprehensive documentation & lab manual
```

---

## ⚙️ Installation & Execution

### 1. Prerequisites
- **Node.js** (v18 or higher recommended; v24 is verified)
- **npm** (included with Node.js)

### 2. Install Dependencies
Open a terminal in the project directory and run:
```bash
npm install
```

### 3. Configure the AI API Key
Copy `.env.example` to `.env` (already created):
```bash
cp .env.example .env
```
Open `.env` and set your AI API key:
```env
PORT=3000
AI_API_KEY=your_actual_api_key_here
AI_PROVIDER=gemini
AI_MODEL=gemini-1.5-flash
DEMO_MODE=auto
```

> **Note on AI Keys:**
> - To use **Google Gemini** (recommended & free): Get a key at [Google AI Studio](https://aistudio.google.com/) and paste it as `AI_API_KEY`.
> - To use **OpenAI**: Set `AI_PROVIDER=openai`, `AI_MODEL=gpt-4o-mini`, and provide your `OPENAI_API_KEY` as `AI_API_KEY`.
> - **Lab Evaluation Note**: If `AI_API_KEY` is left as `your_api_key_here`, the application runs in high-fidelity **Lab Demo Mode**, allowing college examiners to test all prompts offline without setup friction!

### 4. Start the Application
Run:
```bash
npm start
```
Or for auto-reload during development:
```bash
npm run dev
```

### 5. Access the Web Application
Open your web browser and navigate to:
```
http://localhost:3000
```

---

## 🧪 Automated Testing

An automated test suite is provided to verify agent logic, requirement extraction, budget constraints, follow-up behavior, and card schema:

```bash
npm test
```

### Test Scenarios Covered:
1. **Programming Laptop under ₹60,000**: Verifies specs (16GB RAM, SSD, CPU) and budget limit.
2. **Camera Smartphone**: Verifies OIS, sensor specs, and photography suitability.
3. **Headphones for Online Classes**: Verifies mic clarity and comfort attributes.
4. **Follow-up Handling ("I want a phone")**: Verifies clarifying questions for vague input.
5. **Multi-Turn Context Resolution**: Verifies follow-up answer merging into final recommendations.
6. **Budget Gifting under ₹2,000**: Verifies price ceiling compliance for gift ideas.
7. **AI JSON Parser Robustness**: Verifies markdown fence cleaning and error recovery.

All 31 assertions pass with 100% success rate.

---

## 🧠 Prompt Engineering in the Application

### 1. The Core Prompt
The prompt instructs the AI model to act as a domain-expert shopping consultant:

```text
You are an AI Shopping Assistant for an e-commerce website.

First understand the customer's requirements.

Identify:
1. Product category
2. Budget
3. Required features
4. Intended use

Then recommend suitable products or product types.

For each recommendation, provide:
* Product name or type
* Main features
* Approximate price
* Why it is suitable

If the customer does not provide enough information, ask a simple follow-up question.

Do not recommend products that clearly exceed the customer's stated budget.

Give the response in simple and organized language.
```

### 2. How Prompt Engineering is Applied
- **Role Specification (Persona)**: Anchors the LLM as an empathetic, knowledgeable e-commerce consultant.
- **Decomposed Step-by-Step Reasoning (Chain-of-Thought)**: Rather than jumping to random products, the model first extracts the four pillars: Category, Budget, Features, and Intended Use.
- **Constraint Enforcement**: Explicit negative prompting (`"Do not recommend products that clearly exceed the customer's stated budget"`) prevents recommending unaffordable items.
- **Adaptive Fallback Handling**: Directs the agent to ask simple clarifying follow-ups rather than hallucinating when information is missing.
- **Structured JSON Schema Instruction**: Commands the model to output strict JSON keys matching the frontend cards (`name`, `category`, `price`, `features`, `whySuitable`).

---

## 🔄 Agent Workflow Pipeline

```
┌─────────────────────────────────┐
│     Customer Request Input      │  (e.g., "I need a laptop for programming under ₹60,000")
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ Understand Customer Requirement │  (Decomposes sentence meaning & user intent)
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ Extract Category, Budget & Spec │  (Category: Laptop | Budget: ≤ ₹60,000 | Use: Coding)
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│    Create Structured Prompt     │  (Injects role, history, guidelines & schema)
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│    Send Prompt to AI Model      │  (Secure backend call to Gemini / OpenAI / Groq)
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│     Generate Recommendations    │  (Filters products matching constraints)
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│     Display Recommendations     │  (Renders UI Product Cards with prices & specs)
└─────────────────────────────────┘
```

---

## 💬 Demonstration Examples

| Input Query | Agent Action | Resulting Output |
| :--- | :--- | :--- |
| `"I need a laptop for programming under ₹60,000."` | Extracts: Category: Laptop, Budget: ₹60,000, Features: 16GB RAM/SSD. | Recommends Acer Aspire Lite (₹42,990), Lenovo IdeaPad Slim 3 (₹52,990), ASUS Vivobook 16X (₹56,990). |
| `"Suggest a smartphone with a good camera."` | Identifies camera/OIS priority; checks best values. | Recommends Google Pixel 7a (₹36,999), Realme 12 Pro+ (₹29,999), Moto Edge 50 Fusion (₹22,999). |
| `"I want a phone."` | Detects vague intent lacking budget & priorities. | Asks: *"What is your budget and what is most important to you—camera, gaming, battery life, or overall performance?"* |
| `"Under ₹3,000 for online classes."` *(Follow-up)* | Merges previous context (headphones) with new criteria. | Recommends JBL Quantum 100 (₹1,999), boAt Rockerz 550 (₹1,799), Sony MDR-ZX110AP (₹1,390). |
| `"Suggest a gift for my friend under ₹2,000."` | Identifies budget limit and lifestyle category. | Recommends boAt Wave Call 2 (₹1,499), Portronics SoundDrum (₹1,299), Parker Vector Pen Set (₹950). |
