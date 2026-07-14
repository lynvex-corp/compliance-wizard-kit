import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  AlertTriangle,
  ListChecks,
  ClipboardCheck,
  FileText,
  BarChart3,
  ShieldAlert,
  GraduationCap,
  Users,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { JawdaLogo } from "@/components/brand/logo";
import { menuItems } from "@/lib/mock-data";

const iconMap = {
  LayoutDashboard,
  AlertTriangle,
  ListChecks,
  ClipboardCheck,
  FileText,
  BarChart3,
  ShieldAlert,
  GraduationCap,
  Users,
  Settings,
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-4 py-5">
        <JawdaLogo showWordmark={!collapsed} size={26} />
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => {
                const Icon = iconMap[item.icon];
                const active =
                  item.to === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.to);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className="h-10 rounded-lg data-[active=true]:bg-brand-soft data-[active=true]:text-brand data-[active=true]:font-medium hover:bg-brand-soft/60"
                    >
                      <Link to={item.to}>
                        <Icon className="h-[18px] w-[18px]" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-4 py-4 text-xs text-muted-foreground">
        {!collapsed && <span>v1.0 · Jáwda Quality</span>}
      </SidebarFooter>
    </Sidebar>
  );
}