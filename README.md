# PersonalOS

<div align="center">

**Your AI-powered second brain that never forgets**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![memU](https://img.shields.io/badge/memU-Powered-green.svg)](https://github.com/mem0ai/mem0)

[📖 Documentation](./PRODUCT_SPEC.md) | [🏗 Technical Design](./TECHNICAL_DESIGN.md) | [🚀 Quick Start](#quick-start)

</div>

---

## ✨ What is PersonalOS?

PersonalOS is an advanced AI memory companion that captures, organizes, and surfaces your entire digital life. Unlike traditional note-taking apps or simple chatbots, PersonalOS creates a **living, evolving knowledge graph** of everything you experience.

### Key Differentiators

| Feature | PersonalOS | Pickle OS | Other Tools |
|---------|-----------|-----------|-------------|
| **Memory Structure** | Hierarchical + Graph | Flat clusters | Linear notes |
| **Visualization** | Interactive graphs & timelines | Basic UI | Text only |
| **Integrations** | 10+ sources | 3 sources | Limited |
| **Privacy** | 3-tier (Cloud/Hybrid/Local) | Cloud only | Varies |
| **Proactive AI** | ✅ Anticipates needs | ❌ Reactive | ❌ Reactive |
| **Customization** | AI persona + plugins | Fixed | Limited |
| **Open Source** | ✅ Core free | ❌ Proprietary | Varies |

---

## 🎯 Core Features

### 1. Advanced Memory System

```
/memory
  /active      → Last 7 days (hot memory)
  /working     → Current projects
  /reference   → Frequently accessed
  /archive     → Cold storage
```

**Memory moves through layers automatically** based on access patterns and importance.

### 2. Semantic Knowledge Graph

```
[You] ───likes──→ [Philosophy]
                      │
                  interests
                      │
                      ↓
                  [Nietzsche] ───wrote──→ [Zarathustra]
                      │
                  influences
                      ↓
                  [Existentialism]
```

Discover hidden connections. Ask: *"What connects my interest in philosophy with my weekend habits?"*

### 3. Multi-Source Integration

Connect your entire digital life:

- 💬 **Chat** - All conversations
- 📅 **Calendar** - Events & meetings
- 📧 **Email** - Important messages
- 🌐 **Browser** - Bookmarks & history
- 📄 **Files** - Documents & PDFs
- 💻 **GitHub** - Code & commits
- 📝 **Notion** - Notes & databases
- 💼 **Slack** - Work conversations
- 🐦 **Twitter** - Saved threads
- 📸 **Photos** - With OCR

Everything syncs automatically in the background.

### 4. Proactive AI Assistant

PersonalOS doesn't wait for you to ask—it **anticipates your needs**:

```
Good morning! Here's your briefing:

📅 Today's Schedule:
  • 10:00 - Team meeting
    → I pulled up notes from last meeting

📝 Follow-ups:
  • You said you'd review John's PR today
  • That book you wanted is now available

💡 Suggestion:
  Based on your calendar, block 2-3pm for deep work
```

### 5. Interactive Visualization

- **Memory Graph** - Explore connections visually
- **Timeline View** - See your memory over time
- **Heatmap** - Discover your most active topics
- **Memory Flow** - Watch memories move through layers

### 6. Privacy by Design

Choose your privacy level:

1. **Full Cloud** - Best experience, encrypted
2. **Hybrid** - Sensitive data local, rest cloud
3. **Full Local** - 100% offline with local LLM

Your data is always encrypted. We can't read it even if we wanted to.

### 7. AI Persona Customization

Make your AI truly yours:

```
Name: "Alfred" (like Batman's butler)

Personality:
  Formality:   ■■■■□□□ (Professional but warm)
  Verbosity:   ■■□□□□□ (Concise)
  Humor:       ■■■■■□□ (Often humorous)
  Proactivity: ■■■■■■■ (Very proactive)
```

### 8. Open Plugin System

Extend PersonalOS with community plugins:

- 🌦️ Weather Tracker
- ⏱️ Time Tracker
- 📚 Reading Companion
- 🏋️ Fitness Logger
- 🎵 Music Memory
- 💰 Expense Tracker

Or create your own!

---

## 🚀 Quick Start

### One-Command Setup

```bash
# Clone repository
git clone https://github.com/yourusername/personalos.git
cd personalos

# Set up environment
cp .env.example .env
# Edit .env and add your API keys

# Start with Docker
docker-compose up -d

# Open in browser
open http://localhost:3000
```

That's it! 🎉

---

## 📖 Documentation

- **[Product Specification](./PRODUCT_SPEC.md)** - Complete feature specifications
- **[Technical Design](./TECHNICAL_DESIGN.md)** - Architecture and implementation details
- **API Documentation** - Coming soon
- **Plugin Development Guide** - Coming soon

---

## 🛠 Development

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- OpenAI API key (or Anthropic Claude)

### Manual Setup

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start Qdrant (vector database)
docker run -p 6333:6333 qdrant/qdrant

# Run backend
uvicorn main:app --reload
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run development server
npm run dev
```

### Running Tests

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

---

## 🏗 Project Structure

```
personalos/
├── backend/                # FastAPI backend
│   ├── api/               # API endpoints
│   ├── services/          # Business logic
│   │   ├── memory_manager.py
│   │   ├── ai_assistant.py
│   │   ├── sync_service.py
│   │   └── plugin_manager.py
│   ├── models/            # Data models
│   └── core/              # Configuration
├── frontend/              # Next.js frontend
│   ├── app/              # Pages
│   ├── components/       # React components
│   ├── lib/              # Utilities
│   └── types/            # TypeScript types
├── plugins/              # Community plugins
├── docs/                 # Documentation
├── tests/                # Test suites
└── docker-compose.yml    # Docker setup
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Report bugs** - Open an issue with details
2. **Suggest features** - Share your ideas
3. **Submit PRs** - Fix bugs or add features
4. **Create plugins** - Extend PersonalOS
5. **Improve docs** - Help others understand

### Development Workflow

```bash
# 1. Fork and clone
git clone https://github.com/yourusername/personalos.git

# 2. Create feature branch
git checkout -b feature/amazing-feature

# 3. Make changes and test
# ... your changes ...
pytest tests/

# 4. Commit with clear message
git commit -m "feat: add amazing feature"

# 5. Push and create PR
git push origin feature/amazing-feature
```

---

## 🗺 Roadmap

### ✅ Phase 1: MVP (Current)
- [x] Core memory system
- [x] Basic chat interface
- [x] Manual data input
- [ ] Simple visualization

### 🚧 Phase 2: Integrations (In Progress)
- [ ] Calendar integration
- [ ] Email integration
- [ ] Browser extension
- [ ] File upload

### 📋 Phase 3: Intelligence (Q2 2026)
- [ ] Proactive suggestions
- [ ] Memory graph visualization
- [ ] Advanced search
- [ ] AI persona customization

### 📋 Phase 4: Collaboration (Q3 2026)
- [ ] Memory sharing
- [ ] Team spaces
- [ ] Comments & annotations

### 📋 Phase 5: Platform (Q4 2026)
- [ ] Plugin system
- [ ] Plugin marketplace
- [ ] Mobile apps
- [ ] Public API

---

## 💰 Pricing

### Free (Open Source)
- Unlimited memories (self-hosted)
- Basic integrations
- Community plugins
- Standard AI processing

### Premium ($10/month)
- Cloud hosting
- Priority AI processing
- Team collaboration
- Advanced analytics
- Premium plugins
- Email support

### Enterprise (Custom)
- On-premise deployment
- SSO & advanced security
- Dedicated support
- Custom integrations
- SLA guarantee

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with amazing open-source technologies:

- **[memU](https://github.com/mem0ai/mem0)** - Memory framework
- **[FastAPI](https://fastapi.tiangolo.com/)** - Backend framework
- **[Next.js](https://nextjs.org/)** - Frontend framework
- **[Qdrant](https://qdrant.tech/)** - Vector database
- **[shadcn/ui](https://ui.shadcn.com/)** - UI components

---

## 📞 Contact

- **GitHub**: [@yourusername](https://github.com/yourusername)
- **Email**: your.email@example.com
- **Twitter**: [@yourhandle](https://twitter.com/yourhandle)
- **Discord**: [Join our community](https://discord.gg/personalos)

---

## 🌟 Star History

If you find PersonalOS useful, please consider giving it a star! ⭐

---

<div align="center">

**Made with ❤️ and AI**

[⬆ Back to Top](#personalos)

</div>
