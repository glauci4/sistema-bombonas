// src/pages/LavagemDetails.tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Package, Droplet, User, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { LavagemWithBombona } from '@/services/types';
import { lavagemService } from '@/services/lavagemService';

const LavagemDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lavagem, setLavagem] = useState<LavagemWithBombona | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLavagem = useCallback(async () => {
    if (!id) return;
    
    try {
      const lavagemData = await lavagemService.fetchLavagemById(id);
      setLavagem(lavagemData);
    } catch (error) {
      console.error('Erro ao carregar lavagem:', error);
      toast.error('Erro ao carregar lavagem');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLavagem();
  }, [loadLavagem]);

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
          <p className="text-center text-muted-foreground">Carregando...</p>
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
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Excluir Lavagem
          </Button>
        </div>

        {/* Header Card */}
        <Card className="mb-6 shadow-card-eco">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-24 h-24 rounded-lg bg-gradient-eco flex items-center justify-center shrink-0">
                <Droplet className="w-12 h-12 text-primary-foreground" />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      Lavagem - {lavagem.bombona_nome}
                    </h1>
                    <p className="text-muted-foreground">
                      QR Code: {lavagem.bombona_qr_code}
                    </p>
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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Data</p>
                      <p className="font-semibold">{formatDate(lavagem.data_lavagem)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Capacidade</p>
                      <p className="font-semibold">{lavagem.bombona_capacidade}L</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Ciclos Antes</p>
                      <p className="font-semibold">{lavagem.ciclos_antes}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Ciclos Depois</p>
                      <p className="font-semibold">{lavagem.ciclos_depois}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalhes da Lavagem */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações dos Produtos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplet className="w-5 h-5" />
                Informações dos Produtos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lavagem.produto_anterior && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Produto Anterior</p>
                  <div className="p-3 bg-muted/20 rounded-lg border">
                    <p className="font-semibold">{lavagem.produto_anterior}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Produto armazenado antes da lavagem
                    </p>
                  </div>
                </div>
              )}
              
              {lavagem.produto_novo && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Produto Após Lavagem</p>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="font-semibold text-green-700">{lavagem.produto_novo}</p>
                    <p className="text-xs text-green-600 mt-1">
                      Produto armazenado após a lavagem
                    </p>
                  </div>
                </div>
              )}
              
              {!lavagem.produto_anterior && !lavagem.produto_novo && (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum produto registrado nesta lavagem
                </p>
              )}
            </CardContent>
          </Card>

          {/* Observações e Metadados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Adicionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lavagem.observacoes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Observações</p>
                  <div className="p-3 bg-muted/20 rounded-lg border">
                    <p className="text-sm">{lavagem.observacoes}</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Registrado em</p>
                  <p className="font-semibold">{formatDate(lavagem.created_at)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Última atualização</p>
                  <p className="font-semibold">{formatDate(lavagem.updated_at)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">ID do Registro</p>
                  <p className="font-mono text-xs bg-muted p-2 rounded">{lavagem.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações */}
        <div className="flex gap-4 mt-6">
          <Button 
            onClick={() => navigate(`/bombonas/details/${lavagem.bombona_id}`)}
            className="flex-1"
          >
            <Package className="w-4 h-4 mr-2" />
            Ver Bombona
          </Button>
          
          <Button 
            onClick={() => navigate('/lavagens')}
            variant="outline"
            className="flex-1"
          >
            Voltar para Lavagens
          </Button>
        </div>
      </main>
    </div>
  );
};

export default LavagemDetails;