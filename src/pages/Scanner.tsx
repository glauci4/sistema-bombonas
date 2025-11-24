import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Camera, Search, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface BombonaInfo {
  id: string;
  name: string;
  qr_code: string;
  capacity: number;
  material: string;
  status: string;
  current_product: string | null;
  location_address: string | null;
  total_cycles: number;
}

const Scanner = () => {
  const [qrCode, setQrCode] = useState('');
  const [bombona, setBombona] = useState<BombonaInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanning = async () => {
    try {
      setCameraError(null);
      
      // Parar scanner anterior se existir
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Solicitar acesso à câmera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment'
        } 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setScanning(true);
        toast.success('Câmera ativada! Aponte para o QR Code');
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      
      let errorMessage = 'Erro ao acessar a câmera';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Permissão da câmera negada. Clique no ícone de cadeado e permita a câmera.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'Nenhuma câmera encontrada no dispositivo.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setCameraError(errorMessage);
      toast.error('Falha ao acessar câmera');
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setScanning(false);
    setCameraError(null);
  };

  const handleSearch = async (code?: string) => {
    const searchCode = code || qrCode;
    if (!searchCode.trim()) {
      toast.error('Digite um código QR');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bombonas')
        .select('*')
        .eq('qr_code', searchCode.trim())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setBombona(data);
        toast.success('Bombona encontrada!');
      } else {
        toast.error('Bombona não encontrada');
        setBombona(null);
      }
    } catch (error) {
      console.error('Erro ao buscar bombona:', error);
      toast.error('Erro ao buscar bombona');
      setBombona(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: 'Disponível',
      in_use: 'Em Uso',
      maintenance: 'Manutenção',
      washing: 'Lavagem'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      available: 'default',
      in_use: 'secondary',
      maintenance: 'destructive',
      washing: 'outline'
    };
    return colors[status] || 'default';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <QrCode className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Scanner QR Code</h1>
            <p className="text-muted-foreground">Escaneie ou digite o código QR para rastrear a bombona</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Buscar Bombona</CardTitle>
              <CardDescription>Digite o código QR da bombona</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-code">Código QR</Label>
                <div className="flex gap-2">
                  <Input
                    id="qr-code"
                    placeholder="Ex: QR-2024-001"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={() => handleSearch()} disabled={loading}>
                    <Search className="w-4 h-4 mr-2" />
                    {loading ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              {cameraError && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
                  <p className="font-medium">{cameraError}</p>
                </div>
              )}

              {!scanning ? (
                <Button 
                  className="w-full" 
                  onClick={startScanning}
                  variant="outline"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Escanear com Câmera
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="relative border-2 border-primary rounded-lg overflow-hidden bg-black">
                    <video 
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 border-2 border-white rounded-lg opacity-60"></div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      onClick={() => {
                        // Simular leitura de QR code
                        const simulatedCode = `QR-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
                        setQrCode(simulatedCode);
                        handleSearch(simulatedCode);
                      }}
                      variant="secondary"
                    >
                      Simular QR Code
                    </Button>
                    
                    <Button 
                      className="flex-1" 
                      onClick={stopScanning}
                      variant="destructive"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Parar Scanner
                    </Button>
                  </div>
                  
                  <p className="text-sm text-center text-muted-foreground">
                    Aponte a câmera para o código QR da bombona
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {bombona && (
            <Card className="animate-in fade-in duration-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{bombona.name}</CardTitle>
                    <CardDescription>Código: {bombona.qr_code}</CardDescription>
                  </div>
                  <Badge variant={getStatusColor(bombona.status)}>
                    {getStatusLabel(bombona.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Capacidade</p>
                    <p className="text-lg font-semibold">{bombona.capacity}L</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Material</p>
                    <p className="text-lg font-semibold">{bombona.material}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Ciclos</p>
                    <p className="text-lg font-semibold">{bombona.total_cycles || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Produto Atual</p>
                    <p className="text-lg font-semibold">{bombona.current_product || 'Nenhum'}</p>
                  </div>
                </div>

                {bombona.location_address && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Localização</p>
                    <p className="text-sm">{bombona.location_address}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Scanner;