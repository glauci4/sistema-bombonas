import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Truck, Calendar, MapPin, User, Package, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { despachoService } from '@/services/despachoService';
import { Despacho } from '@/services/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const Despachos = () => {
  const [despachos, setDespachos] = useState<(Despacho & { bombona_nome: string; bombona_status: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDespachos();
  }, []);

  const fetchDespachos = async () => {
    try {
      const data = await despachoService.getUserDespachos();
      setDespachos(data);
    } catch (error) {
      console.error('Erro ao carregar despachos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      em_transito: 'bg-blue-100 text-blue-800 border-blue-200',
      entregue: 'bg-green-100 text-green-800 border-green-200',
      retornado: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendente: 'Pendente',
      em_transito: 'Em Trânsito',
      entregue: 'Entregue',
      retornado: 'Retornado'
    };
    return labels[status] || status;
  };

  const getBombonaStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: 'Disponível',
      in_use: 'Em Uso',
      maintenance: 'Manutenção',
      washing: 'Lavagem',
      lost: 'Extraviada'
    };
    return labels[status] || status;
  };

  const filteredDespachos = despachos.filter(despacho => {
    const matchesSearch = 
      despacho.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
      despacho.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      despacho.bombona_nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || despacho.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestão de Despachos</h1>
            <p className="text-muted-foreground">Acompanhe todos os despachos realizados</p>
          </div>
          
          <Button 
            onClick={() => navigate('/bombonas')}
            variant="outline"
            className="gap-2"
          >
            <Package className="w-4 h-4" />
            Voltar para Bombonas
          </Button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por destino, responsável ou bombona..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="em_transito">Em Trânsito</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
              <SelectItem value="retornado">Retornado</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={() => navigate('/mapa')}
            variant="outline"
            className="gap-2"
          >
            <MapPin className="w-4 h-4" />
            Ver no Mapa
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando despachos...</p>
          </div>
        ) : filteredDespachos.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Nenhum despacho encontrado' 
                  : 'Nenhum despacho registrado'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredDespachos.map((despacho) => (
              <Card key={despacho.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{despacho.destino}</h3>
                          <p className="text-sm text-muted-foreground">
                            Bombona: {despacho.bombona_nome}
                          </p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(despacho.status)}>
                          {getStatusLabel(despacho.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Responsável:</span>
                          <span className="font-medium">{despacho.responsavel}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Despacho:</span>
                          <span className="font-medium">
                            {format(new Date(despacho.data_despacho), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>

                        {despacho.data_prevista_retorno && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Retorno:</span>
                            <span className="font-medium">
                              {format(new Date(despacho.data_prevista_retorno), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Status Bombona:</span>
                          <Badge variant="outline" className="text-xs">
                            {getBombonaStatusLabel(despacho.bombona_status)}
                          </Badge>
                        </div>
                      </div>

                      {despacho.endereco && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{despacho.endereco}</span>
                        </div>
                      )}

                      {despacho.observacoes && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Observações:</strong> {despacho.observacoes}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 lg:flex-col">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/bombonas/details/${despacho.bombona_id}`)}
                      >
                        Ver Bombona
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/mapa')}
                      >
                        Ver no Mapa
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Despachos;