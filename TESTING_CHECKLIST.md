# 🧪 LOCAL TESTING CHECKLIST

## ✅ Build Verification (Complete)
- [x] Build command ran successfully
- [x] 0 compilation errors
- [x] All 22 pages prerendered
- [x] Service worker compiled

---

## 📋 Manual Testing Checklist (YOUR TURN)

### 1️⃣ Header Navigation Links
- [ ] **Desktop:** Hover over "Recipes" link → should turn orange
- [ ] **Desktop:** Hover over "Videos" link → should turn orange  
- [ ] **Desktop:** Hover over "Blog" link → should turn orange
- [ ] **Desktop:** Hover over "Favorites" link → should turn orange
- [ ] **Keyboard:** Tab through links → should see blue focus rings
- [ ] **Dark Mode:** Switch to dark mode → colors should auto-adjust (light text)
- [ ] **Mobile:** Navigate to mobile view → links should stack properly

### 2️⃣ Install App Buttons
- [ ] **Desktop:** Install button visible with "Install app" text
- [ ] **Desktop:** Hover over button → should turn darker orange
- [ ] **Desktop:** Tab to button → should see focus ring
- [ ] **Mobile:** Install button shows with "Install app" text
- [ ] **Mobile:** Hover over button → should turn darker orange
- [ ] **Dark Mode:** Button colors visible and readable
- [ ] **Functionality:** Click button → should show install prompt

### 3️⃣ Bottom Navigation (Mobile Only)
- [ ] **Mobile:** Tap "Home" icon → icon turns orange, text turns orange
- [ ] **Mobile:** Tap "Recipes" icon → icon turns orange, text turns orange
- [ ] **Mobile:** Tap "Videos" icon → icon turns orange, text turns orange
- [ ] **Mobile:** Tap "Blog" icon → icon turns orange, text turns orange
- [ ] **Mobile:** Tap "Favorites" icon → icon turns orange, text turns orange
- [ ] **Mobile:** Inactive items show as gray/muted
- [ ] **Dark Mode:** Colors invert properly (light text on dark background)

### 4️⃣ Search Bar Layout
- [ ] **Desktop:** Search input and "Search" button aligned on same line
- [ ] **Desktop:** No overlapping elements
- [ ] **Desktop:** Button text says "Search"
- [ ] **Mobile:** Search input takes full width
- [ ] **Mobile:** "Go" button appears on right side (responsive text)
- [ ] **Mobile:** Input and button aligned at same height
- [ ] **Focus:** Tab through search → can focus input and button

### 5️⃣ Dark Mode (All Components)
- [ ] Toggle dark mode in top-right corner
- [ ] Header colors adjust automatically
- [ ] Navigation text becomes lighter
- [ ] Buttons remain visible
- [ ] Search bar readable
- [ ] Bottom nav colors invert

### 6️⃣ Overall Visual Check
- [ ] No hardcoded orange/brown colors visible
- [ ] All colors are from the design system
- [ ] Consistent spacing and alignment
- [ ] Smooth hover/transition effects
- [ ] Focus rings visible on keyboard navigation

---

## 🚀 When You're Ready to Push

Once all tests pass, run:

```bash
git status  # Review changes
git add -A
git commit -m "fix: Replace inline styles with design system classes (Header, BottomNav, HomePage)"
git push origin main
```

---

## 📸 Quick Visual Guide

**What Changed:**
1. **Header:** No more `onMouseEnter/Leave` events → CSS hover classes
2. **Buttons:** No more inline `style` props → Tailwind classes
3. **BottomNav:** No more hardcoded `#FF7518` colors → design tokens
4. **Search:** Fixed alignment issues on mobile

**What Stayed the Same:**
- Footer behavior (hidden on mobile - native app feel)
- All functionality
- All existing content
- Site structure

---

## 💡 Notes

- Changes are ready to test locally
- Build is clean (0 errors)
- NOT pushed to origin/main yet
- All changes backward compatible
- No breaking changes to API or functionality

**Ready when you are! Let me know how the tests go.** ✨
