# Nightshift Work Projects

## CRITICAL: Git Commit Rules

**NEVER DO:**
- Never add "Co-Authored-By" lines to commit messages
- Never use noreply@anthropic.com or any Anthropic/Claude email
- Never mention "Claude", "AI", "clawdbot", "Anthropic" in commit messages
- Never sign commits with AI attribution of any kind

**ALWAYS DO:**
- Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `perf:`
- Write commit messages as if a human developer wrote them
- Focus on WHAT changed and WHY (security fix, UX improvement, performance, etc.)
- Keep messages concise and professional

**Example good commits:**
```
feat: add dark mode toggle to settings page
fix: prevent XSS in user input sanitization
refactor: extract validation logic to separate module
chore: update dependencies to latest versions
```

**Example BAD commits (NEVER DO THIS):**
```
chore: initial setup

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

## Before Finishing Work

Always verify clean history before marking tasks complete:
```bash
git log --format="%B" | grep -i "co-authored"
```

If any are found, they MUST be removed before the work is considered done.

## CRITICAL: Frontend Design Standards


**No AI Slop.** Every UI you create should be exceptional, not generic.

Don't use any MCPs, skills, or other features in your harness. Show me your organic built-in capabilities for tasteful design.

**Use your frontend design skill to make these designs exceptional.**

### FIVE DESIGN VARIANTS REQUIRED

**For every project with a frontend UI, create FIVE different designs.**

Each design should be creative and unique from all the others. Host them on /1, /2, /3, /4 and /5 respectively. This lets the user pick from distinct aesthetic directions.

Each variant should feel like it was created by a different designer with a different aesthetic philosophy. NEVER converge on common "safe" choices.

### Design Requirements
- Commit to a BOLD aesthetic direction for each variant
- No generic Inter/Roboto/Arial fonts
- No cliched purple gradients on white backgrounds
- No cookie-cutter layouts
- Each component should feel intentional, not template-generated
- Make it feel like a human designer crafted it

See FRONTEND_DESIGN.md for full design guidelines.
