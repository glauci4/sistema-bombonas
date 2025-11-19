import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, MapPin, Activity, CheckCircle2, AlertCircle, Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Asset {
  id: string;
  name: string;
  type: string;
  location: string;
  status: "available" | "in_use" | "maintenance" | "washing";
  lastWash: string;
  cycles: number;
  qr_code: string;
}

// Atualize o statusConfig para incluir "washing" e usar os mesmos status do AllAssets
const statusConfig = {
  available: {
    label: "Disponível",
    icon: CheckCircle2,
    color: "bg-success text-success-foreground",
  },
  in_use: {
    label: "Em Uso", 
    icon: Activity,
    color: "bg-primary text-primary-foreground",
  },
  maintenance: {
    label: "Manutenção",
    icon: AlertCircle,
    color: "bg-destructive text-destructive-foreground",
  },
  washing: {
    label: "Lavagem",
    icon: Clock,
    color: "bg-accent text-accent-foreground",
  },
};

const AssetOverview = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAssets, setTotalAssets] = useState(0);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      // Busca as últimas 4 bombonas para a visão geral
      const { data: recentBombonas, error } = await supabase
        .from('bombonas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;

      // Busca o total de bombonas para o botão
      const { count } = await supabase
        .from('bombonas')
        .select('*', { count: 'exact', head: true });

      setTotalAssets(count || 0);

      // Converte os dados do banco para o formato do componente
      const formattedAssets: Asset[] = (recentBombonas || []).map(bombona => ({
        id: bombona.id,
        name: bombona.name,
        type: bombona.type,
        location: bombona.location_address || 'Localização não informada',
        status: (bombona.status as "available" | "in_use" | "maintenance" | "washing") || 'available',
        lastWash: formatLastWash(bombona.last_wash_date),
        cycles: bombona.total_cycles || 0,
        qr_code: bombona.qr_code
      }));

      setAssets(formattedAssets);
    } catch (error: any) {
      toast.error('Erro ao carregar ativos');
      console.error('Erro ao buscar bombonas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastWash = (lastWashDate: string | null): string => {
    if (!lastWashDate) return 'Nunca lavada';
    
    const now = new Date();
    const washDate = new Date(lastWashDate);
    const diffTime = Math.abs(now.getTime() - washDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Há 1 dia';
    return `Há ${diffDays} dias`;
  };

  if (loading) {
    return (
      <Card className="shadow-card-eco border-border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Visão Geral de Ativos</h2>
              <p className="text-muted-foreground mt-1">Bombonas ativas no sistema</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-card-eco border-border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Visão Geral de Ativos</h2>
            <p className="text-muted-foreground mt-1">Bombonas ativas no sistema</p>
          </div>
          <Button 
            className="bg-gradient-eco text-primary-foreground shadow-eco hover:opacity-90"
            onClick={() => navigate('/bombonas')}
          >
            <Package className="w-4 h-4 mr-2" />
            Novo Ativo
          </Button>
        </div>

        <div className="space-y-4">
          {assets.length === 0 ? (
            <Card className="border">
              <div className="p-8 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma bombona cadastrada</p>
                <Button 
                  className="mt-4 bg-gradient-eco text-primary-foreground"
                  onClick={() => navigate('/bombonas')}
                >
                  Cadastrar Primeira Bombona
                </Button>
              </div>
            </Card>
          ) : (
            assets.map((asset) => {
              const statusInfo = statusConfig[asset.status];
              const StatusIcon = statusInfo.icon;

              return (
                <Card key={asset.id} className="border hover:shadow-card-eco transition-all duration-300">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-eco flex items-center justify-center shrink-0">
                            <Package className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-foreground">{asset.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {asset.qr_code}
                              </Badge>
                              <Badge className={statusInfo.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Tipo: {asset.type}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4 text-accent" />
                            <span>{asset.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>Última lavagem: {asset.lastWash}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Activity className="w-4 h-4 text-success" />
                            <span>{asset.cycles} ciclos completados</span>
                          </div>
                        </div>
                      </div>

                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/bombonas/details/${asset.id}`);
                        }}
                      >
                        Detalhes
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary/5"
            onClick={() => navigate('/all-assets')}
          >
            Ver Todos os Ativos ({totalAssets}+)
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AssetOverview;