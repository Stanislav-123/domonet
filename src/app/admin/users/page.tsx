"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  login: string;
  role: string;
  createdAt: string;
  _count: { clicks: number; leads: number; trackingLinks: number };
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [newLogin, setNewLogin] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole] = useState("user");
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []));
  }
  useEffect(load, []);

  async function setRole(id: string, role: string) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    load();
  }

  async function createUser() {
    setErr(null);
    if (!newLogin.trim() || !newPassword.trim()) {
      setErr("Заполните логин и пароль");
      return;
    }
    setCreating(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: newLogin.trim(), name: newName.trim() || newLogin.trim(), password: newPassword, role: newRole }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setErr(data.error || "Ошибка");
      return;
    }
    setNewLogin("");
    setNewName("");
    setNewPassword("");
    load();
  }

  async function removeUser(u: User) {
    if (!confirm(`Удалить пользователя «${u.login}»?`)) return;
    setErr(null);
    const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data.error || "Не удалось удалить");
      return;
    }
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Пользователи</h1>

      <div className="panel space-y-3 p-4">
        <p className="kicker">Создать пользователя</p>
        <div className="grid gap-2 sm:grid-cols-4">
          <input value={newLogin} onChange={(e) => setNewLogin(e.target.value)} placeholder="Логин" className="field" />
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Имя" className="field" />
          <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Пароль" type="password" className="field" />
          <input type="hidden" value="user" />
        </div>
        {err ? <p className="text-sm text-[var(--bad)]">{err}</p> : null}
        <button disabled={creating} onClick={createUser} className="btn">{creating ? "…" : "Создать"}</button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-muted">
            <tr>
              <th className="px-3 py-2">Логин</th>
              <th className="px-3 py-2">Имя</th>
              <th className="px-3 py-2">Роль</th>
              <th className="px-3 py-2">Клики</th>
              <th className="px-3 py-2">Лиды</th>
              <th className="px-3 py-2">Ссылки</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-white/5">
                <td className="px-3 py-2">{u.login}</td>
                <td className="px-3 py-2">{u.name}</td>
                <td className="px-3 py-2">
                  <select
                    value={u.role}
                    onChange={(e) => setRole(u.id, e.target.value)}
                    className="rounded bg-white/5 px-2 py-1"
                  >
                    <option value="owner">owner</option>
                    <option value="user">user</option>
                  </select>
                </td>
                <td className="px-3 py-2">{u._count.clicks}</td>
                <td className="px-3 py-2">{u._count.leads}</td>
                <td className="px-3 py-2">{u._count.trackingLinks}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => removeUser(u)}
                    className="btn-ghost px-2 py-1 text-sm text-[var(--bad)]"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
