import * as AddCalendarEvent from 'react-native-add-calendar-event';

export async function addMovieToCalendar({
  title,
  releaseDate,
  notes
}: {
  title: string;
  releaseDate: string; // ISO string
  notes?: string;
}) {
  const startDate = new Date(releaseDate);
  // Set event for 1 day before release at 10am local time
  const eventStart = new Date(startDate);
  eventStart.setDate(eventStart.getDate() - 1);
  eventStart.setHours(10, 0, 0, 0);

  const eventConfig = {
    title,
    startDate: eventStart.toISOString(),
    endDate: new Date(eventStart.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour event
    notes: notes || `Don't miss ${title}!`,
    navigationBarIOS: {
      tintColor: '#000',
      backgroundColor: '#fff',
      barStyle: 'default',
      barTintColor: '#fff',
      translucent: false,
      titleColor: '#000',
    },
  };

  try {
    const result = await AddCalendarEvent.presentEventCreatingDialog(eventConfig);
    return result;
  } catch (e) {
    throw e;
  }
}
