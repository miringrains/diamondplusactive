'use client'

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock, MapPin, Calendar as CalendarIcon, Video, Users, Trophy, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  hasVirtualMeeting: boolean;
  eventType?: 'coaching' | 'challenge' | 'workshop';
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

interface GoogleCalendarProps {
  events: CalendarEvent[];
  loading: boolean;
  onRefresh: () => void;
}

export default function GoogleCalendar({ events, loading, onRefresh }: GoogleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Format long meeting descriptions
  const formatEventDescription = (description: string): string => {
    // Check if it's a Zoom meeting description
    if (description.includes('zoom.us')) {
      const lines = description.split('\n');
      const result: string[] = [];
      
      lines.forEach(line => {
        // Extract Meeting ID
        if (line.includes('Meeting ID:')) {
          result.push(line.trim());
        }
        // Extract Passcode
        else if (line.includes('Passcode:')) {
          result.push(line.trim());
        }
        // Extract just the Zoom link
        else if (line.includes('Join Zoom Meeting')) {
          result.push('Join Zoom Meeting');
        }
        else if (line.includes('https://us02web.zoom.us') && !line.includes('href=')) {
          result.push(line.trim());
        }
      });
      
      return result.join('\n') || description.substring(0, 200) + '...';
    }
    
    // For other descriptions, just truncate if too long
    return description.length > 200 ? description.substring(0, 200) + '...' : description;
  };

  // Determine event type and color based on title/description
  const getEventTypeAndColor = (event: CalendarEvent): { type: string; color: string; icon: React.ReactNode } => {
    const title = event.title.toLowerCase();
    const description = (event.description || '').toLowerCase();
    
    if (title.includes('challenge') || description.includes('challenge')) {
      return { type: 'challenge', color: '#10B981', icon: <Trophy className="h-4 w-4" /> };
    }
    if (title.includes('workshop') || description.includes('workshop')) {
      return { type: 'workshop', color: '#F59E0B', icon: <Users className="h-4 w-4" /> };
    }
    // Default to coaching call
    return { type: 'coaching', color: '#176FFF', icon: <Video className="h-4 w-4" /> };
  };

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();

    const days: CalendarDay[] = [];

    // Previous month's trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayDate = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: dayDate,
        isCurrentMonth: false,
        isToday: false,
        events: getEventsForDate(dayDate)
      });
    }

    // Current month days
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    monthDays.forEach(dayDate => {
      days.push({
        date: dayDate,
        isCurrentMonth: true,
        isToday: isToday(dayDate),
        events: getEventsForDate(dayDate)
      });
    });

    // Next month's leading days
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const dayDate = new Date(year, month + 1, day);
      days.push({
        date: dayDate,
        isCurrentMonth: false,
        isToday: false,
        events: getEventsForDate(dayDate)
      });
    }

    return days;
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = parseISO(event.start);
      return isSameDay(eventDate, date);
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: CalendarDay) => {
    if (day.events.length > 0) {
      setSelectedEvent(day.events[0]);
      setShowSidebar(true);
    }
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setShowSidebar(true);
  };

  const handleAddToCalendar = (event: CalendarEvent) => {
    // Format dates for Google Calendar
    const startDate = parseISO(event.start);
    const endDate = parseISO(event.end);
    
    // Google Calendar expects dates in YYYYMMDDTHHmmssZ format
    const formatGoogleDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    // Build Google Calendar URL
    const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render');
    googleCalendarUrl.searchParams.append('action', 'TEMPLATE');
    googleCalendarUrl.searchParams.append('text', event.title);
    googleCalendarUrl.searchParams.append('dates', `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`);
    
    if (event.description) {
      // Clean up description for Google Calendar
      let details = event.description;
      if (event.location && event.location.includes('zoom.us')) {
        details = `Join Zoom Meeting: ${event.location}\n\n${details}`;
      }
      googleCalendarUrl.searchParams.append('details', details);
    }
    
    if (event.location) {
      googleCalendarUrl.searchParams.append('location', event.location);
    }
    
    // Open in new tab
    window.open(googleCalendarUrl.toString(), '_blank');
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)] bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b border-gray-200 bg-white px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#111828]">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center gap-1 sm:gap-2 ml-auto sm:ml-0">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={previousMonth}
                  className="h-8 w-8 sm:h-9 sm:w-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextMonth}
                  className="h-8 w-8 sm:h-9 sm:w-9"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={goToToday}
                  className="ml-1 sm:ml-2 text-sm sm:text-base"
                >
                  Today
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="gap-2 self-end sm:self-auto"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-3 sm:p-6">
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {dayNames.map((day) => (
              <div
                key={day}
                className="bg-gray-50 px-1 sm:px-3 py-1 sm:py-2 text-center text-xs sm:text-sm font-medium text-[#6B7280]"
              >
                {day.substring(0, 3)}
              </div>
            ))}
            {days.map((day, index) => {
              const hasSelectedEvent = selectedEvent && day.events.some(e => e.id === selectedEvent.id);
              return (
                <div
                  key={index}
                  onClick={() => handleDayClick(day)}
                  className={`
                    min-h-[80px] sm:min-h-[120px] bg-white p-1 sm:p-2 cursor-pointer transition-all
                    hover:bg-gray-50
                    ${!day.isCurrentMonth ? 'opacity-40' : ''}
                    ${hasSelectedEvent ? 'ring-2 ring-[#176FFF] bg-blue-50' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`
                        text-xs sm:text-sm font-medium inline-flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 rounded-full
                        ${day.isToday ? 'bg-[#176FFF] text-white' : 'text-[#111828]'}
                      `}
                    >
                      {day.date.getDate()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {/* Mobile: Show dots, Desktop: Show full events */}
                    <div className="sm:hidden flex gap-1">
                      {day.events.slice(0, 3).map((event) => {
                        const { color } = getEventTypeAndColor(event);
                        return (
                          <div
                            key={event.id}
                            onClick={(e) => handleEventClick(event, e)}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        );
                      })}
                      {day.events.length > 3 && (
                        <span className="text-[10px] text-[#6B7280]">+{day.events.length - 3}</span>
                      )}
                    </div>
                    
                    {/* Desktop: Show full event cards */}
                    <div className="hidden sm:block space-y-1">
                      {day.events.slice(0, 2).map((event) => {
                        const { color, icon } = getEventTypeAndColor(event);
                        const eventTime = format(parseISO(event.start), 'h:mm a');
                        return (
                          <div
                            key={event.id}
                            onClick={(e) => handleEventClick(event, e)}
                            className="text-xs px-2 py-1 rounded text-white hover:opacity-90 transition-opacity flex items-center gap-1"
                            style={{ backgroundColor: color }}
                          >
                            {icon}
                            <div className="flex-1 truncate">
                              <div className="font-medium truncate">{event.title}</div>
                              <div className="text-[10px] opacity-90">{eventTime}</div>
                            </div>
                          </div>
                        );
                      })}
                      {day.events.length > 2 && (
                        <div className="text-xs text-[#6B7280] px-2">
                          +{day.events.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Mobile Event List */}
          <div className="sm:hidden px-3 pb-6">
            <h3 className="text-lg font-semibold text-[#111828] mb-4">This Month's Events</h3>
            <div className="space-y-2">
              {events
                .filter(event => {
                  const eventDate = parseISO(event.start);
                  return eventDate.getMonth() === currentDate.getMonth() && 
                         eventDate.getFullYear() === currentDate.getFullYear();
                })
                .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime())
                .map((event) => {
                  const { color, icon } = getEventTypeAndColor(event);
                  const eventDate = parseISO(event.start);
                  return (
                    <div
                      key={event.id}
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowSidebar(true);
                      }}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div 
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <div style={{ color }}>{icon}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[#111828] truncate">{event.title}</h4>
                        <p className="text-sm text-[#6B7280]">
                          {format(eventDate, 'MMM d')} at {format(eventDate, 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Modal, Desktop: Sidebar */}
      <div className={`
        ${showSidebar ? 'fixed lg:relative inset-0 lg:inset-auto z-50 lg:z-auto' : 'hidden lg:block'}
        lg:w-[28rem] border-l border-gray-200 bg-white overflow-hidden flex flex-col
      `}>
        {/* Mobile backdrop */}
        {showSidebar && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowSidebar(false)}
          />
        )}
        
        {/* Sidebar content */}
        <div className={`
          ${showSidebar ? 'fixed lg:relative bottom-0 left-0 right-0 lg:inset-auto z-50' : ''}
          lg:static lg:h-full bg-white rounded-t-xl lg:rounded-none flex flex-col max-h-[80vh] lg:max-h-full
        `}>
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#111828]">
              Event Details
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedEvent(null);
                setShowSidebar(false);
              }}
              className="h-8 w-8 lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            {selectedEvent ? (
              <div className="p-6">
                <div className="flex items-start justify-between mb-4 gap-2">
                  <h4 className="text-lg font-semibold text-[#111828] break-words min-w-0">
                    {selectedEvent.title}
                  </h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedEvent(null);
                      setShowSidebar(false);
                    }}
                    className="h-8 w-8 hidden lg:flex flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-[#6B7280] mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-[#111828] text-sm">
                      {format(parseISO(selectedEvent.start), 'h:mm a')} - {format(parseISO(selectedEvent.end), 'h:mm a')}
                    </div>
                    <div className="text-sm text-[#6B7280]">
                      {format(parseISO(selectedEvent.start), 'EEEE, MMMM d, yyyy')}
                    </div>
                  </div>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-[#6B7280] mt-0.5 flex-shrink-0" />
                    <div className="font-medium text-[#111828] text-sm break-words min-w-0">{selectedEvent.location}</div>
                  </div>
                )}

                {selectedEvent.description && (
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-5 w-5 text-[#6B7280] mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-[#6B7280] space-y-2 min-w-0">
                      {selectedEvent.description.includes('zoom.us') ? (
                        <>
                          {selectedEvent.description.match(/Meeting ID: \d+/)?.[0] && (
                            <div className="font-medium text-xs">{selectedEvent.description.match(/Meeting ID: \d+/)?.[0]}</div>
                          )}
                          {selectedEvent.description.match(/Passcode: \d+/)?.[0] && (
                            <div className="text-xs">{selectedEvent.description.match(/Passcode: \d+/)?.[0]}</div>
                          )}
                          {selectedEvent.location && selectedEvent.location.includes('zoom.us') && (
                            <a 
                              href={selectedEvent.location} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#176FFF] hover:underline inline-flex items-center gap-1 text-xs"
                            >
                              <Video className="h-3 w-3" />
                              Join Zoom Meeting
                            </a>
                          )}
                        </>
                      ) : (
                        <div className="whitespace-pre-wrap break-words text-xs">{formatEventDescription(selectedEvent.description)}</div>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    className="w-full bg-[#176FFF] hover:bg-[#176FFF]/90"
                    onClick={() => handleAddToCalendar(selectedEvent)}
                    style={{ color: 'white' }}
                  >
                    <Plus className="h-4 w-4 mr-2" style={{ color: 'white' }} />
                    <span style={{ color: 'white' }}>Add to Google Calendar</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 px-6">
              <CalendarIcon className="h-12 w-12 text-[#6B7280] mx-auto mb-3" />
              <p className="text-[#6B7280]">Select an event to view details</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  </div>
  );
}
