import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

// CSS do Leaflet
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corrigir ícones do Leaflet (problema comum em React)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      // Inicializa o mapa com OpenStreetMap
      map.current = L.map(mapContainer.current).setView([-23.5505, -46.6333], 10);

      // Adiciona camada do OpenStreetMap (SEMPRE gratuita)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map.current);

      // Adiciona controles de zoom
      L.control.zoom({ position: 'topright' }).addTo(map.current);

      // Adiciona marcadores
      addMarkersToMap();

    } catch (error) {
      console.error('Erro ao inicializar mapa:', error);
      toast.error('Erro ao carregar mapa.');
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const addMarkersToMap = () => {
    if (!map.current) return;

    // Limpa marcadores anteriores
    markers.current.forEach(marker => {
      map.current!.removeLayer(marker);
    });
    markers.current = [];

    const statusColors: Record<string, string> = {
      available: '#22c55e',
      in_use: '#3b82f6',
      maintenance: '#ef4444',
      washing: '#f59e0b'
    };

    const group = new L.FeatureGroup();

    // Adiciona marcadores para cada localização
    locations.forEach((location) => {
      if (location.location_lat && location.location_lng) {
        const color = statusColors[location.status] || '#6b7280';

        // Cria ícone personalizado
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${color};
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              cursor: pointer;
            "></div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.marker([location.location_lat, location.location_lng], {
          icon: customIcon
        }).addTo(map.current!);

        // Popup com informações
        marker.bindPopup(`
          <div class="p-2 min-w-[200px]">
            <h3 class="font-bold text-sm">${location.name}</h3>
            <p class="text-xs text-gray-600 mt-1">${location.location_address || 'Endereço não informado'}</p>
            <p class="text-xs text-gray-500 mt-1">
              Status: <span style="color: ${color}">${location.status}</span>
            </p>
            <p class="text-xs text-gray-400 mt-2">
              Lat: ${location.location_lat.toFixed(4)}, Lng: ${location.location_lng.toFixed(4)}
            </p>
          </div>
        `);

        markers.current.push(marker);
        group.addLayer(marker);
      }
    });

    // Ajusta o zoom para mostrar todos os marcadores
    if (group.getLayers().length > 0) {
      map.current.fitBounds(group.getBounds(), { 
        padding: [20, 20],
        maxZoom: 15 
      });
    }
  };

  // Atualiza marcadores quando locations mudar
  useEffect(() => {
    if (map.current) {
      addMarkersToMap();
    }
  }, [locations]);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-card-eco">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default InteractiveMap;