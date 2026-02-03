import { format } from 'date-fns';
import type { ReportConfiguration, ReportSummary } from './types';
import { getDateRange, isDateInRange, sortData } from './utils';
import type { CalendarEvent, User, Team } from '../../types';

interface StoreData {
  events: CalendarEvent[];
  users: User[];
  teams: Team[];
  productTypes: Array<{ id: string; name: string }>;
}

export function generateReportData(
  config: ReportConfiguration,
  store: StoreData
): { data: Record<string, unknown>[]; summary: ReportSummary } {
  const range = getDateRange(config.dateRange, config.startDate, config.endDate);
  let reportData: Record<string, unknown>[] = [];
  let metrics: Record<string, unknown> = {};

  switch (config.reportType) {
    case 'appointments':
      reportData = generateAppointmentsReport(store, range.start, range.end, config.teamId);
      metrics = calculateAppointmentMetrics(reportData);
      break;

    case 'tiv':
      reportData = generateTIVReport(range.start, range.end, config.teamId);
      metrics = calculateTIVMetrics(reportData);
      break;

    case 'accelerations':
      reportData = generateAccelerationsReport(range.start, range.end, config.teamId);
      metrics = calculateAccelerationMetrics(reportData);
      break;

    case 'team-activity':
      reportData = generateTeamActivityReport(store, range.start, range.end);
      metrics = calculateTeamActivityMetrics(reportData, store.users.length);
      break;

    case 'capacity':
      reportData = generateCapacityReport(store, range.start, range.end);
      metrics = calculateCapacityMetrics(reportData);
      break;

    default:
      break;
  }

  if (config.sortBy && reportData.length > 0 && config.sortBy in reportData[0]) {
    reportData = sortData(reportData, config.sortBy, config.sortDirection);
  }

  const summary: ReportSummary = {
    totalRecords: reportData.length,
    dateRange: {
      start: format(range.start, 'yyyy-MM-dd'),
      end: format(range.end, 'yyyy-MM-dd')
    },
    metrics
  };

  return { data: reportData, summary };
}

function generateAppointmentsReport(
  store: StoreData,
  startDate: Date,
  endDate: Date,
  teamId?: string
): Record<string, unknown>[] {
  return store.events
    .filter(event => isDateInRange(event.startTime, startDate, endDate))
    .filter(event => !teamId || store.users.find(u => u.id === event.createdBy)?.teamId === teamId)
    .map(event => {
      const user = store.users.find(u => u.id === event.createdBy);
      return {
        id: event.id,
        orderId: event.orderId,
        customerName: event.customerName,
        startTime: format(new Date(event.startTime), 'MMM dd, yyyy HH:mm'),
        endTime: format(new Date(event.endTime), 'HH:mm'),
        productType: event.productType,
        createdBy: user?.email || event.createdBy,
        team: store.teams.find(t => t.id === user?.teamId)?.name || 'N/A',
        status: event.status || 'scheduled',
        changeTypes: Array.isArray(event.changeTypes) ? event.changeTypes.join(', ') : ''
      };
    });
}

function generateTIVReport(
  startDate: Date,
  endDate: Date,
  teamId?: string
): Record<string, unknown>[] {
  try {
    const tivRequests = JSON.parse(localStorage.getItem('tivRequests') || '[]');
    return tivRequests
      .filter((req: any) => isDateInRange(req.created_at, startDate, endDate))
      .filter((req: any) => !teamId || req.team_id === teamId)
      .map((req: any) => ({
        id: req.id,
        customerName: req.customer_name,
        status: req.status,
        createdAt: format(new Date(req.created_at), 'MMM dd, yyyy'),
        productType: req.product_type,
        orderType: req.order_type || 'N/A'
      }));
  } catch (err) {
    console.error('Error loading TIV requests:', err);
    return [];
  }
}

function generateAccelerationsReport(
  startDate: Date,
  endDate: Date,
  teamId?: string
): Record<string, unknown>[] {
  try {
    const accelerations = JSON.parse(localStorage.getItem('accelerations') || '[]');
    return accelerations
      .filter((acc: any) => isDateInRange(acc.created_at, startDate, endDate))
      .filter((acc: any) => !teamId || acc.team_id === teamId)
      .map((acc: any) => ({
        id: acc.id,
        orderId: acc.order_id,
        customerName: acc.customer_name,
        productType: acc.product_type,
        reason: acc.reason || 'N/A',
        createdAt: format(new Date(acc.created_at), 'MMM dd, yyyy')
      }));
  } catch (err) {
    console.error('Error loading accelerations:', err);
    return [];
  }
}

