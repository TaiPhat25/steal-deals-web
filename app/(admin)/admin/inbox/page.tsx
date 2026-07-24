"use client";

import { useState } from "react";
import { DashboardCard, Avatar } from "@/components/dashboard/ui";

export default function AdminInbox() {
  const [activeContactId, setActiveContactId] = useState(1);

  const contacts = [
    {
      id: 1,
      name: "Xian Zhou",
      avatar: "/dashboard/product-placeholder.png",
      time: "4:05 PM",
      lastMsg: "You: Perfect! Let's discuss integration...",
      online: true,
      unread: 0,
      messages: [
        { id: 1, text: "Hey, are we still on for the meeting tomorrow?", sender: "them", time: "10:00 AM" },
        { id: 2, text: "Yes, 2 PM right?", sender: "me", time: "10:05 AM" },
        { id: 3, text: "Correct. I'll send the agenda shortly.", sender: "them", time: "10:06 AM" },
        { id: 4, text: "Great, thanks! Also, could you bring the latest sales report?", sender: "me", time: "10:10 AM" },
        { id: 5, text: "Sure, printing it now.", sender: "them", time: "10:12 AM" },
        { id: 6, text: "Hey John, I am looking for the best admin template. Could you please help me to find it out? 😯", sender: "them", time: "4:02 PM" },
        { id: 7, text: "Stack admin is the responsive bootstrap 4 admin template.", sender: "me", time: "4:02 PM" },
        { id: 8, text: "Looks clean and fresh UI. 😃", sender: "them", time: "4:02 PM" },
        { id: 9, text: "Perfect! Let's discuss integration details later.", sender: "me", time: "4:05 PM" }
      ]
    },
    {
      id: 2,
      name: "Sarah Smith",
      avatar: "/dashboard/product-placeholder.png",
      time: "5 mins",
      lastMsg: "Can you send the report?",
      online: false,
      unread: 1,
      messages: [
        { id: 1, text: "Hello, do you have a moment?", sender: "them", time: "3:40 PM" },
        { id: 2, text: "Sure, what's up?", sender: "me", time: "3:42 PM" },
        { id: 3, text: "Can you send the report?", sender: "them", time: "3:45 PM" }
      ]
    },
    {
      id: 3,
      name: "Michael Chen",
      avatar: "/dashboard/product-placeholder.png",
      time: "1 hour",
      lastMsg: "Meeting rescheduled to...",
      online: true,
      unread: 0,
      messages: [
        { id: 1, text: "Hey John, just to let you know, the design sync is moved.", sender: "them", time: "2:15 PM" },
        { id: 2, text: "Meeting rescheduled to 5 PM today.", sender: "them", time: "2:16 PM" }
      ]
    },
    {
      id: 4,
      name: "Emily Davis",
      avatar: "/dashboard/product-placeholder.png",
      time: "2 hours",
      lastMsg: "Thanks for the update!",
      online: true,
      unread: 0,
      messages: [
        { id: 1, text: "The feedback has been incorporated into the master deck.", sender: "me", time: "1:00 PM" },
        { id: 2, text: "Thanks for the update!", sender: "them", time: "1:15 PM" }
      ]
    },
    {
      id: 5,
      name: "David Wilson",
      avatar: "/dashboard/product-placeholder.png",
      time: "1 day",
      lastMsg: "Project timeline looks...",
      online: false,
      unread: 5,
      messages: [
        { id: 1, text: "Hi, check the attachment please.", sender: "them", time: "Yesterday" },
        { id: 2, text: "Project timeline looks realistic.", sender: "them", time: "Yesterday" }
      ]
    }
  ];

  const activeContact = contacts.find(c => c.id === activeContactId) || contacts[0];

  return (
    <DashboardCard className="h-[calc(100vh-140px)] min-h-[600px] bg-white rounded-2xl overflow-hidden flex w-full">
        {/* Sidebar contacts list */}
        <div className="w-80 lg:w-[345px] h-full shrink-0 hidden md:block border-r border-gray-500/20">
          <div className="flex flex-col h-full pb-4">
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-light-primary-text">Inbox</h2>
                <button type="button" className="outline-none size-8 rounded-full flex items-center justify-center hover:bg-gray-200 text-light-primary-text">
                  <svg className="size-6" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M11.993 16.75a1.25 1.25 0 0 1 0 2.5h-.009a1.25 1.25 0 1 1 0-2.5zm.008-6a1.25 1.25 0 0 1 0 2.5h-.009a1.25 1.25 0 1 1 0-2.5zm.008-6a1.25 1.25 0 0 1 0 2.5H12a1.25 1.25 0 1 1 0-2.5z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </button>
              </div>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-primary-text"
                  fill="none"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M7.333.583a6.75 6.75 0 1 0 4.213 12.022l2.59 2.592a.75.75 0 0 0 1.062-1.06l-2.591-2.592A6.75 6.75 0 0 0 7.334.583zm0 1.5a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <input
                  className="w-full pl-10 border border-gray-500/20 pr-4 py-2 bg-gray-100 h-9 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Search..."
                  type="text"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-1">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setActiveContactId(contact.id)}
                  className={`flex items-start rounded-lg gap-3 py-3 px-5 hover:bg-gray-50 cursor-pointer transition-colors ${
                    activeContactId === contact.id ? "bg-gray-100" : "bg-transparent"
                  }`}
                >
                  <Avatar name={contact.name} online={contact.online} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="font-semibold text-sm text-light-primary-text truncate">{contact.name}</h3>
                      <span className="text-xs text-light-disabled-text shrink-0">{contact.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-light-secondary-text truncate pr-2">{contact.lastMsg}</p>
                      {contact.unread > 0 && (
                        <span className="w-5 h-5 rounded bg-secondary-lighter text-light-primary-text leading-4.5 text-xs font-bold flex items-center justify-center shrink-0">
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

        {/* Chat message pane */}
        <div className="flex-1 h-full min-w-0">
          <div className="flex flex-col h-full bg-white">
            {/* Chat header */}
            <div className="flex items-center justify-between py-4 px-5 lg:px-6 border-b border-gray-500/20">
              <div className="flex items-center gap-4">
                <Avatar name={activeContact.name} />
                <div>
                  <h3 className="font-base font-semibold text-light-primary-text">{activeContact.name}</h3>
                  <p className={`text-sm font-normal ${activeContact.online ? "text-success-dark" : "text-gray-400"}`}>
                    {activeContact.online ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" className="rounded-full inline-flex items-center justify-center cursor-pointer font-bold transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 h-8 w-8 p-0 text-light-primary-text">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M2.306.958C2.67.662 3.128.516 3.595.613c.46.095.817.402 1.033.79l.582 1.045c.223.399.421.751.55 1.061.138.327.228.672.187 1.062-.04.39-.2.709-.402 1-.19.277-.457.581-.757.925L3.443 8.041a14.7 14.7 0 0 0 4.515 4.516l1.545-1.346c.345-.3.65-.566.926-.757.292-.201.61-.361 1-.402.39-.04.734.05 1.061.188.31.13.663.327 1.062.55l1.045.581c.387.216.694.573.79 1.034.096.466-.05.926-.346 1.29-.978 1.2-2.56 1.981-4.237 1.643-.99-.2-1.965-.533-3.139-1.206-2.349-1.347-4.452-3.452-5.798-5.798C1.194 7.161.862 6.184.662 5.196c-.338-1.677.443-3.26 1.644-4.238m9.278 10.586c-.049.005-.128.024-.303.145-.19.132-.422.332-.793.654l-1.12.974a8 8 0 0 0 1.733.55c1.021.206 2.075-.258 2.778-1.12.012-.015.017-.03.023-.039q-.013-.011-.036-.026l-1.044-.582c-.428-.239-.697-.387-.91-.477-.197-.082-.279-.084-.328-.079m-8.33-9.423C2.39 2.825 1.925 3.877 2.131 4.9c.113.56.277 1.115.55 1.731l.974-1.119c.322-.37.523-.601.655-.792.12-.175.14-.255.144-.304.005-.049.004-.13-.078-.327-.09-.214-.238-.482-.476-.91l-.583-1.045q-.015-.024-.028-.036-.016.008-.037.024"
                      fill="#212529"
                    ></path>
                  </svg>
                </button>
                <button type="button" className="rounded-full inline-flex items-center justify-center cursor-pointer font-bold transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 h-8 w-8 p-0 text-light-primary-text">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M16.666 5.417c2.714 0 4.876-.003 6.567.225 1.727.232 3.15.724 4.276 1.85 1.125 1.124 1.617 2.548 1.85 4.275q.035.276.064.569c.995-.802 1.86-1.463 2.618-1.922 1.14-.689 2.448-1.178 3.764-.526 1.297.643 1.733 1.972 1.922 3.306.192 1.361.189 3.215.189 5.502v2.607c0 2.287.003 4.142-.19 5.503-.188 1.334-.624 2.662-1.921 3.305-1.316.652-2.624.163-3.764-.526-.759-.459-1.623-1.12-2.618-1.922q-.029.295-.065.571c-.232 1.727-.724 3.15-1.85 4.275-1.124 1.125-2.548 1.618-4.275 1.85-1.69.228-3.853.225-6.567.225H15c-2.714 0-4.876.003-6.567-.225-1.727-.232-3.15-.725-4.276-1.85s-1.617-2.548-1.85-4.275c-.227-1.69-.224-3.853-.224-6.567v-3.333c0-2.714-.003-4.876.225-6.567.232-1.727.724-3.15 1.85-4.276 1.124-1.125 2.548-1.617 4.275-1.85 1.69-.227 3.853-.224 6.567-.224zM15 7.917c-2.785 0-4.749.002-6.234.202-1.45.195-2.257.558-2.84 1.14-.583.584-.946 1.391-1.14 2.84-.2 1.486-.203 3.45-.203 6.235v3.333c0 2.785.002 4.749.202 6.234.195 1.45.558 2.257 1.14 2.84.584.583 1.391.945 2.84 1.14 1.486.2 3.45.203 6.235.203h1.666c2.785 0 4.749-.003 6.234-.203 1.45-.195 2.257-.557 2.84-1.14.584-.583.946-1.39 1.14-2.84.2-1.485.203-3.449.203-6.234v-3.333c0-2.785-.002-4.749-.202-6.234-.195-1.45-.558-2.257-1.14-2.84-.584-.584-1.39-.946-2.84-1.14-1.486-.2-3.45-.203-6.235-.203zm19.694 4.21c-.102-.05-.385-.163-1.361.427-.919.555-2.09 1.51-3.763 2.888.013.886.013 1.848.013 2.892v3.333c0 1.043 0 2.004-.013 2.889 1.672 1.379 2.844 2.334 3.763 2.89.977.59 1.26.476 1.361.426.12-.059.392-.247.558-1.417.162-1.143.164-2.783.164-5.152v-2.607c0-2.37-.002-4.009-.164-5.152-.165-1.169-.438-1.357-.558-1.416zm-15.527-.044a3.75 3.75 0 1 1-.001 7.501 3.75 3.75 0 0 1 .001-7.501m0 2.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5"
                      fill="currentColor"
                    ></path>
                  </svg>
                </button>
                <button type="button" className="outline-none rounded-full inline-flex items-center justify-center cursor-pointer font-bold transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 h-8 w-8 p-0 text-light-primary-text">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9.993 13.5a1.5 1.5 0 0 1 0 3h-.007a1.5 1.5 0 0 1 0-3zm.162-4.992a1.5 1.5 0 0 1 0 2.984l-.153.008h-.008a1.5 1.5 0 0 1 0-3h.008zm.006-5a1.5 1.5 0 0 1 0 2.984l-.153.008H10a1.5 1.5 0 1 1 0-3h.008z"
                      fill="#212529"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat messages list */}
            <div className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-6">
              {activeContact.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col max-w-[80%] ${
                    message.sender === "me" ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  <div className="flex items-end gap-2">
                    {message.sender !== "me" && (
                      <Avatar name={activeContact.name} size="sm" />
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
                      <span className="text-xs text-light-secondary-text mt-1 block">
                        {message.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat footer input bar */}
            <div className="p-6">
              <div className="bg-gray-50 h-18 border border-gray-500/20 rounded-xl px-6 py-4 flex items-center gap-2">
                <input
                  className="flex-1 bg-transparent focus:outline-none text-sm text-gray-900 placeholder:text-gray-400"
                  placeholder="Type a message"
                  type="text"
                />
                <div className="flex items-center">
                  <button type="button" className="inline-flex items-center justify-center cursor-pointer font-bold transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 hover:text-gray-900 border-none shadow-none bg-transparent p-0 text-light-primary-text w-10 h-10">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M11 2c3.622 0 6.777 2.39 7.132 5.639q.111.045.218.103c.239.134.417.314.543.458.1.115.256.318.302.373.424.517.77.936 1.026 1.3.26.37.462.727.573 1.134a3.45 3.45 0 0 1 0 1.82c-.152.558-.46 1.036-.762 1.432-.281.368-.66.785-.881 1.054-.237.287-.475.596-.801.779q-.09.049-.183.088v.136c0 2.182-2.143 3.684-4.417 3.684h-1.833a.75.75 0 0 1 0-1.5h1.833c1.775 0 2.917-1.125 2.917-2.184v-.143c-.159-.063-.318-.135-.477-.208-.3-.136-1.01-.41-1.27-1.179-.096-.285-.087-.592-.087-.856V9.904c0-.264-.01-.57.087-.856.26-.769.97-1.043 1.27-1.179.145-.066.29-.132.433-.19C16.29 5.403 13.994 3.5 11 3.5S5.71 5.403 5.376 7.679q.217.089.435.19c.266.121.545.24.764.43.608.53.592 1.233.592 1.605v4.026c0 .372.016 1.075-.592 1.603-.219.19-.498.31-.764.432-.357.163-.706.332-1.073.362-1.02.082-1.58-.638-1.888-1.014-.222-.27-.6-.686-.882-1.054-.302-.396-.61-.874-.762-1.433a3.44 3.44 0 0 1 0-1.818c.111-.407.312-.765.573-1.136.256-.363.602-.783 1.027-1.299.203-.246.533-.692 1.06-.924C4.216 4.395 7.375 2 11 2M4.618 9.002a.3.3 0 0 0-.234.071c-.115.086-.225.218-.42.454-.44.534-.743.903-.959 1.21-.21.298-.304.493-.352.665-.092.338-.092.69 0 1.029.079.286.252.584.506.918.276.36.531.626.849 1.011.18.218.286.336.389.41.071.05.127.07.221.062.041-.004.108-.022.57-.232a8 8 0 0 0 .33-.156 1 1 0 0 0 .073-.043.14.14 0 0 0 .052-.088 1.7 1.7 0 0 0 .024-.383V9.904c0-.208-.006-.31-.024-.383a.14.14 0 0 0-.052-.09 1 1 0 0 0-.073-.042c-.07-.037-.167-.08-.33-.155-.462-.21-.529-.229-.57-.232m12.764-.001c-.041.003-.107.022-.57.233-.203.093-.31.143-.391.202-.059.042-.072.066-.08.091.005-.014 0-.01-.003.05-.004.068-.005.16-.005.327v4.026c0 .166 0 .258.005.327.004.06.008.063.003.049.009.025.021.049.08.092.081.058.188.11.39.202.464.21.53.229.571.232a.4.4 0 0 0 .234-.049c.023-.012.063-.042.376-.423.318-.385.573-.652.849-1.012.255-.334.428-.631.506-.917.092-.338.092-.69 0-1.029-.047-.172-.141-.367-.352-.666-.216-.306-.52-.675-.959-1.209-.142-.172-.17-.222-.274-.34a.7.7 0 0 0-.146-.137.4.4 0 0 0-.234-.049"
                        fill="currentColor"
                      ></path>
                    </svg>
                  </button>
                  <button type="button" className="inline-flex items-center justify-center cursor-pointer font-bold transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 hover:text-gray-900 border-none shadow-none bg-transparent p-0 text-light-primary-text w-10 h-10">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M2.306.958C2.67.662 3.128.516 3.595.613c.46.095.817.402 1.033.79l.582 1.045c.223.399.421.751.55 1.061.138.327.228.672.187 1.062-.04.39-.2.709-.402 1-.19.277-.457.581-.757.925L3.443 8.041a14.7 14.7 0 0 0 4.515 4.516l1.545-1.346c.345-.3.65-.566.926-.757.292-.201.61-.361 1-.402.39-.04.734.05 1.061.188.31.13.663.327 1.062.55l1.045.581c.387.216.694.573.79 1.034.096.466-.05.926-.346 1.29-.978 1.2-2.56 1.981-4.237 1.643-.99-.2-1.965-.533-3.139-1.206-2.349-1.347-4.452-3.452-5.798-5.798C1.194 7.161.862 6.184.662 5.196c-.338-1.677.443-3.26 1.644-4.238m9.278 10.586c-.049.005-.128.024-.303.145-.19.132-.422.332-.793.654l-1.12.974a8 8 0 0 0 1.733.55c1.021.206 2.075-.258 2.778-1.12.012-.015.017-.03.023-.039q-.013-.011-.036-.026l-1.044-.582c-.428-.239-.697-.387-.91-.477-.197-.082-.279-.084-.328-.079m-8.33-9.423C2.39 2.825 1.925 3.877 2.131 4.9c.113.56.277 1.115.55 1.731l.974-1.119c.322-.37.523-.601.655-.792.12-.175.14-.255.144-.304.005-.049.004-.13-.078-.327-.09-.214-.238-.482-.476-.91l-.583-1.045q-.015-.024-.028-.036-.016.008-.037.024"
                        fill="#212529"
                      ></path>
                    </svg>
                  </button>
                  <button type="button" className="inline-flex items-center justify-center cursor-pointer font-bold transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 hover:text-gray-900 border-none shadow-none bg-transparent p-0 text-light-primary-text w-10 h-10">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M11.708 1.083c1.478 0 2.645 0 3.57.096.937.097 1.716.302 2.384.772.355.25.672.548.94.885.509.64.732 1.392.837 2.289.104.88.102 1.987.102 3.375v2.333l-.001.139.002.028-.002.07c0 1.234-.001 2.208-.054 3.003-.056.852-.172 1.55-.427 2.196-.776 1.956-2.408 3.482-4.455 4.2-1.161.408-2.561.441-4.85.444q-.064.003-.129.004l-.055-.003-.695.002c-1.585 0-2.571.01-3.38-.273-1.253-.44-2.259-1.377-2.738-2.585-.164-.413-.234-.85-.267-1.352-.032-.496-.032-1.107-.032-1.873V9.166c0-1.706-.002-3.065.15-4.129.156-1.09.486-1.98 1.227-2.677.734-.69 1.66-.993 2.796-1.136C7.75 1.082 9.184 1.083 11 1.083zM11 2.583c-1.856 0-3.178.001-4.18.128-.986.125-1.55.36-1.957.742-.4.377-.64.89-.77 1.796-.134.933-.135 2.166-.135 3.917v5.667c0 .786 0 1.34.03 1.774.028.428.081.69.163.898.311.784.976 1.419 1.84 1.723.508.177 1.172.188 2.884.188q.438-.001.828-.004a2.303 2.303 0 0 0 2.228-2.3c0-.134-.006-.278-.014-.441-.007-.157-.016-.335-.02-.512-.007-.35.003-.764.11-1.165a2.28 2.28 0 0 1 1.612-1.611c.401-.108.815-.118 1.165-.11.177.003.355.012.512.019q.242.013.44.014a2.304 2.304 0 0 0 2.304-2.274l.001-.199V8.5c0-1.425-.001-2.429-.092-3.2-.089-.754-.254-1.194-.521-1.53a3 3 0 0 0-.63-.592c-.37-.26-.858-.423-1.675-.508-.83-.086-1.904-.087-3.415-.087zm6.98 11.49c-.629.46-1.404.733-2.244.733-.172 0-.347-.008-.51-.016-.167-.008-.32-.015-.473-.018-.31-.007-.554.008-.746.06a.78.78 0 0 0-.55.55c-.052.192-.067.435-.06.746.003.153.01.306.018.474.008.162.016.337.016.51 0 .827-.266 1.592-.714 2.216.562-.053.998-.136 1.39-.274 1.66-.582 2.95-1.807 3.557-3.338.167-.421.263-.92.316-1.644m-7.897-4.74a.75.75 0 0 1 0 1.5h-2.75a.75.75 0 0 1 0-1.5zm3.667-3.666a.75.75 0 0 1 0 1.5H7.333a.75.75 0 0 1 0-1.5z"
                        fill="currentColor"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>
  );
}
