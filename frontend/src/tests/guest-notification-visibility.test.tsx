import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import NotificationsPopover from "@/features/notifications/components/NotificationsPopover";
const state=vi.hoisted(()=>({isAuthenticated:false,isLoading:false}));
vi.mock("@/features/auth/hooks/useAuth",()=>({useAuth:()=>state}));
vi.mock("@/features/notifications/hooks/useNotifications",()=>({useNotifications:()=>({notifications:[],unreadCount:0,loading:false,markAsRead:vi.fn(),markAllAsRead:vi.fn()})}));
afterEach(cleanup);
it.each([[false,false],[false,true],[true,true]])("does not render a notification trigger without a settled authenticated session (%s,%s)",(isAuthenticated,isLoading)=>{
 Object.assign(state,{isAuthenticated,isLoading});
 const {container}=render(<NotificationsPopover />);
 expect(container).toBeEmptyDOMElement();
});
it("shows the trigger for an authenticated session",()=>{
 Object.assign(state,{isAuthenticated:true,isLoading:false});
 render(<NotificationsPopover />);
 expect(screen.getByRole("button")).toBeInTheDocument();
});
