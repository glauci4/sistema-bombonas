import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Bombona, NewDespacho } from '@/services/types';
import { bombonaService } from '@/services/bombonaService';
import { despachoService } from '@/services/despachoService';

interface DespachoFormProps {
  bombona?: Bombona;
  onDespachoCreated: () => void;
  onCancel?: () => void;
}

const DespachoForm = ({ bombona, onDespachoCreated, onCancel }: DespachoFormProps) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<NewDespacho>({
    bombona_id: bombona?.id || '',
    destino: '',
    endereco: '',
    data_despacho: new Date().toISOString().split('T')[0],
    responsavel: '',
    observacoes: '',
  });

  useEffect(() => {
    if (bombona) {
      setFormData(prev => ({
        ...prev,
        bombona_id: bombona.id
      }));
    }
  }, [bombona]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bombona_id) {
      toast.error('Selecione uma bombona');
      return;
    }

    setLoading(true);
    try {
     
      await despachoService.createDespacho(formData);
      
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
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {bombona && (
              <div className="p-3 bg-muted/20 rounded-lg mb-4">
                <p className="font-semibold">Bombona: {bombona.name}</p>
                <p className="text-sm text-muted-foreground">QR: {bombona.qr_code}</p>
                <p className="text-sm text-muted-foreground">Status atual: {
                  bombona.status === 'available' ? 'Disponível' :
                  bombona.status === 'in_use' ? 'Em Uso' :
                  bombona.status === 'maintenance' ? 'Manutenção' :
                  bombona.status === 'washing' ? 'Lavagem' : 'Extraviada'
                }</p>
              </div>
            )}

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
              <Label htmlFor="endereco">Endereço de Entrega *</Label>
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
                value={formData.observacoes || ''}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Observações sobre o despacho"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 flex items-center gap-2"
              >
                <Truck className="w-4 h-4" />
                {loading ? 'Registrando...' : 'Registrar Despacho'}
              </Button>
              
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DespachoForm;