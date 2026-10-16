import {act, cleanup, renderHook, waitFor} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";
import {useNotifications} from "@/features/notifications/hooks/useNotifications";
const state=vi.hoisted(() => ({authenticated:true, loading:false}));
const api=vi.hoisted(() => ({getNotifications:vi.fn(),getUnreadCount:vi.fn()}));
vi.mock("@/features/auth/hooks/useAuth",()=>({useAuth:()=>({isAuthenticated:state.authenticated,isLoading:state.loading})}));
vi.mock("@/features/notifications/api/notificationsService",()=>({notificationsApi:api}));
afterEach(cleanup);
describe("notification privacy",()=>{
  it("does not expose a late private response after logout",async()=>{
    state.authenticated=true;
    let finish:(value:unknown[])=>void=()=>{};
    api.getNotifications.mockReturnValue(new Promise(resolve=>{finish=resolve;}));
    api.getUnreadCount.mockResolvedValue(1);
    const {result,rerender}=renderHook(()=>useNotifications());
    await waitFor(()=>expect(api.getNotifications).toHaveBeenCalled());
    state.authenticated=false;rerender();
    await act(async()=>finish([{notificationId:1,title:"Privada",message:"Datos de la sesión anterior",eventType:"FAVORITE_STATUS",isRead:false,createdAt:new Date().toISOString()}]));
    expect(result.current.notifications).toEqual([]);
    expect(result.current.rawNotifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });
});
