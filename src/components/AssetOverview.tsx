import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, MapPin, Activity, CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface Asset {
  id: string;
  name: string;
  type: string;
  location: string;
  status: "available" | "in-use" | "maintenance";
  lastWash: string;
  cycles: number;
}

const mockAssets: Asset[] = [
  {
    id: "BOM-001",
    name: "Bombona PEAD 200L",
    type: "Química",
    location: "Armazém Principal - SP",
    status: "available",
    lastWash: "Há 2 dias",
    cycles: 47,
  },
  {
    id: "BOM-002",
    name: "Container Inox 500L",
    type: "Alimentícia",
    location: "Em Rota - RJ",
    status: "in-use",
    lastWash: "Há 1 dia",
    cycles: 32,
  },
  {
    id: "BOM-003",
    name: "Bombona PP 100L",
    type: "Farmacêutica",
    location: "Centro de Lavagem - MG",
    status: "maintenance",
    lastWash: "Agora",
    cycles: 68,
  },
  {
    id: "BOM-004",
    name: "Bombona PEAD 300L",
    type: "Química",
    location: "Armazém Secundário - PR",
    status: "available",
    lastWash: "Há 3 dias",
    cycles: 25,
  },
];

const statusConfig = {
  available: {
    label: "Disponível",
    icon: CheckCircle2,
    color: "bg-success text-success-foreground",
  },
  "in-use": {
    label: "Em Uso",
    icon: Activity,
    color: "bg-accent text-accent-foreground",
  },
  maintenance: {
    label: "Manutenção",
    icon: AlertCircle,
    color: "bg-muted text-muted-foreground",
  },
};

const AssetOverview = () => {
  return (
    <Card className="shadow-card-eco border-border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Visão Geral de Ativos</h2>
            <p className="text-muted-foreground mt-1">Bombonas ativas no sistema</p>
          </div>
          <Button className="bg-gradient-eco text-primary-foreground shadow-eco hover:opacity-90">
            <Package className="w-4 h-4 mr-2" />
            Novo Ativo
          </Button>
        </div>

        <div className="space-y-4">
          {mockAssets.map((asset) => {
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
                              {asset.id}
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

                    <Button variant="ghost" size="sm" className="shrink-0">
                      Detalhes
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
            Ver Todos os Ativos ({mockAssets.length * 250}+)
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AssetOverview;
