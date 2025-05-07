'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';

// 根据实际表结构定义数据类型
type DailyData = {
  date: string;
  [key: string]: any;
};

type CumulativeData = {
  date: string;
  air_time: number;
  block_time: number;
  fc: number;
  flight_leg: number;
};

const getWindowWidth = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth;
  }
  // 默认移动设备宽度
  return 375; 
};

export default function Home() {
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [cumulativeData, setCumulativeData] = useState<CumulativeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [isLatestDay, setIsLatestDay] = useState(false);
  const [latestDate, setLatestDate] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [sampleData, setSampleData] = useState<any>(null);
  const [combinedData, setCombinedData] = useState<any[]>([]);
  const [windowWidth, setWindowWidth] = useState(getWindowWidth());
  
  useEffect(() => {
    // 初始化数据获取
    fetchData();
    
    // 设置窗口尺寸监听
    function handleResize() {
      setWindowWidth(getWindowWidth());
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('开始获取数据...');
      const response = await fetch('/api/data');
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API响应错误:', errorData);
        throw new Error(errorData.error || '数据获取失败');
      }
      
      const data = await response.json();
      console.log('API返回数据:', data);
      
      // 保存样本数据用于检查可用列
      if (data.sampleData) {
        setSampleData(data.sampleData);
        setColumns(Object.keys(data.sampleData));
      }
      
      if (!data.daily || data.daily.length === 0) {
        console.warn('当日数据为空');
      } else {
        console.log(`获取到${data.daily.length}条当日数据`);
      }
      
      if (!data.cumulative || data.cumulative.length === 0) {
        console.warn('累计数据为空');
      } else {
        console.log(`获取到${data.cumulative.length}条累计数据`);
      }
      
      const dailyDataArray = data.daily || [];
      const cumulativeDataArray = data.cumulative || [];
      
      setDailyData(dailyDataArray);
      setCumulativeData(cumulativeDataArray);
      setIsLatestDay(data.isLatestDay || false);
      setLatestDate(data.latestDate || null);
      
      // 创建合并的数据集用于复合图表
      const combined = prepareCombinedData(dailyDataArray, cumulativeDataArray);
      setCombinedData(combined);
      
    } catch (err) {
      console.error('获取数据时出错:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('获取数据失败，请稍后再试');
      }
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  };

  const handleRetry = () => {
    setIsRetrying(true);
    fetchData();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN');
    } catch (e) {
      return dateStr;
    }
  };

  // 安全访问对象属性，处理属性名中有空格的情况
  const safeGetProperty = (obj: any, key: string, defaultValue: any = 0) => {
    if (!obj) return defaultValue;
    return obj[key] !== undefined ? obj[key] : defaultValue;
  };

  // 准备复合图表数据，合并当日和累计数据
  const prepareCombinedData = (daily: any[], cumulative: any[]) => {
    // 创建以日期为键的映射
    const dataMap: Record<string, any> = {};
    
    // 处理当日数据
    daily.forEach(item => {
      const date = item.date;
      if (!dataMap[date]) dataMap[date] = { date };
      
      dataMap[date].daily_air_time = safeGetProperty(item, 'air_time');
      dataMap[date].daily_block_time = safeGetProperty(item, 'block_time');
      dataMap[date].daily_fc = safeGetProperty(item, 'fc');
      dataMap[date].daily_flight_leg = safeGetProperty(item, 'flight_leg');
      dataMap[date].daily_utilization_air_time = safeGetProperty(item, 'daily_utilization_air_time');
      dataMap[date].daily_utilization_block_time = safeGetProperty(item, 'daily_utilization_block_time');
    });
    
    // 处理累计数据
    cumulative.forEach(item => {
      const date = item.date;
      if (!dataMap[date]) dataMap[date] = { date };
      
      dataMap[date].cumulative_air_time = safeGetProperty(item, 'air_time');
      dataMap[date].cumulative_block_time = safeGetProperty(item, 'block_time');
      dataMap[date].cumulative_fc = safeGetProperty(item, 'fc');
      dataMap[date].cumulative_flight_leg = safeGetProperty(item, 'flight_leg');
      dataMap[date].cumulative_daily_utilization_air_time = safeGetProperty(item, 'cumulative_daily_utilization_air_time');
      dataMap[date].cumulative_daily_utilization_block_time = safeGetProperty(item, 'cumulative_daily_utilization_blcok_time');
    });
    
    // 转换为数组并按日期排序
    const result = Object.values(dataMap).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    console.log('合并后的数据:', result);
    return result;
  };

  // 计算数据最大值，用于设置Y轴范围
  const calculateMaxValue = (data: any[], keys: string[]) => {
    if (!data || data.length === 0) return 10;
    
    // 对每个键分别计算最大值
    const maxValues: Record<string, number> = {};
    keys.forEach(key => {
      maxValues[key] = 0;
    });
    
    // 遍历所有数据，找出每个指标的最大值
    data.forEach(item => {
      keys.forEach(key => {
        const value = parseFloat(item[key]) || 0;
        if (value > maxValues[key]) {
          maxValues[key] = value;
        }
      });
    });
    
    // 找出所有指标中的最大值
    let absoluteMax = 0;
    keys.forEach(key => {
      console.log(`${key} 最大值: ${maxValues[key]}`);
      if (maxValues[key] > absoluteMax) {
        absoluteMax = maxValues[key];
      }
    });
    
    console.log(`所有指标的最大值: ${absoluteMax}`);
    
    // 对最大值进行适当处理，使用1.1倍数并向上取整到最近的5的倍数
    return Math.ceil(absoluteMax * 1.1 / 5) * 5;
  };

  return (
    <main className="min-h-screen p-0.5 sm:p-4 md:p-6 bg-gray-50">
      <h1 className="text-xl sm:text-2xl font-bold text-center my-3 sm:my-8 text-gray-800">飞行运营数据可视化平台</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
            <p className="text-lg sm:text-xl">{isRetrying ? '正在重新获取数据...' : '加载中...'}</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col justify-center items-center h-64 bg-red-50 p-3 sm:p-6 rounded-lg border border-red-200">
          <p className="text-red-500 mb-2 sm:mb-4 text-center">{error}</p>
          <p className="text-gray-600 mb-3 sm:mb-6">可能的原因:</p>
          <ul className="list-disc text-gray-600 mb-4 sm:mb-8 pl-5">
            <li>数据库连接配置不正确</li>
            <li>数据库服务暂时不可用</li>
            <li>网络连接问题</li>
            <li>数据库表结构与代码不匹配</li>
          </ul>
          <button 
            onClick={handleRetry} 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={isRetrying}
          >
            {isRetrying ? '重试中...' : '重试'}
          </button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-16 max-w-7xl mx-auto">
          {dailyData.length === 0 && cumulativeData.length === 0 ? (
            <div className="flex justify-center items-center h-64 bg-yellow-50 p-3 sm:p-6 rounded-lg border border-yellow-200">
              <div className="text-center">
                <p className="text-lg text-yellow-700 mb-4">数据库中没有找到数据</p>
                <button 
                  onClick={handleRetry} 
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                >
                  刷新数据
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 空时数据（空中时间和空地时间） */}
              <div className="bg-white p-1 sm:p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-1 sm:mb-6">
                  <h2 className="text-base sm:text-xl font-semibold text-gray-800">空时数据</h2>
                  <button 
                    onClick={handleRetry}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-medium py-0.5 px-2 sm:px-3 rounded-full"
                  >
                    刷新
                  </button>
                </div>
                
                {combinedData.length === 0 ? (
                  <div className="h-64 sm:h-80 w-full flex justify-center items-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500">暂无数据</p>
                  </div>
                ) : (
                  <div className="h-[450px] sm:h-[450px] md:h-[550px] w-full overflow-x-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={combinedData}
                        margin={{ 
                          top: 20, 
                          right: windowWidth < 768 ? 15 : 30, 
                          left: windowWidth < 768 ? 10 : 20, 
                          bottom: combinedData.length > 10 ? 90 : 60 
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDate}
                          angle={-45} 
                          textAnchor="end"
                          height={windowWidth < 768 ? 60 : 80}
                          dy={windowWidth < 768 ? 10 : 20}
                          padding={{ left: windowWidth < 768 ? 10 : 20, right: windowWidth < 768 ? 10 : 20 }}
                          scale="point"
                          type="category"
                          interval={Math.max(1, Math.floor(combinedData.length / (windowWidth < 768 ? 10 : 20)))}
                          tick={{ fontSize: windowWidth < 768 ? 10 : 12 }}
                        />
                        <YAxis 
                          yAxisId="left"
                          width={windowWidth < 768 ? 40 : 50}
                          tick={{ fontSize: windowWidth < 768 ? 10 : 12 }}
                          domain={[0, calculateMaxValue(combinedData, ['daily_air_time', 'daily_block_time'])]}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          width={windowWidth < 768 ? 40 : 50}
                          tick={{ fontSize: windowWidth < 768 ? 10 : 12 }}
                          domain={[0, calculateMaxValue(combinedData, ['cumulative_air_time', 'cumulative_block_time'])]}
                        />
                        <Tooltip 
                          labelFormatter={formatDate} 
                          wrapperStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: '1px solid #ddd', 
                            borderRadius: '8px', 
                            padding: '8px',
                            fontSize: windowWidth < 768 ? '12px' : '14px'
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={windowWidth < 768 ? 45 : 60} 
                          wrapperStyle={{ paddingTop: windowWidth < 768 ? '5px' : '10px' }}
                          iconSize={windowWidth < 768 ? 8 : 10}
                          iconType="circle"
                        />
                        <Bar 
                          yAxisId="left"
                          dataKey="daily_air_time" 
                          name="当日空中时间" 
                          fill="#4E79A7" 
                          barSize={windowWidth < 768 ? 10 : 20}
                        />
                        <Bar 
                          yAxisId="left"
                          dataKey="daily_block_time" 
                          name="当日空地时间" 
                          fill="#F28E2B"
                          barSize={windowWidth < 768 ? 10 : 20} 
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone"
                          dataKey="cumulative_air_time" 
                          name="累计空中时间" 
                          stroke="#E15759" 
                          activeDot={{ r: windowWidth < 768 ? 4 : 8 }}
                          connectNulls={true}
                          dot={{ r: windowWidth < 768 ? 2 : 4 }}
                          strokeWidth={windowWidth < 768 ? 2 : 3}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone"
                          dataKey="cumulative_block_time" 
                          name="累计空地时间" 
                          stroke="#76B7B2"
                          connectNulls={true}
                          dot={{ r: windowWidth < 768 ? 2 : 4 }}
                          strokeWidth={windowWidth < 768 ? 2 : 3}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              
              {/* 日利用率数据 */}
              <div className="bg-white p-1 sm:p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-1 sm:mb-6">
                  <h2 className="text-base sm:text-xl font-semibold text-gray-800">日利用率数据</h2>
                </div>
                
                {combinedData.length === 0 ? (
                  <div className="h-64 sm:h-80 w-full flex justify-center items-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500">暂无数据</p>
                  </div>
                ) : (
                  <div className="h-[450px] sm:h-[450px] md:h-[550px] w-full overflow-x-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={combinedData}
                        margin={{ 
                          top: 20, 
                          right: windowWidth < 768 ? 15 : 30, 
                          left: windowWidth < 768 ? 10 : 20, 
                          bottom: combinedData.length > 10 ? 90 : 60 
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDate}
                          angle={-45} 
                          textAnchor="end"
                          height={windowWidth < 768 ? 60 : 80}
                          dy={windowWidth < 768 ? 10 : 20}
                          padding={{ left: windowWidth < 768 ? 10 : 20, right: windowWidth < 768 ? 10 : 20 }}
                          scale="point"
                          type="category"
                          interval={Math.max(1, Math.floor(combinedData.length / (windowWidth < 768 ? 10 : 20)))}
                          tick={{ fontSize: windowWidth < 768 ? 10 : 12 }}
                        />
                        <YAxis 
                          yAxisId="left"
                          width={windowWidth < 768 ? 40 : 50}
                          tick={{ fontSize: windowWidth < 768 ? 10 : 12 }}
                          domain={[0, calculateMaxValue(combinedData, ['daily_utilization_air_time', 'daily_utilization_block_time'])]}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          width={windowWidth < 768 ? 40 : 50}
                          tick={{ fontSize: windowWidth < 768 ? 10 : 12 }}
                          domain={[0, calculateMaxValue(combinedData, ['cumulative_daily_utilization_air_time', 'cumulative_daily_utilization_block_time'])]}
                        />
                        <Tooltip 
                          labelFormatter={formatDate} 
                          wrapperStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: '1px solid #ddd', 
                            borderRadius: '8px', 
                            padding: '8px',
                            fontSize: windowWidth < 768 ? '12px' : '14px'
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={windowWidth < 768 ? 45 : 60} 
                          wrapperStyle={{ paddingTop: windowWidth < 768 ? '5px' : '10px' }}
                          iconSize={windowWidth < 768 ? 8 : 10}
                          iconType="circle"
                        />
                        <Bar 
                          yAxisId="left"
                          dataKey="daily_utilization_air_time" 
                          name="日利用率(空中)" 
                          fill="#4E79A7"
                          barSize={windowWidth < 768 ? 10 : 20}
                        />
                        <Bar 
                          yAxisId="left"
                          dataKey="daily_utilization_block_time" 
                          name="日利用率(空地)" 
                          fill="#F28E2B"
                          barSize={windowWidth < 768 ? 10 : 20}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone"
                          dataKey="cumulative_daily_utilization_air_time" 
                          name="累计日利用率(空中)" 
                          stroke="#E15759"
                          connectNulls={true}
                          dot={{ r: windowWidth < 768 ? 2 : 4 }}
                          strokeWidth={windowWidth < 768 ? 2 : 3}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone"
                          dataKey="cumulative_daily_utilization_block_time" 
                          name="累计日利用率(空地)" 
                          stroke="#76B7B2"
                          connectNulls={true}
                          dot={{ r: windowWidth < 768 ? 2 : 4 }}
                          strokeWidth={windowWidth < 768 ? 2 : 3}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              
              {/* 飞行循环数据 */}
              <div className="bg-white p-1 sm:p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-1 sm:mb-6">
                  <h2 className="text-base sm:text-xl font-semibold text-gray-800">飞行循环数据</h2>
                </div>
                
                {combinedData.length === 0 ? (
                  <div className="h-64 sm:h-80 w-full flex justify-center items-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500">暂无数据</p>
                  </div>
                ) : (
                  <div className="h-[450px] sm:h-[450px] md:h-[550px] w-full overflow-x-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={combinedData}
                        margin={{ 
                          top: 20, 
                          right: windowWidth < 768 ? 15 : 30, 
                          left: windowWidth < 768 ? 10 : 20, 
                          bottom: combinedData.length > 10 ? 90 : 60 
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDate}
                          angle={-45} 
                          textAnchor="end"
                          height={windowWidth < 768 ? 60 : 80}
                          dy={windowWidth < 768 ? 10 : 20}
                          padding={{ left: windowWidth < 768 ? 10 : 20, right: windowWidth < 768 ? 10 : 20 }}
                          scale="point"
                          type="category"
                          interval={Math.max(1, Math.floor(combinedData.length / (windowWidth < 768 ? 10 : 20)))}
                          tick={{ fontSize: windowWidth < 768 ? 10 : 12 }}
                        />
                        <YAxis 
                          yAxisId="left"
                          width={windowWidth < 768 ? 40 : 50}
                          tick={{ fontSize: windowWidth < 768 ? 10 : 12 }}
                          domain={[0, calculateMaxValue(combinedData, ['daily_fc'])]}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          width={windowWidth < 768 ? 40 : 50}
                          tick={{ fontSize: windowWidth < 768 ? 10 : 12 }}
                          domain={[0, calculateMaxValue(combinedData, ['cumulative_fc'])]}
                        />
                        <Tooltip 
                          labelFormatter={formatDate} 
                          wrapperStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: '1px solid #ddd', 
                            borderRadius: '8px', 
                            padding: '8px',
                            fontSize: windowWidth < 768 ? '12px' : '14px'
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={windowWidth < 768 ? 45 : 60} 
                          wrapperStyle={{ paddingTop: windowWidth < 768 ? '5px' : '10px' }}
                          iconSize={windowWidth < 768 ? 8 : 10}
                          iconType="circle"
                        />
                        <Bar 
                          yAxisId="left"
                          dataKey="daily_fc" 
                          name="当日飞行循环" 
                          fill="#4E79A7"
                          barSize={windowWidth < 768 ? 10 : 20}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone"
                          dataKey="cumulative_fc" 
                          name="累计飞行循环" 
                          stroke="#E15759"
                          activeDot={{ r: windowWidth < 768 ? 4 : 8 }}
                          connectNulls={true}
                          dot={{ r: windowWidth < 768 ? 2 : 4 }}
                          strokeWidth={windowWidth < 768 ? 2 : 3}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </>
          )}
          
          {/* 在页面底部添加提示信息 */}
          {isLatestDay && latestDate && (
            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mt-12 rounded-r-md shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium">数据更新说明：</p>
                  <p>当日数据会在21:00之后更新。最新数据日期: {formatDate(latestDate)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}


