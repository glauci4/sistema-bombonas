import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, Droplet, Package, Calendar, Trash2, Eye, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { LavagemWithBombona, LavagemStats } from '@/services/types';
import { lavagemService } from '@/services/lavagemService';
import LavagemForm from '@/components/LavagemForm';

const Lavagens = () => {
  const [lavagens, setLavagens] = useState<LavagemWithBombona[]>([]);
  const [stats, setStats] = useState<LavagemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    data_inicio: '',
    data_fim: '',
    material: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lavagensData, statsData] = await Promise.all([
        lavagemService.fetchLavagens(),
        lavagemService.fetchLavagemStats()
      ]);
      setLavagens(lavagensData);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrar = async () => {
    try {
      setLoading(true);
      const lavagensFiltradas = await lavagemService.fetchLavagensComFiltros(filters);
      setLavagens(lavagensFiltradas);
    } catch (error) {
      console.error('Erro ao filtrar lavagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLimparFiltros = () => {
    setFilters({
      data_inicio: '',
      data_fim: '',
      material: ''
    });
    fetchData();
  };

  const handleDeleteLavagem = async (lavagemId: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro de lavagem?')) {
      return;
    }

    try {
      const success = await lavagemService.deleteLavagem(lavagemId);
      if (success) {
        toast.success('Lavagem excluída com sucesso!');
        fetchData();
      }
    } catch (error) {
      console.error('Erro ao excluir lavagem:', error);
    }
  };

  const handleLavagemCriada = () => {
    setIsDialogOpen(false);
    fetchData();
  };

  const filteredLavagens = lavagens.filter(lavagem =>
    lavagem.bombona_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lavagem.bombona_qr_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lavagem.produto_anterior && lavagem.produto_anterior.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (lavagem.produto_novo && lavagem.produto_novo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getMaterialColor = (material: string) => {
    const colors: Record<string, string> = {
      'PEAD': 'bg-blue-100 text-blue-800 border-blue-200',
      'PP': 'bg-green-100 text-green-800 border-green-200',
      'PVC': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[material] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestão de Lavagens</h1>
            <p className="text-muted-foreground">Controle e acompanhe os processos de higienização</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Lavagem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Registrar Nova Lavagem</DialogTitle>
                <DialogDescription>
                  Preencha os dados do processo de higienização
                </DialogDescription>
              </DialogHeader>
              <LavagemForm onLavagemCriada={handleLavagemCriada} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Droplet className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Total de Lavagens</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.total_lavagens}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Calendar className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600">Lavagens Este Mês</p>
                    <p className="text-2xl font-bold text-green-800">{stats.lavagens_mes_atual}</p>
                    <p className="text-xs text-green-600 mt-1">
                      {stats.taxa_crescimento > 0 ? '↑' : '↓'} {Math.abs(stats.taxa_crescimento)}% vs mês anterior
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <Package className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-orange-600">Para Lavagem</p>
                    <p className="text-2xl font-bold text-orange-800">{stats.bombonas_para_lavagem}</p>
                    <p className="text-xs text-orange-600 mt-1">Bombonas necessitando lavagem</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600">Média de Ciclos</p>
                    <p className="text-2xl font-bold text-purple-800">{stats.media_ciclos_por_bombona}</p>
                    <p className="text-xs text-purple-600 mt-1">Ciclos por bombona</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={filters.data_inicio}
                  onChange={(e) => setFilters({...filters, data_inicio: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data_fim">Data Fim</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={filters.data_fim}
                  onChange={(e) => setFilters({...filters, data_fim: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Select 
                  value={filters.material} 
                  onValueChange={(value) => setFilters({...filters, material: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos materiais" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PEAD">PEAD</SelectItem>
                    <SelectItem value="PP">PP</SelectItem>
                    <SelectItem value="PVC">PVC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end gap-2">
                <Button onClick={handleFiltrar} className="flex-1">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrar
                </Button>
                <Button variant="outline" onClick={handleLimparFiltros}>
                  Limpar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por bombona, QR code ou produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Lavagens */}
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Carregando lavagens...</p>
            </CardContent>
          </Card>
        ) : filteredLavagens.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Droplet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || filters.data_inicio || filters.material 
                  ? 'Nenhuma lavagem encontrada' 
                  : 'Nenhuma lavagem registrada'
                }
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)} 
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Registrar Primeira Lavagem
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredLavagens.map((lavagem) => (
              <Card key={lavagem.id} className="hover:shadow-card-eco transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{lavagem.bombona_nome}</h3>
                          <p className="text-muted-foreground">QR: {lavagem.bombona_qr_code}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className={getMaterialColor(lavagem.bombona_material)}>
                            {lavagem.bombona_material}
                          </Badge>
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                            Ciclo {lavagem.ciclos_depois}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Data da Lavagem</p>
                          <p className="font-semibold flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(lavagem.data_lavagem)}
                          </p>
                        </div>
                        
                        {lavagem.produto_anterior && (
                          <div>
                            <p className="text-sm text-muted-foreground">Produto Anterior</p>
                            <p className="font-semibold">{lavagem.produto_anterior}</p>
                          </div>
                        )}
                        
                        {lavagem.produto_novo && (
                          <div>
                            <p className="text-sm text-muted-foreground">Produto Novo</p>
                            <p className="font-semibold text-green-600">{lavagem.produto_novo}</p>
                          </div>
                        )}
                      </div>

                      {lavagem.observacoes && (
                        <div className="bg-muted/20 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Observações:</p>
                          <p className="text-sm">{lavagem.observacoes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 lg:flex-col">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {/* Navegar para detalhes */}}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Detalhes
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteLavagem(lavagem.id)}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 mt-4 border-t text-sm text-muted-foreground">
                    <span>Capacidade: {lavagem.bombona_capacidade}L</span>
                    <span>Registrado em: {formatDate(lavagem.created_at)}</span>
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

export default Lavagens;