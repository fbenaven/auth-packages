# @fbenaven/auth-bff-react

React bindings for the BFF Auth system. Provides a Context-based `AuthProvider` and a `useAuth` hook for managing authentication state in React applications.

## Features

- **Context Provider**: Manages global session state.
- **Auto-Initialization**: Checks for existing session on mount.
- **Reactive Updates**: UI updates automatically on login/logout.
- **CSRF & 401 Handling**: Integrated with `@fbenaven/auth-bff-client`.

## Installation

```bash
pnpm add @fbenaven/auth-bff-react @fbenaven/auth-bff-client react
```

## Usage

### 1. Wrap Application

Wrap your root component with `AuthProvider`.

```tsx
import { AuthProvider } from '@fbenaven/auth-bff-react';

function App() {
  return (
    <AuthProvider baseUrl="http://localhost:8787">
      <YourRoutes />
    </AuthProvider>
  );
}
```

### 2. Access Auth State

Use the `useAuth` hook in your components.

```tsx
import { useAuth } from '@fbenaven/auth-bff-react';

function Dashboard() {
  const { session, loading, signOut, fetchWithAuth } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!session) return <div>Please log in</div>;

  return (
    <div>
      <h1>Welcome, {session.user.email}</h1>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

### 3. Login Component

```tsx
function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      // State updates automatically, no redirect needed if using conditional rendering
    } catch (err) {
      alert('Login failed');
    }
  };
  
  // ... render form
}
```

### API Reference

**`useAuth()` returns:**

- `session`: The current session object (or `null`).
- `loading`: `boolean` indicating if session is being checked.
- `csrfToken`: The current CSRF token string.
- `signIn(email, password)`: Async function to log in.
- `signOut()`: Async function to log out.
- `fetchWithAuth(url, options)`: Wrapper around `fetch` that handles credentials and CSRF.
