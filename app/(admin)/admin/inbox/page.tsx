"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Avatar, DashboardButton, DashboardCard } from "@/components/dashboard/ui";
import { DashboardDialog, DialogActions } from "@/components/dashboard/Dialog";

type Message = { id: number; body: string; sentAt: string; mine: boolean; attachment?: boolean };
type Contact = { id: number; name: string; email: string; online: boolean; messages: Message[] };

const CONTACTS: Contact[] = [
  { id: 1, name: "James Smith", email: "james@example.com", online: true, messages: [{ id: 1, body: "Can you help with my pickup code?", sentAt: "10:24", mine: false }, { id: 2, body: "Of course. Which order is this for?", sentAt: "10:26", mine: true }] },
  { id: 2, name: "Mary Johnson", email: "mary@example.com", online: false, messages: [{ id: 3, body: "Thanks, the refund has arrived.", sentAt: "Yesterday", mine: false }] },
  { id: 3, name: "Fresh Corner", email: "support@freshcorner.example", online: true, messages: [{ id: 4, body: "Our collection hours have changed.", sentAt: "Mon", mine: false }] },
  { id: 4, name: "Nora Garcia", email: "nora@example.com", online: false, messages: [] },
];

export default function AdminInbox() {
  const [contacts, setContacts] = useState(CONTACTS);
  const [activeId, setActiveId] = useState(1);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<"profile" | "clear" | null>(null);
  const active = contacts.find((contact) => contact.id === activeId) ?? contacts[0];
  const visibleContacts = useMemo(() => contacts.filter((contact) => `${contact.name} ${contact.email}`.toLowerCase().includes(search.trim().toLowerCase())), [contacts, search]);

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setContacts((items) => items.map((contact) => contact.id === active.id ? { ...contact, messages: [...contact.messages, { id: Date.now(), body, sentAt: "Just now", mine: true }] } : contact));
    setDraft("");
    setEmojiOpen(false);
  }

  function addAttachment(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setContacts((items) => items.map((contact) => contact.id === active.id ? { ...contact, messages: [...contact.messages, { id: Date.now(), body: file.name, sentAt: "Just now", mine: true, attachment: true }] } : contact));
    event.target.value = "";
  }

  function clearConversation() {
    setContacts((items) => items.map((contact) => contact.id === active.id ? { ...contact, messages: [] } : contact));
    setDialog(null);
    setMenuOpen(false);
  }

  return (
    <DashboardCard className="grid min-h-[70vh] w-full overflow-hidden lg:grid-cols-[320px_1fr]">
      <aside className="border-b border-gray-500/20 lg:border-b-0 lg:border-r">
        <div className="border-b border-gray-500/20 p-4 sm:p-5"><h1 className="text-xl font-bold">Inbox</h1><label className="relative mt-4 block"><span className="sr-only">Search conversations</span><span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-secondary-text">⌕</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search conversations..." className="h-9 w-full rounded-full border-none bg-gray-100 pl-9 pr-3 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /></label></div>
        <div className="max-h-72 overflow-y-auto lg:max-h-[60vh]">{visibleContacts.map((contact) => {
          const last = contact.messages.at(-1);
          return <button key={contact.id} type="button" onClick={() => setActiveId(contact.id)} className={`flex w-full items-center gap-3 border-b border-gray-500/10 p-4 text-left transition-colors hover:bg-gray-50 ${active.id === contact.id ? "bg-primary-lighter" : ""}`}><Avatar name={contact.name} online={contact.online} /><span className="min-w-0 flex-1"><span className="block truncate font-semibold">{contact.name}</span><span className="block truncate text-xs text-light-secondary-text">{last?.body ?? "No messages yet"}</span></span><span className="text-xs text-light-secondary-text">{last?.sentAt}</span></button>;
        })}{visibleContacts.length === 0 && <p className="p-6 text-center text-sm text-light-secondary-text">No conversations found.</p>}</div>
      </aside>

      <section className="flex min-h-[560px] flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-gray-500/20 p-4 sm:px-5"><div className="flex items-center gap-3"><Avatar name={active.name} online={active.online} /><div><h2 className="font-semibold">{active.name}</h2><p className={`text-xs ${active.online ? "text-success-dark" : "text-light-secondary-text"}`}>{active.online ? "Online" : "Offline"}</p></div></div><div className="relative flex items-center gap-1"><button type="button" disabled title="Voice calls will be available when the calling service is connected." aria-label="Voice call unavailable" className="size-9 rounded-full text-light-secondary-text disabled:cursor-not-allowed disabled:opacity-40">☎</button><button type="button" disabled title="Video calls will be available when the calling service is connected." aria-label="Video call unavailable" className="size-9 rounded-full text-light-secondary-text disabled:cursor-not-allowed disabled:opacity-40">▣</button><button type="button" aria-label="Conversation menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} className="size-9 rounded-full text-xl hover:bg-gray-100">⋯</button>{menuOpen && <div className="absolute right-0 top-11 z-10 w-44 rounded-xl border border-gray-500/20 bg-white p-1 shadow-lg"><button type="button" onClick={() => setDialog("profile")} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100">View contact</button><button type="button" onClick={() => setDialog("clear")} className="w-full rounded-lg px-3 py-2 text-left text-sm text-error-dark hover:bg-error-alpha-16">Clear conversation</button></div>}</div></header>
        <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50/50 p-4 sm:p-6">{active.messages.map((message) => <div key={message.id} className={`flex ${message.mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm ${message.mine ? "rounded-br-md bg-primary text-white" : "rounded-bl-md bg-white"}`}><p>{message.attachment ? `Attachment: ${message.body}` : message.body}</p><span className={`mt-1 block text-xs ${message.mine ? "text-white/70" : "text-light-secondary-text"}`}>{message.sentAt}</span></div></div>)}{active.messages.length === 0 && <div className="flex h-full items-center justify-center text-sm text-light-secondary-text">Start this conversation.</div>}</div>
        <form onSubmit={send} className="border-t border-gray-500/20 p-3 sm:p-4"><div className="flex items-center gap-2"><div className="relative"><button type="button" aria-label="Add emoji" aria-expanded={emojiOpen} onClick={() => setEmojiOpen(!emojiOpen)} className="size-10 rounded-full hover:bg-gray-100">☺</button>{emojiOpen && <div className="absolute bottom-12 left-0 z-10 flex gap-1 rounded-xl border border-gray-500/20 bg-white p-2 shadow-lg">{["👍", "😊", "🎉", "❤️"].map((emoji) => <button key={emoji} type="button" onClick={() => setDraft((value) => value + emoji)} className="size-9 rounded-lg hover:bg-gray-100">{emoji}</button>)}</div>}</div><label className="flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-gray-100" title="Attach a file"><span aria-hidden="true">⌕</span><span className="sr-only">Attach a file</span><input type="file" className="sr-only" onChange={addAttachment} /></label><label className="flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-gray-100" title="Attach an image"><span aria-hidden="true">▧</span><span className="sr-only">Attach an image</span><input type="file" accept="image/*" className="sr-only" onChange={addAttachment} /></label><input aria-label="Message" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Type a message" className="h-10 min-w-0 flex-1 rounded-full border-none bg-gray-100 px-4 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary" /><DashboardButton type="submit" disabled={!draft.trim()}>Send</DashboardButton></div></form>
      </section>

      {dialog === "profile" && <DashboardDialog title={active.name} onClose={() => setDialog(null)}><div className="flex items-center gap-4 p-5 sm:p-6"><Avatar name={active.name} size="lg" online={active.online} /><div><strong className="block text-base">{active.name}</strong><span className="text-sm text-light-secondary-text">{active.email}</span></div></div><footer className="flex justify-end border-t border-gray-500/20 p-4 sm:px-6"><DashboardButton variant="secondary" onClick={() => setDialog(null)}>Close</DashboardButton></footer></DashboardDialog>}
      {dialog === "clear" && <DashboardDialog title="Clear this conversation?" onClose={() => setDialog(null)}><p className="p-5 text-sm leading-6 text-light-secondary-text sm:p-6">This removes the local dummy messages until the page is refreshed.</p><DialogActions onCancel={() => setDialog(null)}><DashboardButton variant="danger" onClick={clearConversation}>Clear messages</DashboardButton></DialogActions></DashboardDialog>}
    </DashboardCard>
  );
}
