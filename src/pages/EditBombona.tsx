import { useState, useEffect } from 'react'; // REMOVIDO: useCallback
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

  useEffect(() => {
    const loadBombona = async () => {
      if (!id) {
        toast.error('ID não fornecido');
        navigate('/bombonas');
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Buscando bombona com ID:', id);
        
        const bombonaData = await bombonaService.fetchBombonaById(id);
        console.log('📦 Dados recebidos:', bombonaData);
        
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
          console.log('✅ Formulário preenchido com sucesso');
        } else {
          console.error('❌ Bombona não encontrada');
          toast.error('Bombona não encontrada');
          navigate('/bombonas');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar bombona:', error);
        toast.error('Erro ao carregar dados da bombona');
        navigate('/bombonas');
      } finally {
        setLoading(false);
      }
    };

    console.log('🎯 Iniciando componente EditBombona');
    loadBombona();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) {
      toast.error('ID não encontrado');
      return;
    }

    // Validação básica dos campos obrigatórios
    if (!formData.name.trim() || !formData.qr_code.trim()) {
      toast.error('Nome e Código QR são obrigatórios');
      return;
    }

    setSaving(true);
    try {
      console.log('💾 Salvando alterações...', formData);
      const updatedBombona = await bombonaService.updateBombona(id, formData);
      
      if (updatedBombona) {
        toast.success('Bombona atualizada com sucesso!');
        navigate('/bombonas');
      } else {
        throw new Error('Nenhum dado retornado');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar bombona:', error);
      toast.error('Erro ao atualizar bombona');
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

  const handleGoBack = () => {
    navigate('/bombonas');
  };

  // Tela de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Carregando bombona...</h2>
            <p className="text-muted-foreground">Aguarde enquanto buscamos os dados</p>
          </div>
        </div>
      </div>
    );
  }

  // Se não encontrou a bombona
  if (!bombona) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <Package className="w-20 h-20 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Bombona não encontrada</h2>
            <p className="text-muted-foreground mb-6">
              A bombona que você está tentando editar não foi encontrada.
            </p>
            <Button onClick={handleGoBack} size="lg">
              Voltar para a lista de bombonas
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Página principal
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Cabeçalho */}
        <div className="max-w-4xl mx-auto mb-8">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Bombonas
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Editar Bombona</h1>
            <p className="text-muted-foreground text-lg">
              Editando: <span className="font-semibold text-foreground">{bombona.name}</span>
            </p>
          </div>
        </div>

        {/* Formulário */}
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                <Package className="w-6 h-6" />
                Editar {bombona.name}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nome */}
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-base font-medium">
                      Nome/Identificação *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Ex: Bombona 001"
                      required
                      className="h-12 text-base"
                    />
                  </div>

                  {/* Código QR */}
                  <div className="space-y-3">
                    <Label htmlFor="qr_code" className="text-base font-medium">
                      Código QR *
                    </Label>
                    <Input
                      id="qr_code"
                      value={formData.qr_code}
                      onChange={(e) => handleInputChange('qr_code', e.target.value)}
                      placeholder="Ex: QR-2024-001"
                      required
                      className="h-12 text-base"
                    />
                  </div>

                  {/* Capacidade */}
                  <div className="space-y-3">
                    <Label htmlFor="capacity" className="text-base font-medium">
                      Capacidade (L) *
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                      required
                      min="1"
                      className="h-12 text-base"
                    />
                  </div>

                  {/* Material */}
                  <div className="space-y-3">
                    <Label htmlFor="material" className="text-base font-medium">
                      Material *
                    </Label>
                    <Select 
                      value={formData.material} 
                      onValueChange={(value) => handleInputChange('material', value)}
                    >
                      <SelectTrigger className="h-12 text-base">
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
                  <div className="space-y-3">
                    <Label htmlFor="type" className="text-base font-medium">
                      Tipo *
                    </Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => handleInputChange('type', value)}
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bombona">Bombona</SelectItem>
                        <SelectItem value="container">Container</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cor */}
                  <div className="space-y-3">
                    <Label htmlFor="color" className="text-base font-medium">
                      Cor
                    </Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      placeholder="Ex: Azul"
                      className="h-12 text-base"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-3 md:col-span-2">
                    <Label htmlFor="status" className="text-base font-medium">
                      Status *
                    </Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value: BombonaStatus) => handleInputChange('status', value)}
                    >
                      <SelectTrigger className="h-12 text-base">
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

                {/* Botões de ação */}
                <div className="flex gap-4 pt-8 border-t">
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="flex-1 h-12 text-base font-medium"
                    size="lg"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleGoBack}
                    className="flex-1 h-12 text-base font-medium"
                    size="lg"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default EditBombona;