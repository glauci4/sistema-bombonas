import { Button } from "@/components/ui/button";
import { Leaf, Menu, Bell, User, LogOut, QrCode, Map, FileText, Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border shadow-card-eco">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-eco flex items-center justify-center shadow-eco">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">EcoTrack</h1>
              <p className="text-xs text-muted-foreground">Gestão Sustentável</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Button 
              variant="ghost" 
              className={isActive('/') ? "text-primary" : "text-foreground hover:text-primary"}
              onClick={() => navigate('/')}
            >
              Dashboard
            </Button>
            <Button 
              variant="ghost" 
              className={isActive('/bombonas') ? "text-primary" : "text-foreground hover:text-primary"}
              onClick={() => navigate('/bombonas')}
            >
              Bombonas
            </Button>
            <Button 
              variant="ghost" 
              className={isActive('/scanner') ? "text-primary" : "text-foreground hover:text-primary"}
              onClick={() => navigate('/scanner')}
            >
              Scanner
            </Button>
            <Button 
              variant="ghost" 
              className={isActive('/mapa') ? "text-primary" : "text-foreground hover:text-primary"}
              onClick={() => navigate('/mapa')}
            >
              Mapa
            </Button>
            <Button 
              variant="ghost" 
              className={isActive('/relatorios') ? "text-primary" : "text-foreground hover:text-primary"}
              onClick={() => navigate('/relatorios')}
            >
              Relatórios
            </Button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Minha Conta</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/bombonas')}>
                  <Package className="w-4 h-4 mr-2" />
                  Bombonas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/scanner')}>
                  <QrCode className="w-4 h-4 mr-2" />
                  Scanner
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/mapa')}>
                  <Map className="w-4 h-4 mr-2" />
                  Mapa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/relatorios')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Relatórios
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
