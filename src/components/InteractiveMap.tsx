import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MapLocation {
  id: string;
  name: string;
  status: string;
  location_lat: number;
  location_lng: number;
  location_address?: string;
}

interface InteractiveMapProps {
  locations: MapLocation[];
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ locations }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenSaved, setTokenSaved] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapboxToken(savedToken);
      setTokenSaved(true);
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !tokenSaved || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-46.6333, -23.5505], // São Paulo default
        zoom: 10,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add markers for each location
      locations.forEach((location) => {
        if (location.location_lat && location.location_lng) {
          const statusColors: Record<string, string> = {
            available: '#22c55e',
            in_use: '#3b82f6',
            maintenance: '#ef4444',
            washing: '#f59e0b'
          };

          const color = statusColors[location.status] || '#6b7280';

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="p-2">
              <h3 class="font-bold">${location.name}</h3>
              <p class="text-sm">${location.location_address || 'Endereço não informado'}</p>
              <p class="text-xs text-muted-foreground mt-1">Status: ${location.status}</p>
            </div>`
          );

          new mapboxgl.Marker({ color })
            .setLngLat([location.location_lng, location.location_lat])
            .setPopup(popup)
            .addTo(map.current!);
        }
      });

      // Fit bounds to show all markers
      if (locations.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        locations.forEach((loc) => {
          if (loc.location_lat && loc.location_lng) {
            bounds.extend([loc.location_lng, loc.location_lat]);
          }
        });
        map.current.fitBounds(bounds, { padding: 50 });
      }
    } catch (error) {
      console.error('Erro ao inicializar mapa:', error);
      toast.error('Erro ao carregar mapa. Verifique o token Mapbox.');
    }

    return () => {
      map.current?.remove();
    };
  }, [locations, tokenSaved, mapboxToken]);

  const handleSaveToken = () => {
    if (!mapboxToken.trim()) {
      toast.error('Digite um token válido');
      return;
    }
    localStorage.setItem('mapbox_token', mapboxToken);
    setTokenSaved(true);
    toast.success('Token salvo! Mapa carregando...');
  };

  if (!tokenSaved) {
    return (
      <Card className="shadow-card-eco h-[600px] flex items-center justify-center">
        <CardContent className="max-w-md p-8">
          <h3 className="text-lg font-semibold mb-4">Configure o Mapbox</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Para usar o mapa interativo, você precisa de um token do Mapbox.
            <a 
              href="https://account.mapbox.com/access-tokens/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline ml-1"
            >
              Obtenha seu token aqui
            </a>
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="mapbox-token">Token Mapbox</Label>
              <Input
                id="mapbox-token"
                type="password"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                placeholder="pk.eyJ1..."
              />
            </div>
            <Button onClick={handleSaveToken} className="w-full">
              Salvar e Carregar Mapa
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-card-eco">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default InteractiveMap;
