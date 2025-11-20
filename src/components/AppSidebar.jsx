import React from 'react'
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem 
} from './ui/Sidebar'
import { 
  Home, 
  Film, 
  Star 
} from 'lucide-react'

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "WatchList",
    url: "/watchlist",
    icon: Film,
  },
  {
    title: "Favorites",
    url: "/favorites",
    icon: Star,
  },
]

export function AppSidebar() {
  return (
    <Sidebar className="shadow-md bg-white/1.5 backdrop-blur-3xl">
      <SidebarContent>
        <div className="text-xl font-bold text-white mb-6 text-center">
          FlickNest
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="text-cyan-300">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a 
                      href={item.url} 
                      className="flex items-center space-x-3 p-2 rounded 
                        transition duration-300 ease-in-out 
                        hover:bg-neutral-900 
                        text-white
                        group 
                        relative 
                        overflow-hidden"
                    >
                      <item.icon className="w-5 h-5 text-white transition duration-300 group-hover:text-gray-300 group-hover:scale-110" />
                      <span className="transition duration-300 group-hover:text-gray-300">
                        {item.title}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}