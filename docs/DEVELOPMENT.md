# JWST Deep Sky Explorer - Development Setup

## 🚀 **Quick Start**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5000
```

## 🛠️ **Available Scripts**

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start development server with hot reload |
| `npm run build`        | Build for production                     |
| `npm run preview`      | Preview production build                 |
| `npm run lint`         | Run ESLint checks                        |
| `npm run lint:fix`     | Auto-fix ESLint issues                   |
| `npm run format`       | Format code with Prettier                |
| `npm run format:check` | Check Prettier formatting                |
| `npm run type-check`   | Run TypeScript type checking             |
| `npm run check-all`    | Run all checks (type, lint, format)      |

## 🔧 **Development Tools Configuration**

### ✅ **ESLint**

- Modern flat config (`eslint.config.js`)
- TypeScript + React rules
- GitHub Spark framework compatible
- Auto-fix on save in VS Code

### ✅ **Prettier**

- Consistent code formatting
- GitHub Spark patterns support
- Integrated with ESLint

### ✅ **TypeScript**

- Strict mode enabled
- ES2021 target for modern features
- Path aliases (`@/` → `src/`)

### ✅ **Husky + lint-staged**

- Pre-commit hooks for quality assurance
- Automatic linting and formatting on commit

### ✅ **VS Code Workspace**

- 12+ recommended extensions
- Optimized settings for React + TypeScript
- Integrated tasks and debugging
- NASA API testing capabilities

## 🎯 **Code Quality Standards**

### **Linting Rules**

- ✅ No unused variables (prefix with `_` if intentional)
- ✅ Prefer `const` over `let` where possible
- ✅ Explicit error handling in catch blocks
- ✅ No `console.log` in production (warnings only)
- ✅ React Hooks dependency validation

### **Formatting Standards**

- ✅ 2-space indentation
- ✅ Single quotes for strings
- ✅ No semicolons
- ✅ 100-character line length
- ✅ Trailing commas where valid

### **TypeScript Standards**

- ✅ Strict mode enabled
- ✅ No `any` types (use proper interfaces)
- ✅ Proper error boundary typing
- ✅ GitHub Spark KV type compatibility

## 🧪 **Testing & Validation**

### **Pre-commit Checklist**

Husky automatically runs these checks before each commit:

1. **Lint staged files** - ESLint with auto-fix
2. **Format staged files** - Prettier formatting
3. **Type check** - TypeScript validation

### **Manual Quality Checks**

```bash
# Run comprehensive checks
npm run check-all

# Individual checks
npm run type-check  # TypeScript errors
npm run lint        # ESLint issues
npm run format:check # Formatting issues
```

## 🌌 **NASA API Integration**

### **Environment Setup**

```bash
# Optional: Add NASA API key for enhanced features
echo "VITE_NASA_API_KEY=your_key_here" > .env.local
echo "VITE_ENABLE_NASA_API_KEY=true" >> .env.local
```

### **API Testing**

Use VS Code tasks:

- **Task**: "Test NASA Connection"
- **Task**: "Test NASA Images API"

## 📁 **Project Structure**

```
src/
├── components/           # Feature components
│   ├── ui/              # Radix UI primitives
│   ├── Timeline.tsx     # Core cosmic timeline
│   ├── TelescopeAnatomy.tsx
│   └── ...
├── hooks/               # Custom React hooks
├── lib/                 # Utilities & APIs
│   ├── nasa-api.ts     # NASA Images API
│   ├── types.ts        # TypeScript definitions
│   └── utils.ts        # Helper functions
└── styles/             # CSS and themes
    └── theme.css       # GitHub Spark theming
```

## 🎨 **GitHub Spark Framework**

### **Key Integrations**

- ✅ KV storage with localStorage fallback
- ✅ Spark-specific Vite plugins (DO NOT REMOVE)
- ✅ Theme system integration
- ✅ Icon proxy for Phosphor Icons

### **Development Notes**

- KV storage may be unavailable in dev - graceful fallbacks implemented
- Spark services show 401 errors in dev console - this is expected
- localStorage persistence works as fallback for favorites

## 🔄 **Git Workflow**

### **Recommended Flow**

1. **Create feature branch**: `git checkout -b feature/your-feature`
2. **Make changes**: Edit code with VS Code assistance
3. **Pre-commit**: Husky runs quality checks automatically
4. **Commit**: `git commit -m "feat: your description"`
5. **Push**: `git push origin feature/your-feature`

### **Quality Gates**

- ✅ ESLint passes (errors block commits)
- ✅ Prettier formatting applied
- ✅ TypeScript compiles successfully
- ✅ No console errors in browser

## 🚨 **Troubleshooting**

### **Common Issues**

| Issue                         | Solution                                       |
| ----------------------------- | ---------------------------------------------- |
| ESLint errors blocking commit | Run `npm run lint:fix`                         |
| TypeScript compilation errors | Check `npm run type-check`                     |
| Prettier formatting issues    | Run `npm run format`                           |
| Missing types for packages    | Install `@types/package-name`                  |
| Spark KV 401 errors           | Expected in dev - localStorage fallback active |

### **Development Server Issues**

```bash
# Kill existing process
npm run kill

# Restart clean
npm run dev
```

### **VS Code Not Working**

1. Install recommended extensions (prompted on open)
2. Restart VS Code
3. Check TypeScript service is running
4. Verify workspace settings loaded

---

## 📚 **Additional Resources**

- **GitHub Spark Docs**: Framework-specific patterns
- **NASA Images API**: Public API documentation
- **Copilot Instructions**: `.github/instructions/copilot-instructions.md`
- **Product Requirements**: `PRD.md`

**Happy coding! 🚀🔭**
