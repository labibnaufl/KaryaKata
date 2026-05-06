# You Might Not Need an Effect

> Effects are an escape hatch from the React paradigm. They let you "step outside" of React and synchronize your components with some external system. If there is no external system involved, you shouldn't need an Effect.

---

## When You DON'T Need Effects

### 1. Transforming Data for Rendering

**❌ Bad:** Using an Effect to derive state from props/state.

```tsx
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(firstName + ' ' + lastName);
}, [firstName, lastName]);
```

**✅ Good:** Calculate it during rendering.

```tsx
const fullName = firstName + ' ' + lastName;
```

**Rule:** If something can be calculated from existing props or state, don't put it in state — calculate it during rendering.

---

### 2. Caching Expensive Calculations

**❌ Bad:** Storing computed results in state + Effect.

```tsx
const [visibleTodos, setVisibleTodos] = useState([]);
useEffect(() => {
  setVisibleTodos(getFilteredTodos(todos, filter));
}, [todos, filter]);
```

**✅ Good:** Use `useMemo` for expensive computations.

```tsx
const visibleTodos = useMemo(
  () => getFilteredTodos(todos, filter),
  [todos, filter]
);
```

**Rule:** Use `useMemo` to cache expensive calculations. Only memoize if the computation is genuinely slow (>1ms). React Compiler can auto-memoize in many cases.

---

### 3. Resetting State When a Prop Changes

**❌ Bad:** Resetting state in an Effect on prop change.

```tsx
useEffect(() => {
  setComment('');
}, [userId]);
```

**✅ Good:** Use a `key` to force React to recreate the component.

```tsx
<Profile userId={userId} key={userId} />
```

**Rule:** Pass a `key` prop to tell React that conceptually different data means a different component instance. All state resets automatically.

---

### 4. Adjusting State When a Prop Changes

**❌ Bad:** Adjusting partial state in an Effect.

```tsx
useEffect(() => {
  setSelection(null);
}, [items]);
```

**✅ Better:** Store a derived value instead.

```tsx
const [selectedId, setSelectedId] = useState(null);
const selection = items.find(item => item.id === selectedId) ?? null;
```

**Rule:** Prefer calculating everything during rendering. If you must adjust state on prop change, store IDs instead of objects and derive the rest.

---

### 5. Sharing Logic Between Event Handlers

**❌ Bad:** Putting event-specific logic in an Effect.

```tsx
useEffect(() => {
  if (product.isInCart) {
    showNotification(`Added ${product.name} to the shopping cart!`);
  }
}, [product]);
```

**✅ Good:** Extract shared logic into a function, call it from event handlers.

```tsx
function buyProduct() {
  addToCart(product);
  showNotification(`Added ${product.name} to the shopping cart!`);
}

function handleBuyClick() { buyProduct(); }
function handleCheckoutClick() { buyProduct(); navigateTo('/checkout'); }
```

**Rule:** Ask: "Why does this code run?" If because the user *did something* → event handler. If because the component *appeared on screen* → Effect.

---

### 6. Sending POST Requests

**❌ Bad:** Triggering a POST request via state change + Effect.

```tsx
const [jsonToSubmit, setJsonToSubmit] = useState(null);
useEffect(() => {
  if (jsonToSubmit !== null) {
    post('/api/register', jsonToSubmit);
  }
}, [jsonToSubmit]);
```

**✅ Good:** POST directly in the event handler.

```tsx
function handleSubmit(e) {
  e.preventDefault();
  post('/api/register', { firstName, lastName });
}
```

**Rule:** Requests caused by a specific user interaction belong in event handlers. Analytics/tracking on mount is fine in Effects.

---

### 7. Chains of Effects

**❌ Bad:** Chaining Effects that trigger each other.

```tsx
useEffect(() => { setGoldCardCount(c => c + 1); }, [card]);
useEffect(() => { setRound(r => r + 1); }, [goldCardCount]);
useEffect(() => { setIsGameOver(true); }, [round]);
```

**✅ Good:** Calculate during rendering + compute next state in the event handler.

