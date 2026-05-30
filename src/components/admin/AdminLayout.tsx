import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="hidden md:block w-[250px] flex-shrink-0">
        <div className="fixed top-0 left-0 h-screen w-[250px]">
          <AdminSidebar />
        </div>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[250px] p-0 bg-[#1c1e37] border-0">
          <AdminSidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center gap-2 px-4 py-3 border-b bg-[#1c1e37] text-white">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-display text-[#54b678]">RutaMercado Admin</span>
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
