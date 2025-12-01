import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, Calendar, Package, Droplet, User, Clock, 
  Trash2, CheckCircle, Box, Palette, Gauge, Database,
  RefreshCw, FileText, Hash, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { LavagemWithBombona } from '@/services/types';
import { lavagemService } from '@/services/lavagemService';

const LavagemDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lavagem, setLavagem] = useState<LavagemWithBombona | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLavagem = useCallback(async () => {
    if (!id) {
      console.error('❌ No ID provided');
      setLoading(false);
      return;
    }
    
    try {
      const lavagemData = await lavagemService.fetchLavagemById(id);
      
      if (lavagemData) {
        setLavagem(lavagemData);
      } else {
        toast.error('Lavagem não encontrada');
      }
    } catch (error) {
      console.error('❌ Error loading lavagem:', error);
      toast.error('Erro ao carregar lavagem');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLavagem();
  }, [loadLavagem]);

  // CORREÇÃO DO BOTÃO VOLTAR
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/lavagens');
    }
  };

  const handleDelete = async () => {
    if (!lavagem) return;

    if (!confirm('Tem certeza que deseja excluir este registro de lavagem?')) {
      return;
    }

    try {
      const success = await lavagemService.deleteLavagem(lavagem.id);
      if (success) {
        toast.success('Lavagem excluída com sucesso!');
        navigate('/lavagens');
      }
    } catch (error) {
      console.error('Erro ao excluir lavagem:', error);
      toast.error('Erro ao excluir lavagem');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMaterialColor = (material: string) => {
    const colors: Record<string, string> = {
      'PEAD': 'bg-blue-100 text-blue-800 border-blue-200',
      'PP': 'bg-green-100 text-green-800 border-green-200',
      'PVC': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[material] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Carregando detalhes da lavagem...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!lavagem) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <Droplet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Lavagem não encontrada</p>
              <Button onClick={() => navigate('/lavagens')}>
                Voltar para Lavagens
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Cabeçalho */}
        <div className="flex justify-between items-start mb-8">
          <div>
            {/* BOTÃO VOLTAR CORRIGIDO */}
            <Button 
              variant="ghost" 
              onClick={handleGoBack}
              className="flex items-center gap-2 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Detalhes da Lavagem</h1>
            <p className="text-muted-foreground mt-2">
              Informações completas sobre o processo de higienização da bombona
            </p>
          </div>
          
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </Button>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card de Visão Geral */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shrink-0">
                    <Droplet className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2">Processo de Lavagem</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className={getMaterialColor(lavagem.bombona_material)}>
                        <Palette className="w-3 h-3 mr-1" />
                        {lavagem.bombona_material}
                      </Badge>
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                        <BarChart3 className="w-3 h-3 mr-1" />
                        Ciclo {lavagem.ciclos_depois}
                      </Badge>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Concluída
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      Processo de higienização realizado em {formatDate(lavagem.data_lavagem)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sobre Esta Lavagem */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Sobre Este Processo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600">Data da Lavagem</p>
                      <p className="font-semibold">{formatDate(lavagem.data_lavagem)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <RefreshCw className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-green-600">Incremento de Ciclos</p>
                      <p className="font-semibold">+{lavagem.ciclos_depois - lavagem.ciclos_antes}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-purple-600">Ciclos Antes</p>
                      <p className="font-semibold">{lavagem.ciclos_antes}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-orange-600">Ciclos Depois</p>
                      <p className="font-semibold">{lavagem.ciclos_depois}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Produtos */}
                <div>
                  <h3 className="font-semibold mb-3">Histórico de Produtos</h3>
                  <div className="space-y-3">
                    {lavagem.produto_anterior && (
                      <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Produto Anterior</p>
                          <p className="font-semibold">{lavagem.produto_anterior}</p>
                        </div>
                        <Badge variant="outline" className="bg-gray-100">
                          Antes da Lavagem
                        </Badge>
                      </div>
                    )}
                    
                    {lavagem.produto_novo && (
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <p className="text-sm text-green-600">Produto Após Lavagem</p>
                          <p className="font-semibold text-green-700">{lavagem.produto_novo}</p>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Após Lavagem
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações da Bombona */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Informações da Bombona
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Box className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Nome</p>
                        <p className="font-semibold">{lavagem.bombona_nome}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Hash className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">QR Code</p>
                        <p className="font-semibold font-mono">{lavagem.bombona_qr_code}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Gauge className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Capacidade</p>
                        <p className="font-semibold">{lavagem.bombona_capacidade} Litros</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Palette className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Material</p>
                        <Badge variant="outline" className={getMaterialColor(lavagem.bombona_material)}>
                          {lavagem.bombona_material}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          {lavagem.bombona_status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Observações */}
            {lavagem.observacoes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Observações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <p className="text-sm leading-relaxed">{lavagem.observacoes}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => navigate(`/bombonas/details/${lavagem.bombona_id}`)}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Ver Bombona
                </Button>
                <Button 
                  onClick={() => navigate('/lavagens')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para Lavagens
                </Button>
              </CardContent>
            </Card>

            {/* Metadados */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Registrado em</p>
                  <p className="font-semibold">{formatDate(lavagem.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Última atualização</p>
                  <p className="font-semibold">{formatDate(lavagem.updated_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ID do Registro</p>
                  <p className="font-mono text-xs bg-muted p-2 rounded break-all">{lavagem.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ID da Bombona</p>
                  <p className="font-mono text-xs bg-muted p-2 rounded break-all">{lavagem.bombona_id}</p>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">Processo Concluído</p>
                    <p className="text-sm text-green-600">Lavagem realizada com sucesso</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LavagemDetails;