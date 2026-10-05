"use client";

import { useEffect, useMemo, useState } from "react";

type UserOpt = { id: string; login: string; name: string; role: string };

type Integration = {
  id: string;
  name: string;
  code: string;
  active: boolean;
  userIds: string[];
};

const DEFAULT_CODE = `<?php
// Данные лида приходят в JSON body (POST)
$input = json_decode(file_get_contents('php://input'), true);

$firstName = $input['firstName'] ?? '';
$lastName  = $input['lastName'] ?? '';
$email     = $input['email'] ?? '';
$phone     = $input['phone'] ?? '';
$clickId   = $input['clickId'] ?? '';
$ip        = $input['ip'] ?? '';
$userAgent = $input['userAgent'] ?? '';
$country   = $input['country'] ?? '';
$sub1      = $input['sub1'] ?? '';

// Пример: отправка на API партнёра
// $response = file_get_contents('https://partner.com/api/lead?' . http_build_query($input));

// Верните JSON с результатом
header('Content-Type: application/json');
echo json_encode(['status' => 'ok', 'message' => 'Lead received']);
`;

export default function IntegrationsPage() {
  const [list, setList] = useState<Integration[]>([]);
  const [users, setUsers] = useState<UserOpt[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState(DEFAULT_CODE);
  const [userIds, setUserIds] = useState<Set<string>>(new Set());
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const assignableUsers = useMemo(() => users.filter((u) => u.role === "user"), [users]);

  function load() {
    fetch("/api/admin/integrations")
      .then((r) => r.json())
      .then((d) => setList(d.integrations || []));
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []));
  }
  useEffect(load, []);

  function resetForm() {
    setEditId(null);
    setName("");
    setCode(DEFAULT_CODE);
    setUserIds(new Set());
    setErr(null);
  }

  function startEdit(i: Integration) {
    setEditId(i.id);
    setName(i.name);
    setCode(i.code);
    setUserIds(new Set(i.userIds || []));
    setErr(null);
  }

  function toggleUser(id: string) {
    setUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function save() {
    setErr(null);
    if (!name.trim()) { setErr("Введите название"); return; }
    if (!code.trim()) { setErr("Напишите PHP-код"); return; }
    setSaving(true);
    const endpoint = editId ? `/api/admin/integrations/${editId}` : "/api/admin/integrations";
    const res = await fetch(endpoint, {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), code, userIds: [...userIds] }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setErr(data.error || "Ошибка"); return; }
    resetForm();
    load();
  }

  async function toggle(id: string, active: boolean) {
    await fetch(`/api/admin/integrations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Удалить интеграцию? PHP-файл тоже будет удалён.")) return;
    await fetch(`/api/admin/integrations/${id}`, { method: "DELETE" });
    load();
  }

  function userLabel(ids: string[]) {
    if (!ids.length) return "никому не назначена";
    const map = new Map(users.map((u) => [u.id, u.login]));
    return ids.map((id) => map.get(id) || id).join(", ");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Интеграции</h1>
      <p className="text-sm text-[var(--dim)]">
        PHP-скрипт сохраняется на сервер (XAMPP). Пользователь видит интеграцию в кампании только если вы его назначили.
      </p>

      <div className="panel space-y-3 p-4">
        <p className="kicker">{editId ? "Редактировать интеграцию" : "Новая интеграция"}</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название (напр. Partner X)"
          className="field"
        />
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="field min-h-[300px] font-mono text-sm leading-relaxed"
          spellCheck={false}
        />
        <div className="space-y-2">
          <p className="kicker">Доступ пользователям</p>
          {assignableUsers.length === 0 ? (
            <p className="text-sm text-[var(--dim)]">Нет пользователей для назначения</p>
          ) : (
            <div className="grid gap-1 md:grid-cols-2">
              {assignableUsers.map((u) => (
                <label key={u.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-white/5">
                  <input
                    type="checkbox"
                    checked={userIds.has(u.id)}
                    onChange={() => toggleUser(u.id)}
                    className="accent-[var(--signal)]"
                  />
                  <span>{u.login}{u.name ? ` · ${u.name}` : ""}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-[var(--dim)]">
          Доступные поля в JSON body: firstName, lastName, email, phone, clickId, ip, userAgent, country, sub1–sub5
        </p>
        {err ? <p className="text-sm text-[var(--bad)]">{err}</p> : null}
        <div className="flex gap-2">
          <button disabled={saving} onClick={save} className="btn">
            {saving ? "…" : editId ? "Сохранить" : "Создать"}
          </button>
          {editId ? <button onClick={resetForm} className="btn-ghost px-3 py-2">Отмена</button> : null}
        </div>
      </div>

      <div className="space-y-2">
        {list.map((i) => (
          <div key={i.id} className="panel flex flex-wrap items-center justify-between gap-2 p-3">
            <div>
              <p className="font-medium">
                {i.name}
                {!i.active ? <span className="ml-2 text-xs text-[var(--bad)]">выкл</span> : null}
              </p>
              <p className="text-xs text-[var(--dim)]">ID: {i.id}</p>
              <p className="text-xs text-[var(--dim)]">Пользователи: {userLabel(i.userIds || [])}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(i)} className="btn-ghost px-2 py-1 text-sm">Редактировать</button>
              <button onClick={() => toggle(i.id, i.active)} className="btn-ghost px-2 py-1 text-sm">
                {i.active ? "Выкл" : "Вкл"}
              </button>
              <button onClick={() => remove(i.id)} className="btn-ghost px-2 py-1 text-sm text-[var(--bad)]">Удалить</button>
            </div>
          </div>
        ))}
        {list.length === 0 ? <p className="text-sm text-[var(--dim)]">Нет интеграций</p> : null}
      </div>
    </div>
  );
}
