import { supabase } from './supabase';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from 'date-fns';

export interface SalesData {
  date: string;
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
}

export interface PopularItem {
  name: string;
  quantitySold: number;
  revenue: number;
  orderCount: number;
}

export interface CategoryPerformance {
  category: string;
  revenue: number;
  orderCount: number;
  itemCount: number;
  averagePrice: number;
}

export interface DailySalesReport {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    deliveredOrders: number;
    cancelledOrders: number;
  };
  popularItems: PopularItem[];
  hourlyTrends: { hour: number; orders: number; revenue: number; }[];
  categoryPerformance: CategoryPerformance[];
}

export interface WeeklySalesReport {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    growthFromPreviousWeek: number;
  };
  dailyTrends: SalesData[];
  popularItems: PopularItem[];
  peakDays: { day: string; revenue: number; orders: number; }[];
}

export interface MonthlySalesReport {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    growthFromPreviousMonth: number;
  };
  weeklyTrends: SalesData[];
  popularItems: PopularItem[];
  topDays: { date: string; revenue: number; orders: number; }[];
  categoryPerformance: CategoryPerformance[];
}

export interface MenuPerformanceReport {
  summary: {
    totalMenuItems: number;
    activeItems: number;
    totalRevenue: number;
    totalOrderItems: number;
  };
  popularItems: PopularItem[];
  categoryAnalysis: CategoryPerformance[];
  lowPerformingItems: PopularItem[];
  revenueByCategory: { category: string; revenue: number; percentage: number; }[];
}

// Helper function to execute queries with error handling
async function executeQuery<T>(query: any): Promise<T[]> {
  const { data, error } = await query;
  if (error) {
    console.error('Database query error:', error);
    throw new Error(`Database query failed: ${error.message}`);
  }
  return data || [];
}

// Get daily sales report
export async function getDailySalesReport(date: Date): Promise<DailySalesReport> {
  const startDate = startOfDay(date);
  const endDate = endOfDay(date);

  try {
    // Get summary data
    const ordersQuery = supabase
      .from('orders')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const orders = await executeQuery(ordersQuery);

    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const cancelledOrders = orders.filter(o => o.status === 'cancelled');
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

    // Get popular items
    const popularItemsQuery = supabase
      .from('order_items')
      .select(`
        item_name,
        quantity,
        total_price,
        orders!inner(status, created_at)
      `)
      .gte('orders.created_at', startDate.toISOString())
      .lte('orders.created_at', endDate.toISOString())
      .eq('orders.status', 'delivered');

    const orderItems = await executeQuery(popularItemsQuery);

    // Aggregate popular items
    const itemMap = new Map<string, PopularItem>();
    orderItems.forEach(item => {
      const existing = itemMap.get(item.item_name) || {
        name: item.item_name,
        quantitySold: 0,
        revenue: 0,
        orderCount: 0
      };
      
      existing.quantitySold += item.quantity;
      existing.revenue += parseFloat(item.total_price);
      existing.orderCount += 1;
      
      itemMap.set(item.item_name, existing);
    });

    const popularItems = Array.from(itemMap.values())
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10);

    // Get hourly trends
    const hourlyTrends = Array.from({ length: 24 }, (_, hour) => {
      const hourOrders = orders.filter(order => {
        const orderHour = new Date(order.created_at).getHours();
        return orderHour === hour && order.status === 'delivered';
      });
      
      return {
        hour,
        orders: hourOrders.length,
        revenue: hourOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0)
      };
    });

    // Get category performance
    const categoryQuery = supabase
      .from('order_items')
      .select(`
        item_name,
        total_price,
        quantity,
        menu_items!inner(category),
        orders!inner(status, created_at)
      `)
      .gte('orders.created_at', startDate.toISOString())
      .lte('orders.created_at', endDate.toISOString())
      .eq('orders.status', 'delivered');

    const categoryItems = await executeQuery(categoryQuery);

    const categoryMap = new Map<string, CategoryPerformance>();
    categoryItems.forEach(item => {
      const category = item.menu_items.category;
      const existing = categoryMap.get(category) || {
        category,
        revenue: 0,
        orderCount: 0,
        itemCount: 0,
        averagePrice: 0
      };
      
      existing.revenue += parseFloat(item.total_price);
      existing.orderCount += 1;
      existing.itemCount += item.quantity;
      
      categoryMap.set(category, existing);
    });

    const categoryPerformance = Array.from(categoryMap.values()).map(cat => ({
      ...cat,
      averagePrice: cat.revenue / cat.itemCount
    }));

    return {
      summary: {
        totalRevenue,
        totalOrders: orders.length,
        averageOrderValue: totalRevenue / deliveredOrders.length || 0,
        deliveredOrders: deliveredOrders.length,
        cancelledOrders: cancelledOrders.length
      },
      popularItems,
      hourlyTrends,
      categoryPerformance
    };

  } catch (error) {
    console.error('Error generating daily sales report:', error);
    throw error;
  }
}

