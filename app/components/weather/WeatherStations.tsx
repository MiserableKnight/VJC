'use client';

interface WeatherStation {
  id: string;
  name: string;
  code: string;
  url: string;
}

export function WeatherStations() {
  // 定义三个机场的天气站点
  const weatherStations: WeatherStation[] = [
    {
      id: 'hanoi',
      name: '河内',
      code: 'VVNB',
      url: 'https://www.windy.com/airport/VVNB?rain,21.170,105.819,11'
    },
    {
      id: 'hochiminh',
      name: '胡志明',
      code: 'VVTS',
      url: 'https://www.windy.com/airport/VVTS?rain,10.764,106.799,9'
    },
    {
      id: 'condao',
      name: '昆岛',
      code: 'VVCS',
      url: 'https://www.windy.com/zh/-%E8%8F%9C%E5%8D%95/menu?rain,8.990,106.170,8'
    }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {weatherStations.map((station) => (
          <a 
            key={station.id} 
            href={station.url}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-200 rounded-lg p-6 hover:bg-blue-50 transition-colors text-center cursor-pointer"
          >
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-4">🌤️</div>
              <h2 className="text-xl font-semibold text-blue-700">{station.name}</h2>
              <p className="mt-2 text-gray-600">机场代码: {station.code}</p>
              <p className="mt-4 text-sm text-gray-500">点击查看天气</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
} 