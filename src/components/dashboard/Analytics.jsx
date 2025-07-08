import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useBookmarks } from '../../context/BookmarkContext';
import ReactECharts from 'echarts-for-react';
import { format, parseISO, subDays } from 'date-fns';

export default function Analytics() {
  const { fetchAnalytics, bookmarks, categories } = useBookmarks();
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d'); // '7d', '30d', '90d', 'all'
  
  useEffect(() => {
    loadAnalytics();
  }, []);
  
  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { success, data, error } = await fetchAnalytics();
      
      if (success) {
        setAnalyticsData(data);
      } else {
        setError(error);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter data based on time range
  const getFilteredData = () => {
    if (timeRange === 'all') {
      return analyticsData;
    }
    
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoffDate = subDays(new Date(), days);
    
    return analyticsData.filter(item => {
      return new Date(item.created_at) >= cutoffDate;
    });
  };
  
  const filteredData = getFilteredData();
  
  // Prepare data for charts
  const prepareBookmarkActivityData = () => {
    const activityByDay = {};
    const today = new Date();
    
    // Initialize days
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 30;
    
    for (let i = 0; i < days; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      activityByDay[dateStr] = { date: dateStr, count: 0 };
    }
    
    // Count activities
    filteredData.forEach(item => {
      try {
        const dateStr = format(parseISO(item.created_at), 'yyyy-MM-dd');
        if (activityByDay[dateStr]) {
          activityByDay[dateStr].count += 1;
        }
      } catch (e) {
        console.error('Date parsing error:', e);
      }
    });
    
    // Convert to array and sort by date
    return Object.values(activityByDay)
      .sort((a, b) => a.date.localeCompare(b.date));
  };
  
  const prepareStatusData = () => {
    const statusCounts = {
      unwatched: 0,
      watching: 0,
      watched: 0
    };
    
    bookmarks.forEach(bookmark => {
      if (bookmark.status) {
        statusCounts[bookmark.status] += 1;
      } else {
        statusCounts.unwatched += 1;
      }
    });
    
    return [
      { name: 'Unwatched', value: statusCounts.unwatched },
      { name: 'Watching', value: statusCounts.watching },
      { name: 'Watched', value: statusCounts.watched }
    ];
  };
  
  const prepareCategoryData = () => {
    const categoryCounts = {};
    let uncategorized = 0;
    
    bookmarks.forEach(bookmark => {
      if (bookmark.category) {
        const categoryName = bookmark.category.name;
        categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
      } else {
        uncategorized += 1;
      }
    });
    
    const result = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value
    }));
    
    if (uncategorized > 0) {
      result.push({ name: 'Uncategorized', value: uncategorized });
    }
    
    return result.sort((a, b) => b.value - a.value);
  };
  
  // Activity over time chart options
  const getActivityChartOption = () => {
    const data = prepareBookmarkActivityData();
    return {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c} activities'
      },
      xAxis: {
        type: 'category',
        data: data.map(d => format(new Date(d.date), 'MMM d')),
        axisLabel: {
          rotate: 45,
          interval: timeRange === '7d' ? 0 : 'auto'
        }
      },
      yAxis: {
        type: 'value',
        minInterval: 1
      },
      series: [
        {
          data: data.map(d => d.count),
          type: 'line',
          smooth: true,
          lineStyle: {
            color: '#3B82F6'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.5)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
              ]
            }
          }
        }
      ],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      }
    };
  };
  
  // Status distribution chart options
  const getStatusChartOption = () => {
    const data = prepareStatusData();
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 10
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '14',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { 
              value: data[0].value, 
              name: 'Unwatched',
              itemStyle: { color: '#3B82F6' }
            },
            { 
              value: data[1].value, 
              name: 'Watching',
              itemStyle: { color: '#F59E0B' }
            },
            { 
              value: data[2].value, 
              name: 'Watched',
              itemStyle: { color: '#10B981' }
            }
          ]
        }
      ]
    };
  };
  
  // Category distribution chart options
  const getCategoryChartOption = () => {
    const data = prepareCategoryData();
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        bottom: 10,
        data: data.map(item => item.name)
      },
      series: [
        {
          type: 'pie',
          radius: '70%',
          center: ['50%', '45%'],
          data: data.map((item, index) => {
            return {
              value: item.value,
              name: item.name,
              itemStyle: {
                color: categories.find(c => c.name === item.name)?.color || 
                       ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'][index % 7]
              }
            };
          }),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-8 w-8 text-blue-500" />
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <SafeIcon icon={FiIcons.FiAlertTriangle} className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Failed to load analytics</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadAnalytics}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
        >
          <SafeIcon icon={FiIcons.FiRefreshCw} className="h-4 w-4 mr-2" />
          Try Again
        </button>
      </div>
    );
  }
  
  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <SafeIcon icon={FiIcons.FiPieChart} className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No analytics available</h3>
        <p className="text-gray-600">Add some bookmarks to see analytics here.</p>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full p-4 overflow-auto"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <SafeIcon icon={FiIcons.FiPieChart} className="mr-2" />
          Analytics Dashboard
        </h2>
        
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            Visualize and analyze your bookmark activity and habits
          </p>
          
          <div className="flex space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="block w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
            
            <button
              onClick={loadAnalytics}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <SafeIcon icon={FiIcons.FiRefreshCw} className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <SafeIcon icon={FiIcons.FiBookmark} className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Bookmarks</p>
              <h3 className="text-xl font-semibold text-gray-900">{bookmarks.length}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <SafeIcon icon={FiIcons.FiCheckCircle} className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Watched</p>
              <h3 className="text-xl font-semibold text-gray-900">
                {bookmarks.filter(b => b.status === 'watched').length}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <SafeIcon icon={FiIcons.FiPlay} className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Watching</p>
              <h3 className="text-xl font-semibold text-gray-900">
                {bookmarks.filter(b => b.status === 'watching').length}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <SafeIcon icon={FiIcons.FiCpu} className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">AI Summaries</p>
              <h3 className="text-xl font-semibold text-gray-900">
                {bookmarks.filter(b => b.ai_summary).length}
              </h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Activity over time chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Bookmark Activity</h3>
          <ReactECharts
            option={getActivityChartOption()}
            style={{ height: '300px' }}
          />
        </div>
        
        {/* Status distribution chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Watch Status Distribution</h3>
          <ReactECharts
            option={getStatusChartOption()}
            style={{ height: '300px' }}
          />
        </div>
      </div>
      
      {/* Category distribution chart */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Bookmarks by Category</h3>
        <ReactECharts
          option={getCategoryChartOption()}
          style={{ height: '350px' }}
        />
      </div>
      
      {/* Recent activity */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookmark
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.slice(0, 10).map((activity) => {
                const bookmark = bookmarks.find(b => b.id === activity.bookmark_id);
                return (
                  <tr key={activity.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {activity.action === 'create' && (
                          <>
                            <SafeIcon icon={FiIcons.FiPlus} className="mr-1" />
                            Created
                          </>
                        )}
                        {activity.action === 'update' && (
                          <>
                            <SafeIcon icon={FiIcons.FiEdit} className="mr-1" />
                            Updated
                          </>
                        )}
                        {activity.action === 'delete' && (
                          <>
                            <SafeIcon icon={FiIcons.FiTrash2} className="mr-1" />
                            Deleted
                          </>
                        )}
                        {activity.action.includes('update_status') && (
                          <>
                            <SafeIcon icon={FiIcons.FiClock} className="mr-1" />
                            Status Changed
                          </>
                        )}
                        {activity.action === 'generate_summary' && (
                          <>
                            <SafeIcon icon={FiIcons.FiCpu} className="mr-1" />
                            Generated Summary
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {bookmark ? bookmark.title : 'Bookmark no longer exists'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                    </td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    No recent activity found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}