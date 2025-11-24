import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Droplet, Package, CheckCircle2, ArrowLeft } from 'lucide-react'; // ADICIONE ArrowLeft
import { toast } from 'sonner';
import { Bombona, NewLavagem } from '@/services/types';
import { lavagemService } from '@/services/lavagemService';

interface LavagemFormProps {
  bombona?: Bombona;
  onLavagemCriada: () => void;
  onCancel?: () => void;
}

const LavagemForm = ({ bombona, onLavagemCriada, onCancel }: LavagemFormProps) => {
  const [loading, setLoading] = useState(false);
  const [bombonasDisponiveis, setBombonasDisponiveis] = useState<Bombona[]>([]);
  const [bombonaSelecionada, setBombonaSelecionada] = useState<Bombona | null>(bombona || null);

  const [formData, setFormData] = useState<NewLavagem>({
    bombona_id: bombona?.id || '',
    data_lavagem: new Date().toISOString().split('T')[0],
    produto_anterior: bombona?.current_product || null,
    produto_novo: '',
    observacoes: null,
  });

  useEffect(() => {
    if (!bombona) {
      carregarBombonasDisponiveis();
    }
  }, [bombona]);

  const carregarBombonasDisponiveis = async () => {
    try {
      const bombonas = await lavagemService.fetchBombonasParaLavagem();
      setBombonasDisponiveis(bombonas);
    } catch (error) {
      console.error('Erro ao carregar bombonas:', error);
    }
  };

  const handleBombonaChange = (bombonaId: string) => {
    const bombona = bombonasDisponiveis.find(b => b.id === bombonaId);
    setBombonaSelecionada(bombona || null);
    
    setFormData(prev => ({
      ...prev,
      bombona_id: bombonaId,
      produto_anterior: bombona?.current_product || null
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bombona_id) {
      toast.error('Selecione uma bombona');
      return;
    }

    if (!formData.data_lavagem) {
      toast.error('Informe a data da lavagem');
      return;
    }

    setLoading(true);
    try {
      const resultado = await lavagemService.createLavagem(formData);
      
      if (resultado) {
        toast.success('Lavagem registrada com sucesso!');
        onLavagemCriada();
        
        setFormData({
          bombona_id: '',
          data_lavagem: new Date().toISOString().split('T')[0],
          produto_anterior: null,
          produto_novo: '',
          observacoes: null,
        });
        setBombonaSelecionada(null);
      }
    } catch (error: unknown) {
      console.error('Erro ao criar lavagem:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-100 text-green-800 border-green-200',
      in_use: 'bg-blue-100 text-blue-800 border-blue-200',
      maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      washing: 'bg-purple-100 text-purple-800 border-purple-200',
      lost: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: 'Disponível',
      in_use: 'Em Uso',
      maintenance: 'Manutenção',
      washing: 'Lavagem',
      lost: 'Extraviada'
    };
    return labels[status] || status;
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto"> {}
      <Card>
        <CardHeader className="sticky top-0 bg-background z-10 border-b"> {}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCancel}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="w-5 h-5" />
              Registrar Lavagem
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {}
            {!bombona && (
              <div className="space-y-2">
                <Label htmlFor="bombona_id">Bombona *</Label>
                <Select 
                  value={formData.bombona_id} 
                  onValueChange={handleBombonaChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma bombona" />
                  </SelectTrigger>
                  <SelectContent>
                    {bombonasDisponiveis.map((bombona) => (
                      <SelectItem key={bombona.id} value={bombona.id}>
                        <div className="flex items-center justify-between">
                          <span>{bombona.name}</span>
                          <Badge variant="outline" className={getStatusColor(bombona.status)}>
                            {getStatusLabel(bombona.status)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Apenas bombonas disponíveis para lavagem são mostradas
                </p>
              </div>
            )}

            {}

            {/* Botões */}
            <div className="flex gap-3 pt-4 sticky bottom-0 bg-background pb-2"> {}
              <Button 
                type="submit" 
                disabled={loading || !formData.bombona_id}
                className="flex-1"
              >
                <Droplet className="w-4 h-4 mr-2" />
                {loading ? 'Registrando Lavagem...' : 'Registrar Lavagem'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LavagemForm;