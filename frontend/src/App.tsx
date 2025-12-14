import { useEffect, useMemo, useState } from 'react';
import './App.css';
import {
  login,
  register,
  getSweets,
  searchSweets,
  createSweet,
  updateSweet,
  deleteSweet,
  purchaseSweet,
  restockSweet
} from './api';
import type { User, Sweet } from './api';

type AuthMode = 'login' | 'register';

function App() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? (JSON.parse(stored) as User) : null;
  });

  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchName, setSearchName] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [form, setForm] = useState<Omit<Sweet, 'id'>>({ name: '', category: '', price: 0, quantity: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [purchaseQty, setPurchaseQty] = useState<Record<string, number>>({});
  const [restockQty, setRestockQty] = useState<Record<string, number>>({});

  const isAdmin = user?.role === 'admin';

  const loadSweets = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getSweets(token);
      setSweets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadSweets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const action = authMode === 'login' ? login : register;
      const payload = authMode === 'login' ? { email, password } : { email, password, name };
      const res = await action(payload as any);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      await loadSweets();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setSweets([]);
  };

  const handleSearch = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const results = await searchSweets(token, { name: searchName, category: searchCategory, minPrice, maxPrice });
      setSweets(results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', category: '', price: 0, quantity: 0 });
    setEditingId(null);
  };

  const handleSaveSweet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    try {
      if (editingId) {
        const updated = await updateSweet(token, editingId, form);
        setSweets((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
      } else {
        const created = await createSweet(token, form);
        setSweets((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    setError(null);
    try {
      await deleteSweet(token, id);
      setSweets((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePurchase = async (id: string) => {
    if (!token) return;
    const qty = purchaseQty[id] ?? 1;
    setError(null);
    try {
      const updated = await purchaseSweet(token, id, qty);
      setSweets((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRestock = async (id: string) => {
    if (!token || !isAdmin) return;
    const qty = restockQty[id] ?? 1;
    setError(null);
    try {
      const updated = await restockSweet(token, id, qty);
      setSweets((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const sortedSweets = useMemo(() => sweets.slice().sort((a, b) => a.name.localeCompare(b.name)), [sweets]);

  if (!token || !user) {
    return (
      <div className="container">
        <div className="card auth-card">
          <h1>Sweet Shop</h1>
          <div className="tabs">
            <button className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>
              Login
            </button>
            <button className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>
              Register
            </button>
          </div>
          <form onSubmit={handleAuth} className="form">
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            {authMode === 'register' && (
              <label>
                Name (optional)
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </label>
            )}
            {error && <p className="error">{error}</p>}
            <button type="submit" className="primary">
              {authMode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="topbar">
        <div>
          <h1>Sweet Shop Dashboard</h1>
          <p className="muted">
            Signed in as {user.email} ({user.role})
          </p>
        </div>
        <button onClick={logout} className="secondary">
          Logout
        </button>
      </header>

      {error && <div className="banner error">{error}</div>}
      {loading && <div className="banner info">Loading...</div>}

      <section className="card">
        <h2>Search sweets</h2>
        <div className="grid">
          <label>
            Name
            <input value={searchName} onChange={(e) => setSearchName(e.target.value)} placeholder="e.g. chocolate" />
          </label>
          <label>
            Category
            <input value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)} placeholder="e.g. gummy" />
          </label>
          <label>
            Min price
            <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} type="number" min="0" />
          </label>
          <label>
            Max price
            <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} type="number" min="0" />
          </label>
        </div>
        <div className="actions">
          <button onClick={handleSearch} className="primary">Search</button>
          <button onClick={loadSweets} className="secondary">Reset</button>
        </div>
      </section>

      {isAdmin && (
        <section className="card">
          <h2>{editingId ? 'Edit sweet' : 'Add sweet'}</h2>
          <form onSubmit={handleSaveSweet} className="grid">
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </label>
            <label>
              Category
              <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} required />
            </label>
            <label>
              Price
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                required
              />
            </label>
            <label>
              Quantity
              <input
                type="number"
                min="0"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
                required
              />
            </label>
            <div className="actions span-2">
              <button type="submit" className="primary">
                {editingId ? 'Update' : 'Add'}
              </button>
              {editingId && (
                <button type="button" className="secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      <section className="list">
        {sortedSweets.map((sweet) => (
          <article key={sweet.id} className="card sweet-card">
            <div>
              <h3>{sweet.name}</h3>
              <p className="muted">{sweet.category}</p>
              <p>${sweet.price.toFixed(2)}</p>
              <p>Stock: {sweet.quantity}</p>
            </div>
            <div className="actions column">
              <div className="inline">
                <input
                  type="number"
                  min="1"
                  value={purchaseQty[sweet.id] ?? 1}
                  onChange={(e) => setPurchaseQty((prev) => ({ ...prev, [sweet.id]: Number(e.target.value) }))}
                />
                <button
                  className="primary"
                  onClick={() => handlePurchase(sweet.id)}
                  disabled={sweet.quantity === 0}
                >
                  Purchase
                </button>
              </div>
              {isAdmin && (
                <>
                  <div className="inline">
                    <input
                      type="number"
                      min="1"
                      value={restockQty[sweet.id] ?? 1}
                      onChange={(e) => setRestockQty((prev) => ({ ...prev, [sweet.id]: Number(e.target.value) }))}
                    />
                    <button className="secondary" onClick={() => handleRestock(sweet.id)}>
                      Restock
                    </button>
                  </div>
                  <div className="inline">
                    <button
                      className="secondary"
                      onClick={() => {
                        setForm({ name: sweet.name, category: sweet.category, price: sweet.price, quantity: sweet.quantity });
                        setEditingId(sweet.id);
                      }}
                    >
                      Edit
                    </button>
                    <button className="danger" onClick={() => handleDelete(sweet.id)}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </article>
        ))}

        {!sortedSweets.length && <p className="muted">No sweets found.</p>}
      </section>
    </div>
  );
}

export default App;
