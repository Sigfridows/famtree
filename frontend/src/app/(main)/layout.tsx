import SideBar from "@/components/shared/SideBar";
import FeedbackToast from "@/components/shared/FeedbackToast";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <SideBar />
      <main className="w-full min-h-screen flex-1">
        {children}
      </main>
      <FeedbackToast />
    </div>
  );
}
