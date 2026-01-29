import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { viewEmployeeAttendance } from '../../http';
import socket from '../../socket';

const LocationTracker = () => {
    const { user } = useSelector((state) => state.authSlice);
    const [isTracking, setIsTracking] = useState(false);

    useEffect(() => {
        let watchId;

        const checkStatusAndTrack = async () => {
            if (!user) return;

            const dt = new Date();
            const obj = {
                "employeeID": user.id,
                "year": dt.getFullYear(),
                "month": dt.getMonth() + 1,
                "date": dt.getDate()
            };

            try {
                const res = await viewEmployeeAttendance(obj);
                if (res.success && res.data && res.data.length > 0) {
                    const todayRecord = res.data[0];
                    // If checked in AND NOT checked out
                    if (todayRecord.present && !todayRecord.checkOutTime) {
                        startTracking();
                    } else {
                        stopTracking();
                    }
                } else {
                    stopTracking();
                }
            } catch (err) {
                console.error("Error checking attendance status for tracking:", err);
            }
        };

        const startTracking = () => {
            if (isTracking) return; // Already tracking
            
            if (!navigator.geolocation) {
                console.error('Geolocation is not supported by your browser');
                return;
            }

            console.log('Starting location tracking...');
            setIsTracking(true);

            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    // console.log(`Emitting location: ${latitude}, ${longitude}`);
                    socket.emit('share-location', {
                        userId: user.id,
                        lat: latitude,
                        long: longitude
                    });
                },
                (error) => {
                    console.error('Error watching position:', error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        };

        const stopTracking = () => {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
            }
            if (isTracking) {
                console.log('Stopped location tracking.');
                setIsTracking(false);
            }
        };

        // Initial check
        checkStatusAndTrack();

        // Listen for custom event to re-check immediately
        const handleAttendanceUpdate = () => {
            console.log('Attendance update event received, re-checking status...');
            checkStatusAndTrack();
        };

        window.addEventListener('attendance-update', handleAttendanceUpdate);

        return () => {
            window.removeEventListener('attendance-update', handleAttendanceUpdate);
            stopTracking();
        };
    }, [user, isTracking]);

    return null; // This component does not render anything
};

export default LocationTracker;
