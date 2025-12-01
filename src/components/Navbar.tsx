import { Button } from "@/components/ui/button";
import { Leaf, Menu, Bell, User, LogOut, QrCode, Map, FileText, Package, Truck, Droplets } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  type: string;
  is_read: boolean;
  related_entity: string | null;
  related_entity_id: string | null;
  created_at: string;
  updated_at: string;
}

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate(); // USE navigate DIRETAMENTE
  const location = useLocation();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // FUNÇÃO DE NAVEGAÇÃO SEGURA
  const safeNavigate = (path: string | number) => {
    try {
      if (typeof path === 'number') {
        if (window.history.length > 1) {
          navigate(path);
        } else {
          navigate('/');
        }
      } else {
        navigate(path);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      navigate('/');
    }
  };

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erro ao buscar notificações:', error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Erro ao marcar todas como lidas:', error);
        toast({
          title: "Erro",
          description: "Não foi possível marcar as notificações como lidas",
          variant: "destructive"
        });
        return;
      }

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      
      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas",
      });
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          toast({
            title: newNotification.title,
            description: newNotification.message || undefined,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const navigationItems = [
    { name: 'Visão Geral', path: '/', icon: null },
    { name: 'Bombonas', path: '/bombonas', icon: Package },
    { name: 'Despachos', path: '/despachos', icon: Truck },
    { name: 'Lavagens', path: '/lavagens', icon: Droplets },
    { name: 'Scanner', path: '/scanner', icon: QrCode },
    { name: 'Mapa', path: '/mapa', icon: Map },
    { name: 'Relatórios', path: '/relatorios', icon: FileText },
  ];

  // Função de navegação para o Navbar
  const handleNavigation = (path: string) => {
    safeNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border shadow-card-eco">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => handleNavigation('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">BonnaTech</h1>
              <p className="text-xs text-muted-foreground">Gestão Sustentável</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navigationItems.map((item) => (
              <Button 
                key={item.path}
                variant="ghost" 
                className={`${
                  isActive(item.path) 
                    ? "text-primary bg-primary/10" 
                    : "text-foreground hover:text-primary hover:bg-accent"
                } transition-colors`}
                onClick={() => handleNavigation(item.path)}
              >
                {item.name}
              </Button>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                <DropdownMenuLabel className="flex justify-between items-center">
                  <span>Notificações</span>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={markAllAsRead}
                      className="h-auto p-1 text-xs"
                    >
                      Marcar todas como lidas
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Nenhuma notificação
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem 
                      key={notification.id}
                      className={`flex flex-col items-start p-3 cursor-pointer ${
                        !notification.is_read ? 'bg-muted/50' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="font-medium text-sm">{notification.title}</div>
                      {notification.message && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-2 self-end">
                        {new Date(notification.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User Dropdown */}
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
                <DropdownMenuItem onClick={() => handleNavigation('/bombonas')}>
                  <Package className="w-4 h-4 mr-2" />
                  Bombonas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/despachos')}>
                  <Truck className="w-4 h-4 mr-2" />
                  Despachos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/lavagens')}>
                  <Droplets className="w-4 h-4 mr-2" />
                  Lavagens
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/scanner')}>
                  <QrCode className="w-4 h-4 mr-2" />
                  Scanner
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/mapa')}>
                  <Map className="w-4 h-4 mr-2" />
                  Mapa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/relatorios')}>
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

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-card border-b border-border shadow-lg">
            <div className="px-4 py-2 space-y-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={`w-full justify-start ${
                    isActive(item.path) ? "text-primary bg-primary/10" : "text-foreground"
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;