import { createTeamsMeeting } from '../../../lib/teams';
import type { AppointmentFormData } from '../types';

export async function createAppointmentMeeting(
  data: AppointmentFormData,
  startTime: string,
  endTime: string
) {
  const meeting = await createTeamsMeeting({
    startTime,
    endTime,
    title: `SO-${data.orderId}`,
    customerName: data.customerName,
    orderId: data.orderId
  });

  return {
    teams_meeting_id: meeting.id,
    teams_meeting_url: meeting.joinUrl,
    teams_meeting_created_at: meeting.createdAt,
    bridge: formatTeamsBridgeInfo(meeting.joinUrl)
  };
}

export function formatTeamsBridgeInfo(joinUrl: string): string {
  return `Microsoft Teams Meeting\nJoin URL: ${joinUrl}`;
}