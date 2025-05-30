import React, { useState, useEffect } from 'react';
import { getSIGINTData, getTECHINTData, getQDSP9Status, SIGINTData, TECHINTData, QDSP9Status } from '../services/intelligenceApi';
import DataCard from '../components/DataCard';

const Intelligence: React.FC = () => {
  const [sigintData, setSigintData] = useState<SIGINTData[]>([]);
  const [techintData, setTechintData] = useState<TECHINTData[]>([]);
  const [qdsp9Status, setQdsp9Status] = useState<QDSP9Status | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sigint, techint, qdsp9] = await Promise.all([
          getSIGINTData(),
          getTECHINTData(),
          getQDSP9Status()
        ]);
        
        setSigintData(sigint);
        setTechintData(techint);
        setQdsp9Status(qdsp9);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching intelligence data:', err);
        setError('Ошибка при загрузке данных разведки');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Стратегическая разведка</h1>
      
      {/* QDSP-9 Status */}
      {qdsp9Status && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Статус протокола QDSP-9</h2>
          <div className="bg-gray-800 text-white p-4 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400">Статус:</p>
                <p className="text-lg font-medium">{qdsp9Status.status}</p>
              </div>
              <div>
                <p className="text-gray-400">Уровень шифрования:</p>
                <p className="text-lg font-medium">{qdsp9Status.encryption_level}</p>
              </div>
              <div>
                <p className="text-gray-400">Ротация ключей:</p>
                <p className="text-lg font-medium">{qdsp9Status.key_rotation}</p>
              </div>
              <div>
                <p className="text-gray-400">Защищенные каналы:</p>
                <p className="text-lg font-medium">{qdsp9Status.protected_channels}</p>
              </div>
              <div>
                <p className="text-gray-400">Квантовая энтропия:</p>
                <p className="text-lg font-medium">{qdsp9Status.quantum_entropy}</p>
              </div>
              <div>
                <p className="text-gray-400">Избегание обнаружения:</p>
                <p className="text-lg font-medium">{qdsp9Status.detection_avoidance}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* SIGINT Data */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Радиоэлектронная разведка (SIGINT)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sigintData.map((item) => (
            <DataCard 
              key={item.id} 
              title={`${item.type} - ${item.frequency}`}
              value={item.status}
              variant="primary"
            >
              <div className="space-y-2 mt-3">
                <p><span className="font-medium">Статус:</span> {item.status}</p>
                <p><span className="font-medium">Шифрование:</span> {item.encryption}</p>
                <p><span className="font-medium">Оператор:</span> {item.metadata.operator}</p>
                <p><span className="font-medium">Сила сигнала:</span> {item.metadata.signal_strength * 100}%</p>
                <p><span className="font-medium">Полоса:</span> {item.metadata.bandwidth}</p>
                <p><span className="font-medium">Координаты:</span> {item.location.lat.toFixed(4)}, {item.location.lng.toFixed(4)}</p>
                <p><span className="font-medium">Время перехвата:</span> {new Date(item.intercept_time).toLocaleString()}</p>
              </div>
            </DataCard>
          ))}
        </div>
      </div>
      
      {/* TECHINT Data */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Техническая разведка (TECHINT)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {techintData.map((item) => (
            <DataCard 
              key={item.id} 
              title={item.type}
              value={item.status}
              variant="warning"
            >
              <div className="space-y-2 mt-3">
                <p><span className="font-medium">Статус:</span> {item.status}</p>
                {item.frequency && <p><span className="font-medium">Частота:</span> {item.frequency}</p>}
                {item.frequency_range && <p><span className="font-medium">Диапазон частот:</span> {item.frequency_range}</p>}
                {item.target_network && <p><span className="font-medium">Целевая сеть:</span> {item.target_network}</p>}
                {item.detection_range && <p><span className="font-medium">Дальность обнаружения:</span> {item.detection_range}</p>}
                {item.protocol && <p><span className="font-medium">Протокол:</span> {item.protocol}</p>}
                {item.range && <p><span className="font-medium">Дальность:</span> {item.range}</p>}
                <p><span className="font-medium">Координаты:</span> {item.location.lat.toFixed(4)}, {item.location.lng.toFixed(4)}</p>
                <p><span className="font-medium">Последнее обновление:</span> {new Date(item.last_update).toLocaleString()}</p>
                
                {/* Display metadata based on type */}
                {item.type === 'Radar' && (
                  <>
                    <p><span className="font-medium">Тип радара:</span> {item.metadata.radar_type}</p>
                    <p><span className="font-medium">Стелс-возможности:</span> {item.metadata.stealth_capability ? 'Да' : 'Нет'}</p>
                    <p><span className="font-medium">Выходная мощность:</span> {item.metadata.power_output}</p>
                  </>
                )}
                
                {item.type === 'DPI' && (
                  <>
                    <p><span className="font-medium">Обход шифрования:</span> {item.metadata.encryption_bypass}</p>
                    <p><span className="font-medium">Скорость захвата данных:</span> {item.metadata.data_capture_rate * 100}%</p>
                    <p><span className="font-medium">Уровень скрытности:</span> {item.metadata.stealth_level}</p>
                  </>
                )}
                
                {item.type === 'Jamming' && (
                  <>
                    <p><span className="font-medium">Тип подавления:</span> {item.metadata.jamming_type}</p>
                    <p><span className="font-medium">Выходная мощность:</span> {item.metadata.power_output}</p>
                    <p><span className="font-medium">Целевые системы:</span> {item.metadata.target_systems.join(', ')}</p>
                  </>
                )}
              </div>
            </DataCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Intelligence;
