import { Button } from "@/components/ui/button";
import { Leaf, Menu, Bell, User } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border shadow-card-eco">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-eco flex items-center justify-center shadow-eco">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">EcoTrack</h1>
              <p className="text-xs text-muted-foreground">Gestão Sustentável</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Dashboard
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Ativos
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Produtos
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Rastreamento
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Relatórios
            </Button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full"></span>
            </Button>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
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
