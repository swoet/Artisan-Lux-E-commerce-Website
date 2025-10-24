"use client";
import { useEffect, useState } from "react";

export default function AdminsManager(){
  const [items,setItems]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [role,setRole]=useState("admin");
  const [error,setError]=useState<string|undefined>();

  async function load(){
    setLoading(true);
    setError(undefined);
    const res=await fetch("/api/admin/admins", { cache:"no-store" });
    if(res.ok){ const data=await res.json(); setItems(data.items||[]);} else { setError("Forbidden: superadmin only"); }
    setLoading(false);
  }

  useEffect(()=>{ load(); },[]);

  async function create(e:React.FormEvent){
    e.preventDefault();
    setError(undefined);
    const res=await fetch("/api/admin/admins",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password,role})});
    if(res.ok){ setEmail(""); setPassword(""); setRole("admin"); load(); }
    else { const data=await res.json().catch(()=>({})); setError(data.error||"Failed"); }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="card p-6">
        <h2 className="font-semibold mb-2">Admins</h2>
        {loading? <div>Loading...</div> : (
          <ul className="divide-y divide-[var(--color-border)]">
            {items.map((a)=> (
              <li key={a.id} className="py-2 text-sm flex items-center justify-between">
                <div>
                  <div className="font-medium">{a.email}</div>
                  <div className="text-neutral-400">{a.role}</div>
                </div>
                <div className="text-neutral-400">{new Date(a.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
        {error? <div className="text-red-400 text-sm mt-2">{error}</div>:null}
      </div>
      <form onSubmit={create} className="card p-6 space-y-3">
        <h2 className="font-semibold mb-2">Create Admin</h2>
        <div>
          <label className="block text-sm">Email</label>
          <input className="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input className="input" type="password" required value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Role</label>
          <select className="select" value={role} onChange={e=>setRole(e.target.value)}>
            <option value="admin" className="bg-[var(--color-card)] text-[var(--color-fg)]">Admin</option>
            <option value="superadmin" className="bg-[var(--color-card)] text-[var(--color-fg)]">Super Admin</option>
          </select>
        </div>
        <button className="btn" type="submit">Create</button>
        {error? <div className="text-red-400 text-sm mt-2">{error}</div>:null}
      </form>
    </div>
  );
}
