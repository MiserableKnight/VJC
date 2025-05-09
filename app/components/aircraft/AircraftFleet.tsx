'use client';

import { useQuery, gql } from '@apollo/client';

// GraphQL查询
const GET_ALL_AIRCRAFT = gql`
  query GetAllAircraft {
    getAllAircraft {
      id
      registration
      msn
    }
  }
`;

interface Aircraft {
  id: string;
  registration: string;
  msn: string;
}

export function AircraftFleet() {
  const { loading, error, data } = useQuery(GET_ALL_AIRCRAFT);
  
  if (loading) return (
    <div className="w-full flex justify-center items-center p-10">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
      <p className="font-bold">获取数据出错</p>
      <p className="text-sm">{error.message}</p>
    </div>
  );
  
  const aircraft: Aircraft[] = data?.getAllAircraft || [];
  
  // 构建Flightradar24链接
  const getFlightradarUrl = (registration: string) => {
    // 确保注册号格式正确，移除可能的空格并转为小写
    const formattedReg = registration.trim().toLowerCase();
    return `https://www.flightradar24.com/data/aircraft/${formattedReg}`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {aircraft.length === 0 ? (
        <p className="text-center text-gray-500 py-10">未找到飞机数据</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {aircraft.map((plane) => (
            <a 
              key={plane.id} 
              href={getFlightradarUrl(plane.registration)}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 transition-colors text-center cursor-pointer"
            >
              <p className="text-lg font-semibold text-blue-700">
                {plane.registration} ({plane.msn})
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
} 