import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import {
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    eachDayOfInterval,
    addDays
} from 'date-fns';
import { useLanguage } from '../context/LanguageContext';
import { formatMonthYear, formatWeekDayShort, formatDate } from '../utils/dateFormatter';

interface DatePickerProps {
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    label?: string;
    required?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label, required }) => {
    const { language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize state from value prop
    useEffect(() => {
        if (value) {
            // Parse manual YYYY-MM-DD to avoid timezone shift
            const [y, m, d] = value.split('-').map(Number);
            const date = new Date(y, m - 1, d);
            setSelectedDate(date);
            setViewDate(date);
        } else {
            setSelectedDate(null);
        }
    }, [value]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDayClick = (day: Date) => {
        // Format as YYYY-MM-DD using local time manually to be safe
        const year = day.getFullYear();
        const month = String(day.getMonth() + 1).padStart(2, '0');
        const d = String(day.getDate()).padStart(2, '0');

        onChange(`${year}-${month}-${d}`);
        setIsOpen(false);
    };

    const nextMonth = () => setViewDate(addMonths(viewDate, 1));
    const prevMonth = () => setViewDate(subMonths(viewDate, 1));

    // Generate calendar grid
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    // Generate localized week days headers (Sunday to Saturday)
    const weekDays = [];
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    for (let i = 0; i < 7; i++) {
        const day = addDays(weekStart, i);
        // Use central formatter
        weekDays.push(formatWeekDayShort(day, language));
    }

    // Format display value
    const formattedDisplayValue = selectedDate
        ? formatDate(selectedDate, language)
        : '';

    // Month Title
    const monthTitle = formatMonthYear(viewDate, language);

    return (
        <div className="date-picker-container" ref={containerRef}>
            {label && <label className="form-label">{label} {required && '*'}</label>}

            <div className="input-wrapper" onClick={() => setIsOpen(!isOpen)}>
                <input
                    type="text"
                    readOnly
                    className="form-input pointer-cursor"
                    value={formattedDisplayValue}
                    placeholder={language.startsWith('en') ? "Select date" : "..."}
                />
                <CalendarIcon className="calendar-icon" size={18} />
            </div>

            {isOpen && (
                <div className="calendar-popup">
                    <div className="calendar-header">
                        <button type="button" onClick={prevMonth} className="nav-btn">
                            <ChevronLeft size={20} />
                        </button>

                        <div className="header-selectors">
                            <span className="current-month capitalize">
                                {monthTitle}
                            </span>
                        </div>

                        <button type="button" onClick={nextMonth} className="nav-btn">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="week-days">
                        {weekDays.map((d, i) => (
                            <div key={i} className="week-day capitalize">{d}</div>
                        ))}
                    </div>

                    <div className="days-grid">
                        {calendarDays.map((day: Date, idx: number) => (
                            <div
                                key={idx}
                                className={`day-cell 
                                    ${!isSameMonth(day, monthStart) ? 'outside-month' : ''} 
                                    ${selectedDate && isSameDay(day, selectedDate) ? 'selected' : ''}
                                    ${isSameDay(day, new Date()) ? 'today' : ''}
                                `}
                                onClick={() => handleDayClick(day)}
                            >
                                {day.getDate()}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                .date-picker-container {
                    position: relative;
                    width: 100%;
                }
                .input-wrapper {
                    position: relative;
                    cursor: pointer;
                }
                .pointer-cursor {
                    cursor: pointer;
                }
                .calendar-icon {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--color-gray-500);
                    pointer-events: none;
                }
                .calendar-popup {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    z-index: 100;
                    background: var(--color-bg-secondary);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-xl);
                    padding: 16px;
                    margin-top: 4px;
                    width: 300px;
                    max-width: 90vw;
                    animation: fadeIn 0.2s ease;
                }
                @media (max-width: 768px) {
                    .calendar-popup {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 90%;
                        max-width: 350px;
                        margin: 0;
                    }
                    /* Overlay for mobile */
                    .calendar-popup::before {
                        content: '';
                        position: fixed;
                        top: -100vh;
                        left: -100vw;
                        right: -100vw;
                        bottom: -100vh;
                        background: rgba(0,0,0,0.5);
                        z-index: -1;
                    }
                }
                .calendar-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                .current-month {
                    font-weight: 600;
                    color: var(--color-text-primary);
                }
                .capitalize {
                    text-transform: capitalize;
                }
                .nav-btn {
                    padding: 4px;
                    border: none;
                    background: transparent;
                    color: var(--color-gray-600);
                    cursor: pointer;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .nav-btn:hover {
                    background: var(--color-gray-100);
                    color: var(--color-primary-600);
                }
                .week-days {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    margin-bottom: 8px;
                    text-align: center;
                }
                .week-day {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--color-gray-500);
                }
                .days-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 4px;
                }
                .day-cell {
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    cursor: pointer;
                    border-radius: 8px;
                    color: var(--color-text-primary);
                    transition: all 0.2s;
                }
                .day-cell:hover:not(.outside-month) {
                    background-color: var(--color-gray-100);
                }
                .day-cell.outside-month {
                    color: var(--color-gray-400);
                }
                .day-cell.selected {
                    background: linear-gradient(135deg, var(--color-primary-600), var(--color-blue-500));
                    color: white;
                    font-weight: 600;
                }
                .day-cell.today:not(.selected) {
                    border: 1px solid var(--color-primary-500);
                    color: var(--color-primary-600);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @media (max-width: 768px) {
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translate(-50%, -60%); }
                        to { opacity: 1; transform: translate(-50%, -50%); }
                    }
                }
            `}</style>
        </div>
    );
};

export default DatePicker;
