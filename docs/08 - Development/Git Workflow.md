# 🌿 Git Workflow

PAWLSE follows a clean **Feature Branch Git Workflow** to ensure stability on the `main` branch.

---

## 🌳 Branching Strategy

```mermaid
gitGraph
    commit id: "Initial Commit"
    branch develop
    checkout develop
    commit id: "Setup Laravel 13"
    branch feature/rescue-ai
    checkout feature/rescue-ai
    commit id: "Implement PetController::predict"
    commit id: "Add AiValidation UI"
    checkout develop
    merge feature/rescue-ai id: "PR #1 Merged"
    branch fix/otp-rate-limit
    checkout fix/otp-rate-limit
    commit id: "Fix OTP resend timer"
    checkout develop
    merge fix/otp-rate-limit id: "PR #2 Merged"
    checkout main
    merge develop id: "Release v1.0.0" tag: "v1.0.0"
```

---

## 🏷️ Branch Naming Conventions

- **Features**: `feature/<feature-name>` (e.g. `feature/donation-checkout`, `feature/live-map`)
- **Bug Fixes**: `fix/<bug-description>` (e.g. `fix/avatar-upload-path`, `fix/haversine-coords`)
- **Documentation**: `docs/<topic>` (e.g. `docs/obsidian-vault-setup`)
- **Refactoring**: `refactor/<module>` (e.g. `refactor/donation-transition`)

---

## 📝 Commit Message Standard

Follow the **Conventional Commits** standard:
- `feat: add AI confidence threshold slider in super-admin`
- `fix: resolve duplicate calculation when coordinates are missing`
- `docs: add comprehensive database relationship documentation`
- `refactor: extract adoption status state machine to domain class`
- `test: add feature test for cash donation verification`

---

## 🔗 Related Documentation
- [[Development Workflow]]
- [[Testing]]
- [[Deployment]]