// Get weekly sales report
export async function getWeeklySalesReport(date: Date): Promise<WeeklySalesReport> {
  const startDate = startOfWeek(date);
  const endDate = endOfWeek(date);
  const previousWeekStart = startOfWeek(subWeeks(date, 1));
  const previousWeekEnd = endOfWeek(subWeeks(date, 1));

  try {
    // Current week data
    const currentWeekQuery = supabase
      .from('orders')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('status', 'delivered');

    const currentWeekOrders = await executeQuery(currentWeekQuery);
    const currentWeekRevenue = currentWeekOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

    // Previous week data for comparison
    const previousWeekQuery = supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', previousWeekStart.toISOString())
      .lte('created_at', previousWeekEnd.toISOString())
      .eq('status', 'delivered');

    const previousWeekOrders = await executeQuery(previousWeekQuery);
    const previousWeekRevenue = previousWeekOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

    const growthFromPreviousWeek = previousWeekRevenue > 0 
      ? ((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100 
      : 0;

    // Daily trends for the week
    const dailyTrends: SalesData[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(day.getDate() + i);
      
      const dayOrders = currentWeekOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.toDateString() === day.toDateString();
      });
      
      const dayRevenue = dayOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
      
      dailyTrends.push({
        date: day.toISOString().split('T')[0],
        revenue: dayRevenue,
        orderCount: dayOrders.length,
        averageOrderValue: dayRevenue / dayOrders.length || 0
      });
    }

    // Popular items for the week
    const popularItemsQuery = supabase
      .from('order_items')
      .select(`
        item_name,
        quantity,
        total_price,
        orders!inner(status, created_at)
      `)
      .gte('orders.created_at', startDate.toISOString())
      .lte('orders.created_at', endDate.toISOString())
      .eq('orders.status', 'delivered');

    const orderItems = await executeQuery(popularItemsQuery);

    const itemMap = new Map<string, PopularItem>();
    orderItems.forEach(item => {
      const existing = itemMap.get(item.item_name) || {
        name: item.item_name,
        quantitySold: 0,
        revenue: 0,
        orderCount: 0
      };
      
      existing.quantitySold += item.quantity;
      existing.revenue += parseFloat(item.total_price);
      existing.orderCount += 1;
      
      itemMap.set(item.item_name, existing);
    });

    const popularItems = Array.from(itemMap.values())
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10);

    // Peak days
    const peakDays = dailyTrends
      .map(day => ({
        day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }),
        revenue: day.revenue,
        orders: day.orderCount
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    return {
      summary: {
        totalRevenue: currentWeekRevenue,
        totalOrders: currentWeekOrders.length,
        averageOrderValue: currentWeekRevenue / currentWeekOrders.length || 0,
        growthFromPreviousWeek
      },
      dailyTrends,
      popularItems,
      peakDays
    };

  } catch (error) {
    console.error('Error generating weekly sales report:', error);
    throw error;
  }
}

// Get monthly sales report
export async function getMonthlySalesReport(date: Date): Promise<MonthlySalesReport> {
  const startDate = startOfMonth(date);
  const endDate = endOfMonth(date);
  const previousMonthStart = startOfMonth(subMonths(date, 1));
  const previousMonthEnd = endOfMonth(subMonths(date, 1));

  try {
    // Current month data
    const currentMonthQuery = supabase
      .from('orders')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('status', 'delivered');

    const currentMonthOrders = await executeQuery(currentMonthQuery);
    const currentMonthRevenue = currentMonthOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

    // Previous month data for comparison
    const previousMonthQuery = supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', previousMonthStart.toISOString())
      .lte('created_at', previousMonthEnd.toISOString())
      .eq('status', 'delivered');

    const previousMonthOrders = await executeQuery(previousMonthQuery);
    const previousMonthRevenue = previousMonthOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

    const growthFromPreviousMonth = previousMonthRevenue > 0
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : 0;

    // Weekly trends for the month
    const weeklyTrends: SalesData[] = [];
    const weeksInMonth = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

    for (let i = 0; i < weeksInMonth; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      if (weekEnd > endDate) weekEnd.setTime(endDate.getTime());

      const weekOrders = currentMonthOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= weekStart && orderDate <= weekEnd;
      });

      const weekRevenue = weekOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

      weeklyTrends.push({
        date: `Week ${i + 1}`,
        revenue: weekRevenue,
        orderCount: weekOrders.length,
        averageOrderValue: weekRevenue / weekOrders.length || 0
      });
    }

    // Popular items for the month
    const popularItemsQuery = supabase
      .from('order_items')
      .select(`
        item_name,
        quantity,
        total_price,
        orders!inner(status, created_at)
      `)
      .gte('orders.created_at', startDate.toISOString())
      .lte('orders.created_at', endDate.toISOString())
      .eq('orders.status', 'delivered');

    const orderItems = await executeQuery(popularItemsQuery);

    const itemMap = new Map<string, PopularItem>();
    orderItems.forEach(item => {
      const existing = itemMap.get(item.item_name) || {
        name: item.item_name,
        quantitySold: 0,
        revenue: 0,
        orderCount: 0
      };

      existing.quantitySold += item.quantity;
      existing.revenue += parseFloat(item.total_price);
      existing.orderCount += 1;

      itemMap.set(item.item_name, existing);
    });

    const popularItems = Array.from(itemMap.values())
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 15);

    // Top performing days
    const dailyRevenue = new Map<string, { revenue: number; orders: number }>();
    currentMonthOrders.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      const existing = dailyRevenue.get(date) || { revenue: 0, orders: 0 };
      existing.revenue += parseFloat(order.total_amount);
      existing.orders += 1;
      dailyRevenue.set(date, existing);
    });

    const topDays = Array.from(dailyRevenue.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Category performance
    const categoryQuery = supabase
      .from('order_items')
      .select(`
        item_name,
        total_price,
        quantity,
        menu_items!inner(category),
        orders!inner(status, created_at)
      `)
      .gte('orders.created_at', startDate.toISOString())
      .lte('orders.created_at', endDate.toISOString())
      .eq('orders.status', 'delivered');

    const categoryItems = await executeQuery(categoryQuery);

    const categoryMap = new Map<string, CategoryPerformance>();
    categoryItems.forEach(item => {
      const category = item.menu_items.category;
      const existing = categoryMap.get(category) || {
        category,
        revenue: 0,
        orderCount: 0,
        itemCount: 0,
        averagePrice: 0
      };

      existing.revenue += parseFloat(item.total_price);
      existing.orderCount += 1;
      existing.itemCount += item.quantity;

      categoryMap.set(category, existing);
    });

    const categoryPerformance = Array.from(categoryMap.values()).map(cat => ({
      ...cat,
      averagePrice: cat.revenue / cat.itemCount
    }));

    return {
      summary: {
        totalRevenue: currentMonthRevenue,
        totalOrders: currentMonthOrders.length,
        averageOrderValue: currentMonthRevenue / currentMonthOrders.length || 0,
        growthFromPreviousMonth
      },
      weeklyTrends,
      popularItems,
      topDays,
      categoryPerformance
    };

  } catch (error) {
    console.error('Error generating monthly sales report:', error);
    throw error;
  }
}

