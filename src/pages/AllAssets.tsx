import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, MapPin, Activity, CheckCircle2, AlertCircle, Clock, Search, Filter, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Bombona {
  id: string;
  name: string;
  qr_code: string;
  capacity: number;
  material: string;
  type: string;
  status: string;
  color: string | null;
  location_address: string | null;
  current_product: string | null;
  total_cycles: number;
  last_wash_date: string | null;
}

const statusConfig = {
  available: {
    label: 'Disponível',
    icon: CheckCircle2,
    color: 'bg-success text-success-foreground',
  },
  in_use: {
    label: 'Em Uso',
    icon: Activity,
    color: 'bg-primary text-primary-foreground',
  },
  maintenance: {
    label: 'Manutenção',
    icon: AlertCircle,
    color: 'bg-destructive text-destructive-foreground',
  },
  washing: {
    label: 'Lavagem',
    icon: Clock,
    color: 'bg-accent text-accent-foreground',
  },
};

const AllAssets = () => {
  const navigate = useNavigate();
  const [bombonas, setBombonas] = useState<Bombona[]>([]);
  const [filteredBombonas, setFilteredBombonas] = useState<Bombona[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [materialFilter, setMaterialFilter] = useState<string>('all');

  useEffect(() => {
    fetchBombonas();
  }, []);

  useEffect(() => {
    filterBombonas();
  }, [searchTerm, statusFilter, materialFilter, bombonas]);

  const fetchBombonas = async () => {
    try {
      const { data, error } = await supabase
        .from('bombonas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBombonas(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar bombonas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterBombonas = () => {
    let filtered = bombonas;

    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.qr_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    if (materialFilter !== 'all') {
      filtered = filtered.filter(b => b.material === materialFilter);
    }

    setFilteredBombonas(filtered);
  };

  const getStatusInfo = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.available;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Todos os Ativos</h1>
          <p className="text-muted-foreground">
            {filteredBombonas.length} {filteredBombonas.length === 1 ? 'bombona encontrada' : 'bombonas encontradas'}
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou QR code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="in_use">Em Uso</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                  <SelectItem value="washing">Lavagem</SelectItem>
                </SelectContent>
              </Select>

              <Select value={materialFilter} onValueChange={setMaterialFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Materiais</SelectItem>
                  <SelectItem value="PEAD">PEAD</SelectItem>
                  <SelectItem value="PP">PP</SelectItem>
                  <SelectItem value="PVC">PVC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Assets Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : filteredBombonas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || materialFilter !== 'all'
                  ? 'Nenhuma bombona encontrada com os filtros aplicados'
                  : 'Nenhuma bombona cadastrada'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBombonas.map((bombona) => {
              const statusInfo = getStatusInfo(bombona.status);
              const StatusIcon = statusInfo.icon;

              return (
                <Card 
                  key={bombona.id} 
                  className="hover:shadow-card-eco transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/bombonas/details/${bombona.id}`)}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-lg bg-gradient-eco flex items-center justify-center shrink-0">
                          <Package className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{bombona.name}</h3>
                        <p className="text-sm text-muted-foreground">QR: {bombona.qr_code}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Capacidade:</span>
                          <p className="font-semibold">{bombona.capacity}L</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Material:</span>
                          <p className="font-semibold">{bombona.material}</p>
                        </div>
                      </div>

                      {bombona.location_address && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{bombona.location_address}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                        <span>Ciclos: {bombona.total_cycles || 0}</span>
                        <Button variant="ghost" size="sm">
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AllAssets;
