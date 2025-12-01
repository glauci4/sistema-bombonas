import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, ArrowLeft } from 'lucide-react';
import { trackingService } from '@/services/trackingService';
import { toast } from 'sonner';

interface LocationUpdaterProps {
  bombonaId: string;
  bombonaName: string;
  onLocationUpdated: () => void;
  onBack: () => void;
}

const LocationUpdater = ({ bombonaId, bombonaName, onLocationUpdated, onBack }: LocationUpdaterProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    latitude: '',
    longitude: '',
    notes: ''
  });

  const handleUpdateLocation = async () => {
    if (!formData.address || !formData.latitude || !formData.longitude) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Latitude e longitude devem ser números válidos');
      return;
    }

    setLoading(true);
    try {
      // Atualizar localização atual da bombona
      await trackingService.updateBombonaLocation(
        bombonaId,
        lat,
        lng,
        formData.address
      );

      // Registrar no histórico
      await trackingService.registerLocationHistory(
        bombonaId,
        lat,
        lng,
        formData.address,
        formData.notes
      );

      toast.success('Localização atualizada com sucesso!');
      setFormData({ address: '', latitude: '', longitude: '', notes: '' });
      onLocationUpdated();
    } catch (error) {
      console.error('Erro ao atualizar localização:', error);
      toast.error('Erro ao atualizar localização');
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não é suportada pelo seu navegador');
      return;
    }

    toast.info('Obtendo localização atual...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setFormData(prev => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString()
        }));
        
        toast.success('Localização obtida com sucesso!');
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        toast.error('Erro ao obter localização: ' + error.message);
      }
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Botão Voltar */}
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-4 flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <MapPin className="w-5 h-5" />
            Atualizar Localização - {bombonaName}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Endereço */}
          <div className="space-y-3">
            <Label htmlFor="address" className="text-base font-medium">
              Endereço *
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Endereço completo (rua, número, cidade, estado)"
              className="w-full"
              required
            />
          </div>

          {/* Coordenadas */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-3">
              <Label htmlFor="latitude" className="text-base font-medium">
                Latitude *
              </Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                placeholder="Ex: -23.5505"
                className="w-full"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="longitude" className="text-base font-medium">
                Longitude *
              </Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                placeholder="Ex: -46.6333"
                className="w-full"
                required
              />
            </div>
          </div>

          {/* Botão Localização Atual */}
          <Button 
            type="button"
            onClick={handleUseCurrentLocation}
            variant="outline"
            className="w-full flex items-center gap-2 py-3"
          >
            <Navigation className="w-4 h-4" />
            Usar Minha Localização Atual
          </Button>

          {/* Observações */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-base font-medium">
              Observações
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Observações sobre a localização (opcional)"
              rows={3}
              className="w-full resize-none"
            />
          </div>

          {/* Botão Atualizar */}
          <Button 
            onClick={handleUpdateLocation} 
            disabled={loading}
            className="w-full py-3 text-base"
            size="lg"
          >
            <MapPin className="w-4 h-4 mr-2" />
            {loading ? 'Atualizando...' : 'Atualizar Localização'}
          </Button>

          {/* Texto de ajuda */}
          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              * Campos obrigatórios. A localização será visível no mapa.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationUpdater;