import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Navigation } from 'lucide-react';
import { trackingService } from '@/services/trackingService';
import { toast } from 'sonner';

interface UpdateLocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bombonaId: string;
  bombonaName: string;
  onLocationUpdated: () => void;
}

interface GeoapifyFeature {
  properties: {
    formatted: string;
    name?: string;
    street?: string;
    housenumber?: string;
    suburb?: string;
    district?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    address_line1?: string;
    address_line2?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface GeoapifyResponse {
  features: GeoapifyFeature[];
}

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

const UpdateLocationModal = ({ 
  open, 
  onOpenChange, 
  bombonaId, 
  bombonaName, 
  onLocationUpdated 
}: UpdateLocationModalProps) => {
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [searchingCep, setSearchingCep] = useState(false);
  
  const [formData, setFormData] = useState({
    street: "",
    number: "",
    district: "",
    city: "Cianorte",
    state: "PR",
    postcode: "",
    notes: ""
  });

  const GEOAPIFY_API_KEY = "61e2e8990d54410a9b253ac8372db854";

  // ✅ FUNÇÃO PARA MONTAR ENDEREÇO FINAL
  const buildFullAddress = () => {
    const parts = [];

    if (formData.street) parts.push(formData.street);
    if (formData.number) parts.push(`Nº ${formData.number}`);
    if (formData.district) parts.push(formData.district);
    if (formData.city) parts.push(formData.city);
    if (formData.state) parts.push(formData.state);
    if (formData.postcode) parts.push(formData.postcode);

    return parts.join(", ");
  };

  // ✅ BUSCA AUTOMÁTICA POR CEP (VIA CEP) - CORRIGIDA
  const handleCepSearch = async () => {
    const cep = formData.postcode.replace(/\D/g, '');
    
    if (cep.length !== 8) {
      toast.error('CEP deve conter 8 dígitos');
      return;
    }

    setSearchingCep(true);
    try {
      toast.info('Buscando endereço pelo CEP...');
      
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro na rede');
      }
      
      const data: ViaCepResponse = await response.json();

      if (data.erro || !data.logradouro) {
        toast.error('CEP não encontrado. Digite o endereço manualmente.');
        return;
      }

      // ✅ PREENCHER CAMPOS COM DADOS DO CEP
      setFormData(prev => ({
        ...prev,
        street: data.logradouro || prev.street,
        district: data.bairro || prev.district,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
        postcode: data.cep // Usa o CEP formatado da API
      }));

      toast.success('Endereço encontrado pelo CEP!');

    } catch (error) {
      console.error('❌ Erro na busca por CEP:', error);
      toast.error('Erro ao buscar CEP. Tente novamente.');
    } finally {
      setSearchingCep(false);
    }
  };

  // ✅ FUNÇÃO PARA OBTER COORDENADAS DO ENDEREÇO (GEOCODING DIRETO)
  const getCoordinatesFromAddress = async (address: string): Promise<{lat: number, lng: number}> => {
    try {
      const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${GEOAPIFY_API_KEY}&format=json&limit=1&filter=countrycode:br&lang=pt`;
      
      console.log('🔍 Buscando coordenadas para:', address);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data: GeoapifyResponse = await response.json();
      console.log('📨 Resposta da busca por endereço:', data);

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        console.log('✅ Coordenadas encontradas:', { lat, lng });
        return { lat, lng };
      }

      throw new Error('Endereço não encontrado.');
      
    } catch (error) {
      console.error('❌ Erro na busca por coordenadas:', error);
      throw error;
    }
  };

  // ✅ USAR LOCALIZAÇÃO ATUAL - CORRIGIDA E SIMPLIFICADA
  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não é suportada pelo seu navegador');
      return;
    }

    setGettingLocation(true);

    try {
      toast.info('Obtendo sua localização...');

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      console.log('📍 Coordenadas obtidas:', { lat, lng });

      // ✅ BUSCAR ENDEREÇO VIA GEOCODING REVERSO
      const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_API_KEY}&format=json&type=street&limit=1&lang=pt`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar endereço');
      }

      const data: GeoapifyResponse = await response.json();
      console.log('📨 Resposta Geoapify Reverse:', data);

      if (data.features && data.features.length > 0) {
        const props = data.features[0].properties;

        // ✅ PREENCHER OS CAMPOS
        setFormData(prev => ({
          ...prev,
          street: props.street || "Rua Tapajós",
          number: props.housenumber || "",
          district: props.suburb || props.district || "Zona 03",
          city: props.city || "Cianorte",
          state: props.state || "PR",
          postcode: props.postcode || ""
        }));

        toast.success('Localização obtida com sucesso!');
      } else {
        toast.warning('Endereço não encontrado. Complete manualmente.');
      }

    } catch (error) {
      console.error('❌ Erro na geolocalização:', error);
      
      let errorMessage = 'Erro ao obter localização';
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada. Permita o acesso ao GPS.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível. Verifique se o GPS está ativado.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tempo de espera excedido. Tente novamente em área aberta.';
            break;
        }
      } else if (error instanceof Error) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setGettingLocation(false);
    }
  };

  // ✅ SALVAR LOCALIZAÇÃO
  const handleUpdateLocation = async () => {
    if (!formData.street || !formData.number || !formData.district || !formData.city || !formData.state || !formData.notes) {
      toast.error('Preencha todos os campos obrigatórios (*)');
      return;
    }

    setLoading(true);
    try {
      const finalAddress = buildFullAddress();
      console.log('🔍 Obtendo coordenadas para o endereço:', finalAddress);
      
      const { lat, lng } = await getCoordinatesFromAddress(finalAddress);
      
      console.log('💾 Salvando localização:', {
        bombonaId,
        coordenadas: { lat, lng },
        endereço: finalAddress
      });

      await trackingService.updateBombonaLocation(
        bombonaId,
        lat,
        lng,
        finalAddress
      );

      await trackingService.registerLocationHistory(
        bombonaId,
        lat,
        lng,
        finalAddress,
        formData.notes
      );

      toast.success('Localização atualizada com sucesso!');
      handleClose();
      onLocationUpdated();
    } catch (error) {
      console.error('❌ Erro ao atualizar localização:', error);
      toast.error('Erro ao atualizar localização. Verifique o endereço.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData({
      street: "",
      number: "",
      district: "",
      city: "Cianorte",
      state: "PR",
      postcode: "",
      notes: ""
    });
    setGettingLocation(false);
    setSearchingCep(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-xl max-w-2xl">
        {/* ✅ HEADER SIMPLIFICADO - SEM X DUPLICADO */}
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MapPin className="w-5 h-5 text-green-600" />
            Atualizar Localização - {bombonaName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* ✅ ENDEREÇO SEPARADO */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Endereço Completo *</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="md:col-span-2">
                <Label htmlFor="street">Rua *</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={e => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Ex: Rua Tapajós"
                  required
                />
              </div>

              <div>
                <Label htmlFor="number">Número *</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={e => setFormData({ ...formData, number: e.target.value })}
                  placeholder="Ex: 123"
                  required
                />
              </div>

              <div>
                <Label htmlFor="district">Bairro *</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  placeholder="Ex: Zona 03"
                  required
                />
              </div>

              <div>
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Ex: Cianorte"
                  required
                />
              </div>

              <div>
                <Label htmlFor="state">Estado *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Ex: PR"
                  required
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="postcode">CEP (opcional)</Label>
                  <Input
                    id="postcode"
                    value={formData.postcode}
                    onChange={e => setFormData({ ...formData, postcode: e.target.value })}
                    placeholder="87200-000"
                    onBlur={handleCepSearch}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleCepSearch}
                  disabled={searchingCep || !formData.postcode}
                  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  {searchingCep ? '...' : 'Buscar'}
                </Button>
              </div>

            </div>

            <p className="text-xs text-muted-foreground">
              Endereço montado: <strong>{buildFullAddress() || "Preencha os campos acima"}</strong>
            </p>
          </div>

          {/* Botão Localização Atual */}
          <div className="space-y-2">
            <Button 
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={gettingLocation || loading}
              className="w-full flex items-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white"
            >
              <Navigation className="w-4 h-4" />
              {gettingLocation ? 'Obtendo localização...' : 'Usar Minha Localização Atual'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Clique para obter sua localização atual automaticamente
            </p>
          </div>

          {/* ✅ OBSERVAÇÕES E REFERÊNCIAS SIMPLES */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-base font-medium">
              Pontos de Referência e Observações *
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Perto da rodoviária, em frente ao colégio municipal, em frente ao parquinho"
              rows={3}
              className="w-full resize-none"
              required
            />
            
            <p className="text-xs text-muted-foreground">
              Descreva pontos de referência para facilitar a localização
            </p>
          </div>

          {/* Botão Atualizar */}
          <Button 
            onClick={handleUpdateLocation} 
            disabled={loading || !formData.street || !formData.number || !formData.district || !formData.city || !formData.state || !formData.notes}
            className="w-full py-3 text-base bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <MapPin className="w-4 h-4 mr-2" />
            {loading ? 'Atualizando...' : 'Salvar Localização'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateLocationModal;