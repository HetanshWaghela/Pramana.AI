# Frontend Documentation

Complete guide to Pramana.ai's React 19 frontend, including UI components, landing page design, and development workflow.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Landing Page](#landing-page)
- [Chat Application](#chat-application)
- [Design System](#design-system)
- [State Management](#state-management)
- [API Integration](#api-integration)

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.0.0 | UI framework with concurrent rendering |
| **TypeScript** | 5.7 | Type-safe development |
| **Vite** | 6.4 | Fast build tool and dev server |
| **Tailwind CSS** | 4.1 | Utility-first styling |
| **Framer Motion** | 12.x | Animation library |
| **React Router** | 7.5 | Client-side routing |
| **Radix UI** | Latest | Accessible component primitives |
| **Lucide React** | Latest | Icon library |
| **Recharts** | 2.15 | Data visualization |

---

## Project Structure

```
frontend/src/
├── components/
│   ├── auth/                    # Authentication
│   │   ├── LoginPage.tsx        # Login form + JWT handling
│   │   ├── RegisterPage.tsx     # User registration
│   │   └── index.ts             # Exports
│   │
│   ├── landing/                 # Marketing landing page
│   │   ├── LandingPage.tsx      # Main composition
│   │   ├── Navigation.tsx       # Sticky header with scroll
│   │   ├── HeroSection.tsx      # Animated hero with mockups
│   │   ├── Features.tsx         # Three feature cards
│   │   ├── SaiSection.tsx       # AI workflow visualization
│   │   ├── Portfolio.tsx        # Dashboard preview
│   │   ├── Comparison.tsx       # Manual vs Pramana table
│   │   ├── CTA.tsx              # Call-to-action section
│   │   ├── Footer.tsx           # Footer with links
│   │   ├── AppMockup.tsx        # Floating app mockup animation
│   │   └── index.ts             # Exports
│   │
│   ├── insights/                # Data visualization components
│   │   ├── CompetitionHeatmap.tsx
│   │   ├── MarketGrowth.tsx
│   │   ├── OpportunityRadar.tsx
│   │   ├── PatentTimeline.tsx
│   │   ├── Signals.tsx
│   │   └── index.ts
│   │
│   ├── ui/                      # Reusable UI primitives (Radix + Tailwind)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   │
│   ├── ChatApp.tsx              # Main chat (no sidebar)
│   ├── ChatAppWithSidebar.tsx   # Chat with conversation history
│   ├── ChatMessagesView.tsx     # Message list renderer
│   ├── ChatSidebar.tsx          # Conversation list + management
│   ├── InputForm.tsx            # Message input + agent selector
│   ├── WelcomeScreen.tsx        # Empty state
│   ├── ActivityTimeline.tsx     # Real-time agent activity feed
│   └── ToolMessageDisplay.tsx   # Tool call visualization
│
├── lib/
│   ├── auth.ts                  # Authentication service
│   ├── chatService.ts           # LangGraph API client
│   ├── agents.ts                # Agent definitions
│   ├── models.ts                # Model configurations
│   └── utils.ts                 # Utility functions (cn, etc.)
│
├── types/
│   ├── agents.ts                # Agent type definitions
│   ├── messages.ts              # Message schemas
│   ├── models.ts                # Model types
│   └── tools.ts                 # Tool schemas
│
├── utils/
│   └── animationConfig.ts       # Framer Motion presets
│
├── App.tsx                      # Root component with routing
├── main.tsx                     # Entry point
├── global.css                   # Global styles + Tailwind
└── vite-env.d.ts                # Vite type definitions
```

---

## Landing Page

The landing page features a **neo-brutalist design** with bold colors, thick borders, and prominent shadows.

### Design Philosophy

- **Bold & Playful** — Thick borders, vibrant colors, heavy shadows
- **High Contrast** — Black borders on bright backgrounds
- **Brutalist Typography** — Bold, impactful headings
- **Smooth Animations** — Framer Motion for delightful interactions

---

### Components Breakdown

#### 1. Navigation

**File:** `components/landing/Navigation.tsx`

**Features:**
- Sticky header with scroll detection
- Smooth scroll to sections
- Mobile-responsive menu (hamburger)
- CTA button ("Try Pramana.ai")

**Styling:**
```tsx
<nav className="sticky top-0 z-50 bg-white border-b-3 border-black shadow-brutal">
  <div className="container mx-auto px-6 py-4 flex items-center justify-between">
    <Logo />
    <NavLinks />
    <CTAButton />
  </div>
</nav>
```

---

#### 2. HeroSection

**File:** `components/landing/HeroSection.tsx`

**Features:**
- Animated headline with staggered text reveal
- Floating app mockup (3D transform)
- Gradient background
- Call-to-action buttons

**Animation:**
```tsx
<motion.h1
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  Master biomedical evidence. Without the silos.
</motion.h1>
```

---

#### 3. Features

**File:** `components/landing/Features.tsx`

**Layout:** Three-column grid with colored cards

**Cards:**
1. **🧬 Purpose-Built** (Yellow background)
2. **⚡ Lightning-Fast** (Pink background)
3. **🔌 Extensible** (Green background)

**Styling:**
```tsx
<div className="grid md:grid-cols-3 gap-6">
  <Card className="bg-brand-yellow border-3 border-black shadow-brutal">
    <Icon />
    <Title />
    <Description />
  </Card>
</div>
```

---

#### 4. SaiSection

**File:** `components/landing/SaiSection.tsx`

**Purpose:** Visualize AI workflow with step-by-step process

**Design:** Horizontal timeline with animated checkpoints

---

#### 5. Portfolio

**File:** `components/landing/Portfolio.tsx`

**Purpose:** Preview the Portfolio Strategist dashboard

**Components:**
- Opportunity score gauge
- Signal cards
- Market data charts (Recharts)

---

#### 6. Comparison

**File:** `components/landing/Comparison.tsx`

**Layout:** Two-column table (Manual vs Pramana.ai)

**Styling:** Neo-brutalist table with thick borders

---

#### 7. CTA (Call-to-Action)

**File:** `components/landing/CTA.tsx`

**Design:** Centered section with gradient background and prominent button

---

#### 8. Footer

**File:** `components/landing/Footer.tsx`

**Content:**
- Logo and tagline
- Navigation links
- Social links (GitHub, Twitter, etc.)
- Copyright notice

---

### AppMockup Component

**File:** `components/landing/AppMockup.tsx`

**Purpose:** Floating animated app screenshot

**Animation:**
```tsx
<motion.div
  animate={{
    y: [0, -10, 0],
    rotate: [0, 1, 0, -1, 0]
  }}
  transition={{
    duration: 5,
    repeat: Infinity,
    ease: "easeInOut"
  }}
>
  <img src="/mockup.png" alt="App Preview" />
</motion.div>
```

---

## Chat Application

### Architecture

```
ChatAppWithSidebar
├── ChatSidebar
│   ├── New Chat Button
│   ├── Chat List
│   └── User Profile
└── ChatApp
    ├── WelcomeScreen (empty state)
    ├── ChatMessagesView
    │   ├── Message (user)
    │   ├── Message (AI)
    │   ├── ToolMessageDisplay
    │   └── ActivityTimeline
    └── InputForm
        ├── Agent Selector
        ├── Text Input
        └── Send Button
```

---

### Key Components

#### ChatApp

**File:** `components/ChatApp.tsx`

**State Management:**
```tsx
const [messages, setMessages] = useState<Message[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [threadId, setThreadId] = useState<string | null>(null);
```

**Message Submission:**
```tsx
const handleSubmit = async (content: string, agentId: string) => {
  // 1. Create thread (if new conversation)
  if (!threadId) {
    const { thread_id } = await chatService.createThread();
    setThreadId(thread_id);
  }
  
  // 2. Add user message
  setMessages(prev => [...prev, { role: 'user', content }]);
  
  // 3. Submit to LangGraph
  const { run_id } = await chatService.submitMessage(threadId, content, agentId);
  
  // 4. Stream response
  await chatService.streamResponse(threadId, run_id, (chunk) => {
    // Update messages with streaming data
    setMessages(prev => [...prev, chunk]);
  });
};
```

---

#### ChatMessagesView

**File:** `components/ChatMessagesView.tsx`

**Message Rendering:**
```tsx
export function ChatMessagesView({ messages }: Props) {
  return (
    <div className="flex flex-col space-y-4 p-4">
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} />
      ))}
    </div>
  );
}
```

**Message Types:**
- **User Message** — Right-aligned, blue background
- **AI Message** — Left-aligned, gray background
- **Tool Call** — Special formatting with `ToolMessageDisplay`
- **Thinking** — Loading indicator

---

#### ActivityTimeline

**File:** `components/ActivityTimeline.tsx`

**Purpose:** Show real-time agent activity (tool calls, thinking steps)

**Design:** Vertical timeline with animated checkpoints

**Example:**
```
✓ Generated search queries
✓ Searching web (SerpAPI)
⏳ Reflecting on results...
```

---

#### InputForm

**File:** `components/InputForm.tsx`

**Features:**
- Agent selector dropdown
- Multi-line text input
- Send button (Enter to submit, Shift+Enter for new line)
- File upload (future feature)

**Agent Selector:**
```tsx
<Select value={agentId} onValueChange={setAgentId}>
  <SelectTrigger>
    <SelectValue placeholder="Select agent" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="deep_researcher">🔍 Deep Researcher</SelectItem>
    <SelectItem value="portfolio_strategist">💼 Portfolio Strategist</SelectItem>
    <SelectItem value="chatbot">💬 Chat Assistant</SelectItem>
    <SelectItem value="math_agent">🧮 Math Solver</SelectItem>
    <SelectItem value="mcp_agent">🔧 MCP Agent</SelectItem>
  </SelectContent>
</Select>
```

---

## Design System

### Color Palette

```css
/* Neo-brutalist brand colors */
--brand-yellow: #FDE047;
--brand-pink: #F9A8D4;
--brand-green: #4ADE80;
--brand-blue: #60A5FA;

/* Neutrals */
--black: #000000;
--white: #FFFFFF;
--gray-100: #F3F4F6;
--gray-800: #1F2937;
```

---

### Typography

```css
/* Font families */
font-family: 'Inter', sans-serif;  /* Body text */
font-family: 'Space Grotesk', sans-serif;  /* Headings (optional) */

/* Font sizes (Tailwind) */
text-xs    /* 0.75rem / 12px */
text-sm    /* 0.875rem / 14px */
text-base  /* 1rem / 16px */
text-lg    /* 1.125rem / 18px */
text-xl    /* 1.25rem / 20px */
text-2xl   /* 1.5rem / 24px */
text-4xl   /* 2.25rem / 36px */
text-6xl   /* 3.75rem / 60px */
```

---

### Shadows & Borders

**Neo-Brutalist Utilities:**

```css
/* Brutal shadow */
.shadow-brutal {
  box-shadow: 8px 8px 0px 0px rgba(0, 0, 0, 1);
}

/* Thick borders */
.border-3 {
  border-width: 3px;
}

/* Usage */
<div className="border-3 border-black shadow-brutal rounded-lg bg-brand-yellow">
  Content
</div>
```

---

### Button Styles

```tsx
// Primary button (Call-to-action)
<button className="
  bg-black text-white
  border-3 border-black
  px-8 py-3 rounded-lg
  shadow-brutal
  hover:translate-x-1 hover:translate-y-1
  hover:shadow-none
  transition-all duration-200
">
  Get Started
</button>

// Secondary button
<button className="
  bg-white text-black
  border-3 border-black
  px-6 py-2 rounded-lg
  hover:bg-gray-100
  transition-colors
">
  Learn More
</button>
```

---

### Card Component

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card className="border-3 border-black shadow-brutal">
  <CardHeader>
    <CardTitle>Portfolio Strategist</CardTitle>
  </CardHeader>
  <CardContent>
    AI-powered pharmaceutical innovation discovery
  </CardContent>
</Card>
```

---

## State Management

### Authentication State

**Storage:** `localStorage` for JWT token persistence

```tsx
// lib/auth.ts
export const authService = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${AUTH_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const { access_token, user } = await response.json();
    
    // Store token
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { token: access_token, user };
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getToken: () => localStorage.getItem('token'),
  getUser: () => JSON.parse(localStorage.getItem('user') || 'null')
};
```

---

### Chat State

**Managed in:** `ChatApp.tsx` component state

```tsx
interface ChatState {
  messages: Message[];
  isLoading: boolean;
  threadId: string | null;
  error: string | null;
}
```

**No global state management** — React Context or Zustand could be added for multi-component state sharing.

---

## API Integration

### Chat Service

**File:** `lib/chatService.ts`

```typescript
const LANGGRAPH_API = 'http://localhost:2024';

export const chatService = {
  // Create new conversation thread
  createThread: async (): Promise<{ thread_id: string }> => {
    const response = await fetch(`${LANGGRAPH_API}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata: {} })
    });
    return response.json();
  },
  
  // Submit message to agent
  submitMessage: async (
    threadId: string,
    message: string,
    agentId: string
  ): Promise<{ run_id: string }> => {
    const response = await fetch(`${LANGGRAPH_API}/threads/${threadId}/runs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assistant_id: agentId,
        input: {
          messages: [{ role: 'user', content: message }]
        },
        stream_mode: ['values', 'updates']
      })
    });
    return response.json();
  },
  
  // Stream agent response (Server-Sent Events)
  streamResponse: async (
    threadId: string,
    runId: string,
    onMessage: (data: any) => void
  ): Promise<void> => {
    const eventSource = new EventSource(
      `${LANGGRAPH_API}/threads/${threadId}/runs/${runId}/stream`
    );
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };
    
    eventSource.addEventListener('end', () => {
      eventSource.close();
    });
    
    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
    };
  }
};
```

---

### Authentication Service

**File:** `lib/auth.ts`

See [Authentication State](#authentication-state) section above.

---

## Animation Presets

**File:** `utils/animationConfig.ts`

```typescript
import { Variants } from 'framer-motion';

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const scaleIn: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1 }
};

// Usage
<motion.div
  variants={fadeInUp}
  initial="hidden"
  animate="visible"
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

---

## Development Workflow

### Running Dev Server

```bash
cd frontend
npm run dev
```

**Hot Module Replacement (HMR):** Changes reflect instantly without full reload.

---

### Building for Production

```bash
npm run build
```

**Output:** `dist/` folder with optimized assets

**Preview Production Build:**
```bash
npm run preview
```

---

### Type Checking

```bash
npx tsc --noEmit
```

**Continuous Type Checking:**
```bash
npx tsc --noEmit --watch
```

---

### Linting

```bash
npm run lint
```

**Auto-fix:**
```bash
npm run lint -- --fix
```

---

## Related Documentation

- [Architecture](architecture.md) — System architecture overview
- [API Reference](api.md) — Backend API integration
- [Development](development.md) — Development workflow
- [Design System](https://ui.shadcn.com/) — Radix UI + Tailwind components

---

**Questions?** Check the [Troubleshooting Guide](troubleshooting.md) or open an issue on GitHub.
