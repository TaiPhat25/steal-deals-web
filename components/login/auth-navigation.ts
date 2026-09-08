export const AUTH_TAB_CHANGE_EVENT = "steal-deals:auth-tab-change";

export type AuthTab = "signin" | "register";

export type AuthTabChangeDetail = {
  tab: AuthTab;
};
