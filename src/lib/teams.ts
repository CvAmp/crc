import { format } from 'date-fns';

interface TeamsEvent {
  startTime: string;
  endTime: string;
  title: string;
  customerName: string;
  orderId: string;
}

interface TeamsResponse {
  id: string;
  joinUrl: string;
  createdAt: string;
}

export async function createTeamsMeeting(event: TeamsEvent): Promise<TeamsResponse> {
  // In a real implementation, this would call the Microsoft Graph API
  // For now, we'll create a simulated response
  const meetingId = Math.random().toString(36).substring(2, 15);
  const joinUrl = `https://teams.microsoft.com/l/meetup-join/${meetingId}`;
  
  return {
    id: meetingId,
    joinUrl,
    createdAt: new Date().toISOString()
  };
}

export function formatTeamsBridgeInfo(joinUrl: string): string {
  return `Microsoft Teams Meeting\nJoin URL: ${joinUrl}`;
}