'use client';

import { useQuery, gql } from '@apollo/client';
import { useResponsive } from '../../hooks/useResponsive';
import { useState } from 'react';

// GraphQL查询
const GET_AIRCRAFT_FAILURES = gql`
  query GetAllAircraftFailures {
    getAllAircraftFailures {
      id
      severity
      date_reported
      registration
      msn
      ata
      failure_description
      resolution_measures
      is_aog
      is_sdr
      operation_impact
      is_396
      notes
    }
  }
`;

interface AircraftFailure {
  id: string;
  severity: string;
  date_reported: string;
  registration: string;
  msn: string;
  ata: string;
  failure_description: string;
  resolution_measures: string;
  is_aog: boolean;
  is_sdr: boolean;
  operation_impact: string;
  is_396: boolean;
  notes?: string;
}

// 根据故障严重性获取样式
const getSeverityStyles = (severity: string) => {
  // 将severity转换为数字
  const severityLevel = parseInt(severity, 10);
  
  switch (severityLevel) {
    case 2:
      return 'bg-yellow-500'; // 故障级别2为黄色
    case 1:
    default:
      return 'bg-green-500'; // 故障级别1为绿色
  }
};

// 根据是否AOG获取样式
const getAogStyles = (isAog: boolean) => {
  return isAog 
    ? 'bg-red-100 text-red-800' 
    : 'bg-green-100 text-green-800';
};

export function AircraftFailure() {
  const { isMobile } = useResponsive();
  const { loading, error, data, refetch } = useQuery(GET_AIRCRAFT_FAILURES);
  const [isSimplified, setIsSimplified] = useState(true);
  
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
  
  const failures: AircraftFailure[] = data?.getAllAircraftFailures || [];
  
  // 按MSN分组故障数据
  const groupedFailures = failures.reduce((acc: Record<string, AircraftFailure[]>, failure) => {
    if (!acc[failure.msn]) {
      acc[failure.msn] = [];
    }
    acc[failure.msn].push(failure);
    return acc;
  }, {});

  // 切换简化/完整信息显示模式
  const toggleInfoMode = () => {
    setIsSimplified(!isSimplified);
  };
  
  // 移动端表格
  const renderMobileTable = (failuresList: AircraftFailure[]) => (
    <table className="min-w-full divide-y divide-gray-200 table-fixed">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">日期</th>
          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">ATA章节</th>
          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[35%]">故障描述</th>
          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">处置措施</th>
          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">是否AOG</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {failuresList.map((failure) => (
          <tr key={failure.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">{failure.date_reported}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-center">{failure.ata}</td>
            <td className="px-4 py-3 text-sm text-gray-700">{failure.failure_description}</td>
            <td className="px-4 py-3 text-sm text-gray-700">{failure.resolution_measures}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
              <span className={`px-2 py-1 rounded-full text-xs ${getAogStyles(failure.is_aog)}`}>
                {failure.is_aog ? '是' : '否'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  
  // 简化的桌面端表格
  const renderSimplifiedDesktopTable = (failuresList: AircraftFailure[]) => (
    <table className="min-w-full divide-y divide-gray-200 table-fixed">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">日期</th>
          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[35%]">故障描述</th>
          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[35%]">处置措施</th>
          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">是否AOG</th>
          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">备注</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {failuresList.map((failure) => (
          <tr key={failure.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">{failure.date_reported}</td>
            <td className="px-4 py-3 text-sm text-gray-700">{failure.failure_description}</td>
            <td className="px-4 py-3 text-sm text-gray-700">{failure.resolution_measures}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
              <span className={`px-2 py-1 rounded-full text-xs ${getAogStyles(failure.is_aog)}`}>
                {failure.is_aog ? '是' : '否'}
              </span>
            </td>
            <td className="px-4 py-3 text-sm text-gray-500 text-center">{failure.notes || 'N/A'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  
  // 完整的桌面端表格
  const renderDesktopTable = (failuresList: AircraftFailure[]) => (
    <table className="min-w-full divide-y divide-gray-200 table-fixed">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">日期</th>
          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[6%]">ATA章节</th>
          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[22.5%]">故障描述</th>
          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[30.5%]">处置措施</th>
          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[7%]">是否AOG</th>
          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[7%]">是否SDR</th>
          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[4.5%]">影响</th>
          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[7%]">是否396</th>
          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[6%]">故障级别</th>
          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">备注</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {failuresList.map((failure) => (
          <tr key={failure.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">{failure.date_reported}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-center">{failure.ata}</td>
            <td className="px-4 py-3 text-sm text-gray-700">{failure.failure_description}</td>
            <td className="px-4 py-3 text-sm text-gray-700">{failure.resolution_measures}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
              <span className={`px-2 py-1 rounded-full text-xs ${getAogStyles(failure.is_aog)}`}>
                {failure.is_aog ? '是' : '否'}
              </span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
              <span className={`px-2 py-1 rounded-full text-xs ${failure.is_sdr ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                {failure.is_sdr ? '是' : '否'}
              </span>
            </td>
            <td className="px-4 py-3 text-sm text-gray-700 text-center">{failure.operation_impact}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
              <span className={`px-2 py-1 rounded-full text-xs ${failure.is_396 ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                {failure.is_396 ? '是' : '否'}
              </span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
              <div className="flex items-center justify-center">
                <div className={`w-4 h-4 rounded-full ${getSeverityStyles(failure.severity)}`}></div>
              </div>
            </td>
            <td className="px-4 py-3 text-sm text-gray-500 text-center">{failure.notes || 'N/A'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">
          {/* 删除"飞机故障状态"标题 */}
        </h2>
        <button 
          onClick={toggleInfoMode}
          className="flex items-center text-blue-600 hover:text-blue-800 ml-auto"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            {isSimplified ? (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h7" 
              />
            ) : (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h8" 
              />
            )}
          </svg>
          {isSimplified ? '显示完整信息' : '显示简化信息'}
        </button>
      </div>
      
      {Object.keys(groupedFailures).length === 0 ? (
        <p className="text-center text-gray-500 py-10">未找到故障数据</p>
      ) : (
        Object.entries(groupedFailures).map(([msn, failuresList]) => (
          <div key={msn} className="bg-white rounded-lg shadow-sm p-6 transition-all hover:shadow-md">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              {failuresList[0]?.registration}（{msn}）
            </h3>
            
            <div className="overflow-x-auto">
              {isMobile ? renderMobileTable(failuresList) : (isSimplified ? renderSimplifiedDesktopTable(failuresList) : renderDesktopTable(failuresList))}
            </div>
          </div>
        ))
      )}
    </div>
  );
} 