// Get menu performance report
export async function getMenuPerformanceReport(startDate: Date, endDate: Date): Promise<MenuPerformanceReport> {
  try {
    // Get all menu items
    const menuItemsQuery = supabase
      .from('menu_items')
      .select('*');

    const menuItems = await executeQuery(menuItemsQuery);

    // Get order items data
    const orderItemsQuery = supabase
      .from('order_items')
      .select(`
        item_name,
        quantity,
        total_price,
        menu_items!inner(category),
        orders!inner(status, created_at)
      `)
      .gte('orders.created_at', startDate.toISOString())
      .lte('orders.created_at', endDate.toISOString())
      .eq('orders.status', 'delivered');

    const orderItems = await executeQuery(orderItemsQuery);

    // Calculate popular items
    const itemMap = new Map<string, PopularItem>();
    orderItems.forEach(item => {
      const existing = itemMap.get(item.item_name) || {
        name: item.item_name,
        quantitySold: 0,
        revenue: 0,
        orderCount: 0
      };

      existing.quantitySold += item.quantity;
      existing.revenue += parseFloat(item.total_price);
      existing.orderCount += 1;

      itemMap.set(item.item_name, existing);
    });

    const allItemsPerformance = Array.from(itemMap.values());
    const popularItems = allItemsPerformance
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10);

    const lowPerformingItems = allItemsPerformance
      .sort((a, b) => a.quantitySold - b.quantitySold)
      .slice(0, 5);

    // Category analysis
    const categoryMap = new Map<string, CategoryPerformance>();
    orderItems.forEach(item => {
      const category = item.menu_items.category;
      const existing = categoryMap.get(category) || {
        category,
        revenue: 0,
        orderCount: 0,
        itemCount: 0,
        averagePrice: 0
      };

      existing.revenue += parseFloat(item.total_price);
      existing.orderCount += 1;
      existing.itemCount += item.quantity;

      categoryMap.set(category, existing);
    });

    const categoryAnalysis = Array.from(categoryMap.values()).map(cat => ({
      ...cat,
      averagePrice: cat.revenue / cat.itemCount
    }));

    // Revenue by category with percentages
    const totalRevenue = categoryAnalysis.reduce((sum, cat) => sum + cat.revenue, 0);
    const revenueByCategory = categoryAnalysis.map(cat => ({
      category: cat.category,
      revenue: cat.revenue,
      percentage: totalRevenue > 0 ? (cat.revenue / totalRevenue) * 100 : 0
    }));

    return {
      summary: {
        totalMenuItems: menuItems.length,
        activeItems: menuItems.filter(item => item.available).length,
        totalRevenue,
        totalOrderItems: orderItems.length
      },
      popularItems,
      categoryAnalysis,
      lowPerformingItems,
      revenueByCategory
    };

  } catch (error) {
    console.error('Error generating menu performance report:', error);
    throw error;
  }
}
