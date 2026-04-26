"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, LayoutDashboard, LogOut, User } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const { data: session, status } = useSession()
  const loading = status === "loading"

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50 transition-all">
      <div className="container mx-auto flex items-center justify-between">
        <Link className="flex items-center justify-center gap-2 group" href="/">
          <div className="bg-primary rounded-lg p-1.5 shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-black text-xl tracking-tighter text-foreground">AttendSync</span>
        </Link>
        
        <nav className="hidden md:flex gap-6 items-center">
          <Link className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors" href="/#features">
            Features
          </Link>
          <Link className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors" href="/#security">
            Security
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {!loading && (
            <>
              {session ? (
                <div className="flex items-center gap-3">
                  <Button variant="ghost" asChild className="hidden sm:flex gap-2 font-bold px-4 hover:bg-muted/50 rounded-xl">
                    <Link href="/app">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border-2 border-muted hover:border-primary transition-all p-0 overflow-hidden bg-muted/30">
                         {session.user?.image ? (
                           <img src={session.user.image} alt="User" />
                         ) : (
                           <span className="font-bold text-xs uppercase">
                             {(session.user?.name ?? session.user?.email ?? "?")[0]}
                           </span>
                         )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl notion-shadow border">
                      <DropdownMenuLabel className="font-normal px-2 py-3">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-black leading-none">{session.user?.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="rounded-lg py-2.5 font-semibold focus:bg-primary/5 focus:text-primary">
                        <Link href="/app" className="flex items-center cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg py-2.5 font-semibold focus:bg-primary/5 focus:text-primary">
                         <Link href="/profile" className="flex items-center cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="rounded-lg py-2.5 font-semibold text-destructive focus:bg-destructive/5 focus:text-destructive cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Button asChild className="h-10 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
