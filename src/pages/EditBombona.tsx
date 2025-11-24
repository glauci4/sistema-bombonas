import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { toast } from 'sonner';
import { bombonaService } from '@/services/bombonaService';
import { Bombona, BombonaStatus } from '@/services/types';

const EditBombona = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bombona, setBombona] = useState<Bombona | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    qr_code: '',
    capacity: 50,
    material: 'PEAD',
    type: 'bombona',
    color: '',
    status: 'available' as BombonaStatus
  });

  const loadBombona = useCallback(async () => {
    if (!id) return;
    
    try {
      const bombonaData = await bombonaService.fetchBombonaById(id);
      if (bombonaData) {
        setBombona(bombonaData);
        setFormData({
          name: bombonaData.name,
          qr_code: bombonaData.qr_code,
          capacity: bombonaData.capacity,
          material: bombonaData.material,
          type: bombonaData.type,
          color: bombonaData.color || '',
          status: bombonaData.status
        });
      } else {
        toast.error('Bombona não encontrada');
        navigate('/bombonas');
      }
    } catch (error) {
      console.error('Erro ao carregar bombona:', error);
      toast.error('Erro ao carregar bombona');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadBombona();
  }, [loadBombona]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !bombona) return;

    setSaving(true);
    try {
      const updatedBombona = await bombonaService.updateBombona(id, formData);
      
      if (updatedBombona) {
        toast.success('Bombona atualizada com sucesso!');
        navigate(`/bombonas/details/${id}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar bombona:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  if (!bombona) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Bombona não encontrada</p>
              <Button onClick={() => navigate('/bombonas')}>
                Voltar para Bombonas
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
          
          <h1 className="text-2xl font-bold text-foreground">Editar Bombona</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Editar {bombona.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nome/Identificação</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ex: Bombona 001"
                    required
                  />
                </div>

                {/* Código QR */}
                <div className="space-y-2">
                  <Label htmlFor="qr_code">Código QR</Label>
                  <Input
                    id="qr_code"
                    value={formData.qr_code}
                    onChange={(e) => handleInputChange('qr_code', e.target.value)}
                    placeholder="Ex: QR-2024-001"
                    required
                  />
                </div>

                {/* Capacidade */}
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidade (L)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                    required
                    min="1"
                  />
                </div>

                {/* Material */}
                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Select 
                    value={formData.material} 
                    onValueChange={(value) => handleInputChange('material', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PEAD">PEAD</SelectItem>
                      <SelectItem value="PP">PP</SelectItem>
                      <SelectItem value="PVC">PVC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipo */}
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bombona">Bombona</SelectItem>
                      <SelectItem value="container">Container</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cor */}
                <div className="space-y-2">
                  <Label htmlFor="color">Cor</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    placeholder="Ex: Azul"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: BombonaStatus) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponível</SelectItem>
                      <SelectItem value="in_use">Em Uso</SelectItem>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                      <SelectItem value="washing">Lavagem</SelectItem>
                      <SelectItem value="lost">Extraviada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EditBombona;