```tsx
const isGameOver = round > 5; // Derived during render

function handlePlaceCard(nextCard) {
  setCard(nextCard);
  if (nextCard.gold) {
    if (goldCardCount < 3) {
      setGoldCardCount(goldCardCount + 1);
    } else {
      setGoldCardCount(0);
      setRound(round + 1);
    }
  }
}
```

**Rule:** Never chain Effects to adjust state solely to trigger other Effects. Calculate what you can during rendering; do the rest in event handlers.

---

### 8. Notifying Parent Components About State Changes

**❌ Bad:** Calling parent callbacks in an Effect.

```tsx
useEffect(() => {
  onChange(isOn);
}, [isOn, onChange]);
```

**✅ Good:** Update both states in the same event handler.

```tsx
function updateToggle(nextIsOn) {
  setIsOn(nextIsOn);
  onChange(nextIsOn);
}
```

**✅ Even better:** Let the parent fully control the component.

```tsx
function Toggle({ isOn, onChange }) {
  function handleClick() { onChange(!isOn); }
}
```

**Rule:** React batches updates from different components in the same event. Do all updates during the event that caused them. Consider lifting state up.

---

### 9. Passing Data to the Parent

**❌ Bad:** Child fetches data, passes it to parent via Effect.

```tsx
// Child
useEffect(() => {
  if (data) onFetched(data);
}, [onFetched, data]);
```

**✅ Good:** Parent fetches, passes data down to child.

```tsx
// Parent
const data = useSomeAPI();
return <Child data={data} />;
```

**Rule:** Data flows from parent to child. If both need the same data, fetch in the parent and pass it down.

---

### 10. Subscribing to External Stores

**❌ Bad:** Manual subscription in an Effect.

```tsx
useEffect(() => {
  const handler = () => setIsOnline(navigator.onLine);
  window.addEventListener('online', handler);
  window.addEventListener('offline', handler);
  return () => { /* cleanup */ };
}, []);
```

**✅ Good:** Use `useSyncExternalStore`.

```tsx
return useSyncExternalStore(
  subscribe,
  () => navigator.onLine,
  () => true // SSR fallback
);
```

**Rule:** For external store subscriptions (browser APIs, third-party libs), use `useSyncExternalStore` instead of manual Effect subscriptions.

---

### 11. Fetching Data

**❌ Bad:** Fetching without cleanup (race condition).

```tsx
useEffect(() => {
  fetchResults(query, page).then(json => setResults(json));
}, [query, page]);
```

**✅ Good:** Always add cleanup to ignore stale responses.

```tsx
useEffect(() => {
  let ignore = false;
  fetchResults(query, page).then(json => {
    if (!ignore) setResults(json);
  });
  return () => { ignore = true; };
}, [query, page]);
```

**✅ Best:** Use framework-level data fetching (Next.js Server Actions, server components) or extract into a custom hook.

**Rule:** If you fetch data in Effects, always handle race conditions with a cleanup function. Prefer framework-built-in data fetching.

---

## Quick Decision Flowchart

```
Need to run some code?
│
├─ Is it caused by a user interaction (click, submit, drag)?
│  └─ YES → Put it in an EVENT HANDLER
│
├─ Is it derived from existing props/state?
│  └─ YES → CALCULATE DURING RENDERING (or useMemo if expensive)
│
├─ Does it synchronize with an external system (DOM, network, subscription)?
│  └─ YES → Use an EFFECT (with proper cleanup)
│
└─ Does it need to reset state when a prop changes?
   └─ YES → Use a KEY prop
```

## Summary

| Instead of Effect for... | Do this instead |
|---|---|
| Derived/computed values | Calculate during rendering |
| Expensive computations | `useMemo` |
| Resetting all state on prop change | `key` prop |
| Adjusting partial state on prop change | Derive from IDs during rendering |
| Event-specific side effects | Event handlers |
| POST requests from user actions | Event handlers |
| Chained state updates | Single event handler + derived state |
| Notifying parent of state change | Call parent callback in event handler |
| Passing data to parent | Lift fetching to parent, pass data down |
| External store subscriptions | `useSyncExternalStore` |
| Data fetching | Framework mechanisms or custom hooks with cleanup |
