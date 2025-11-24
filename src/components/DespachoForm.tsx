// src/components/DespachoForm.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Truck, Package, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Bombona, NewDespacho } from '@/services/types';
import { bombonaService } from '@/services/bombonaService';

interface DespachoFormProps {
  bombona?: Bombona;
  onDespachoCreated: () => void;
  onCancel?: () => void;
}

const DespachoForm = ({ bombona, onDespachoCreated, onCancel }: DespachoFormProps) => {
  const [loading, setLoading] = useState(false);
  const [bombonasDisponiveis, setBombonasDisponiveis] = useState<Bombona[]>([]);
  const [bombonaSelecionada, setBombonaSelecionada] = useState<Bombona | null>(bombona || null);

  const [formData, setFormData] = useState<NewDespacho>({
    bombona_id: bombona?.id || '',
    destino: '',
    endereco: '',
    data_despacho: new Date().toISOString().split('T')[0],
    responsavel: '',
    observacoes: '',
  });

  useEffect(() => {
    if (!bombona) {
      carregarBombonasDisponiveis();
    }
  }, [bombona]);

  const carregarBombonasDisponiveis = async () => {
    try {
      const bombonas = await bombonaService.fetchBombonas();
      const disponiveis = bombonas.filter(b => b.status === 'available');
      setBombonasDisponiveis(disponiveis);
    } catch (error) {
      console.error('Erro ao carregar bombonas:', error);
    }
  };

  const handleBombonaChange = (bombonaId: string) => {
    const bombona = bombonasDisponiveis.find(b => b.id === bombonaId);
    setBombonaSelecionada(bombona || null);
    
    setFormData(prev => ({
      ...prev,
      bombona_id: bombonaId
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bombona_id) {
      toast.error('Selecione uma bombona');
      return;
    }

    setLoading(true);
    try {
      // Aqui você implementaria a criação do despacho
      // Por enquanto, vamos simular
      console.log('Criando despacho:', formData);
      
      // Atualizar status da bombona para "em_transito"
      await bombonaService.updateBombonaStatus(formData.bombona_id, 'in_use');
      
      toast.success('Despacho registrado com sucesso!');
      onDespachoCreated();
      
    } catch (error) {
      console.error('Erro ao criar despacho:', error);
      toast.error('Erro ao criar despacho');
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Registrar Despacho
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Conteúdo do formulário de despacho */}
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
                      <Badge variant="outline">
                        {bombona.qr_code}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resto do formulário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="destino">Destino *</Label>
              <Input
                id="destino"
                value={formData.destino}
                onChange={(e) => handleInputChange('destino', e.target.value)}
                placeholder="Nome do cliente ou local"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data_despacho" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data do Despacho *
              </Label>
              <Input
                id="data_despacho"
                type="date"
                value={formData.data_despacho}
                onChange={(e) => handleInputChange('data_despacho', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Endereço de Entrega *
            </Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleInputChange('endereco', e.target.value)}
              placeholder="Endereço completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável *</Label>
            <Input
              id="responsavel"
              value={formData.responsavel}
              onChange={(e) => handleInputChange('responsavel', e.target.value)}
              placeholder="Nome do responsável"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Observações sobre o despacho"
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading || !formData.bombona_id}
              className="flex-1"
            >
              <Truck className="w-4 h-4 mr-2" />
              {loading ? 'Registrando Despacho...' : 'Registrar Despacho'}
            </Button>
            
            {onCancel && (
              <Button 
                type="button" 
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DespachoForm;