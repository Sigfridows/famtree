import AdminShell from "@/features/admin/components/AdminShell";
import "./admin.css";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