function generateTeamActivityReport(
  store: StoreData,
  startDate: Date,
  endDate: Date
): Record<string, unknown>[] {
  return store.teams.map(team => {
    const teamMembers = store.users.filter(u => u.teamId === team.id);
    const teamAppointments = store.events.filter(event => {
      const user = store.users.find(u => u.id === event.createdBy);
      return user?.teamId === team.id && isDateInRange(event.startTime, startDate, endDate);
    });

    return {
      teamId: team.id,
      teamName: team.name,
      membersCount: teamMembers.length,
      appointmentsCount: teamAppointments.length,
      avgPerMember: teamMembers.length > 0
        ? (teamAppointments.length / teamMembers.length).toFixed(2)
        : '0'
    };
  });
}

function generateCapacityReport(
  store: StoreData,
  startDate: Date,
  endDate: Date
): Record<string, unknown>[] {
  return store.teams.map(team => {
    const teamMembers = store.users.filter(u => u.teamId === team.id);
    const teamAppointments = store.events.filter(event => {
      const user = store.users.find(u => u.id === event.createdBy);
      return user?.teamId === team.id && isDateInRange(event.startTime, startDate, endDate);
    });

    const workDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const potentialCapacity = teamMembers.length * workDays * 8;
    const utilizationRate = potentialCapacity > 0
      ? ((teamAppointments.length / potentialCapacity) * 100).toFixed(2)
      : '0';

    return {
      teamId: team.id,
      teamName: team.name,
      membersCount: teamMembers.length,
      appointmentsCount: teamAppointments.length,
      workDays,
      utilizationRate: `${utilizationRate}%`
    };
  });
}

function calculateAppointmentMetrics(data: Record<string, unknown>[]): Record<string, unknown> {
  const byStatus: Record<string, number> = {};
  const byProduct: Record<string, number> = {};

  data.forEach(row => {
    const status = String(row.status || 'scheduled');
    const product = String(row.productType || 'unknown');

    byStatus[status] = (byStatus[status] || 0) + 1;
    byProduct[product] = (byProduct[product] || 0) + 1;
  });

  return {
    totalAppointments: data.length,
    byStatus: Object.entries(byStatus).map(([k, v]) => `${k}: ${v}`).join(', '),
    uniqueProducts: Object.keys(byProduct).length
  };
}

function calculateTIVMetrics(data: Record<string, unknown>[]): Record<string, unknown> {
  const approved = data.filter(r => r.status === 'APPROVED').length;
  const pending = data.filter(r => r.status === 'PENDING').length;
  const rejected = data.filter(r => r.status === 'REJECTED').length;

  return {
    totalRequests: data.length,
    approved,
    pending,
    rejected,
    approvalRate: data.length > 0 ? `${((approved / data.length) * 100).toFixed(1)}%` : '0%'
  };
}

function calculateAccelerationMetrics(data: Record<string, unknown>[]): Record<string, unknown> {
  return {
    totalAccelerations: data.length,
    uniqueCustomers: new Set(data.map(r => r.customerName)).size
  };
}

function calculateTeamActivityMetrics(data: Record<string, unknown>[], totalUsers: number): Record<string, unknown> {
  const totalAppointments = data.reduce((sum, row) => sum + Number(row.appointmentsCount || 0), 0);

  return {
    totalTeams: data.length,
    totalMembers: totalUsers,
    totalAppointments,
    avgPerTeam: data.length > 0 ? (totalAppointments / data.length).toFixed(2) : '0'
  };
}

function calculateCapacityMetrics(data: Record<string, unknown>[]): Record<string, unknown> {
  const avgUtilization = data.length > 0
    ? data.reduce((sum, row) => {
        const util = String(row.utilizationRate || '0%').replace('%', '');
        return sum + parseFloat(util);
      }, 0) / data.length
    : 0;

  return {
    totalTeams: data.length,
    avgUtilization: `${avgUtilization.toFixed(2)}%`
  };
}
