"use client";

import SellerLayout from "@/components/seller/SellerLayout";
import { useState } from "react";

export default function SellerInbox() {
  const [activeContact, setActiveContact] = useState("Xian Zhou");

  const contacts = [
    { name: "Xian Zhou", avatar: "/seller/images/next_assets/user_01814c.png", time: "4:05 PM", preview: "Perfect! Let's discuss integration...", unread: 0, online: true },
    { name: "Sarah Smith", avatar: "/seller/images/next_assets/user_0297fd.png", time: "5 mins", preview: "Can you send the report?", unread: 1, online: false },
    { name: "Michael Chen", avatar: "/seller/images/next_assets/user_03e63e.png", time: "1 hour", preview: "Meeting rescheduled to...", unread: 0, online: true },
    { name: "Emily Davis", avatar: "/seller/images/next_assets/user_04d398.png", time: "2 hours", preview: "Thanks for the update!", unread: 0, online: false },
    { name: "David Wilson", avatar: "/seller/images/next_assets/user_051ee2.png", time: "1 day", preview: "Project timeline looks...", unread: 5, online: true },
  ];

  const messages = [
    { sender: "them", text: "Hey, are we still on for the meeting tomorrow?", time: "10:00 AM" },
    { sender: "me", text: "Yes, 2 PM right?", time: "10:05 AM" },
    { sender: "them", text: "Correct. I'll send the agenda shortly.", time: "10:06 AM" },
    { sender: "me", text: "Great, thanks! Also, could you bring the latest sales report?", time: "10:10 AM" },
    { sender: "them", text: "Sure, printing it now.", time: "10:12 AM" },
    { sender: "them", text: "Hey, I am looking for the best admin template. Could you please help me to find it out? 😯", time: "4:02 PM" },
    { sender: "me", text: "Stack admin is the responsive bootstrap 4 admin template.", time: "4:02 PM" },
    { sender: "them", text: "Looks clean and fresh UI. 😃", time: "4:02 PM" },
    { sender: "me", text: "Perfect! Let's discuss integration details later.", time: "4:05 PM" },
  ];

  return (
    <SellerLayout>
      <div className="h-[calc(100vh-140px)] min-h-[600px] bg-white rounded-2xl overflow-hidden flex">
        {/* Left Sidebar - Contacts list */}
        <div className="w-80 lg:w-[345px] h-full shrink-0 hidden md:block border-r border-gray-500/20">
          <div className="flex flex-col h-full pb-4">
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-light-primary-text">Inbox</h2>
              </div>
              <div className="relative">
                <input
                  className="w-full pl-10 border border-gray-500/20 pr-4 py-2 bg-gray-100 h-9 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Search..."
                  type="text"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-1 space-y-1">
              {contacts.map((contact) => (
                <div
                  key={contact.name}
                  className={`flex items-start rounded-lg gap-3 py-3 px-5 cursor-pointer transition-colors ${
                    activeContact === contact.name ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveContact(contact.name)}
                >
                  <div className="relative size-10 rounded-full bg-gray-200 shrink-0 overflow-hidden">
                    <img alt={contact.name} className="object-cover w-full h-full" src={contact.avatar} />
                    {contact.online && (
                      <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-success"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-sm text-light-primary-text truncate">{contact.name}</h3>
                      <span className="text-xs text-light-disabled-text shrink-0">{contact.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-light-secondary-text truncate pr-2">{contact.preview}</p>
                      {contact.unread > 0 && (
                        <span className="w-5 h-5 rounded bg-secondary-lighter text-light-primary-text text-xs font-bold flex items-center justify-center shrink-0">
                          {contact.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Pane - Chat Window */}
        <div className="flex-1 h-full min-w-0 flex flex-col justify-between bg-white">
          {/* Header */}
          <div className="flex items-center justify-between py-4 px-5 lg:px-6 border-b border-gray-500/20">
            <div className="flex items-center gap-4">
              <div className="relative size-12 rounded-lg shrink-0 overflow-hidden bg-gray-100">
                <img alt={activeContact} className="object-cover w-full h-full" src="/seller/images/next_assets/user_01814c.png" />
              </div>
              <div>
                <h3 className="font-base font-semibold text-light-primary-text">{activeContact}</h3>
                <p className="text-xs text-success-dark font-normal">Online</p>
              </div>
            </div>
          </div>

          {/* Messages Logs list */}
          <div className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-6">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[80%] ${message.sender === "me" ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                <div className="flex items-end gap-2">
                  {message.sender !== "me" && (
                    <div className="relative size-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
                      <img alt="Avatar" className="object-cover w-full h-full" src="/seller/images/next_assets/user_01814c.png" />
                    </div>
                  )}
                  <div>
                    <div
                      className={`p-3 rounded-lg max-w-xs text-sm leading-relaxed ${
                        message.sender === "me"
                          ? "bg-primary-lighter text-light-primary-text rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      {message.text}
                    </div>
                    <span className="text-[10px] text-light-secondary-text mt-1 block">{message.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Typing input */}
          <div className="p-6">
            <div className="bg-gray-50 h-18 border border-gray-500/20 rounded-xl px-6 py-4 flex items-center gap-2">
              <input
                className="flex-1 bg-transparent focus:outline-none text-sm text-gray-900 placeholder:text-gray-400"
                placeholder="Type a message..."
                type="text"
              />
              <button className="bg-primary text-white p-2.5 rounded-lg font-bold hover:bg-primary-dark transition-colors">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
