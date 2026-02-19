import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setAuth } from "../store/auth-slice";
import { backendUrl } from "../http/index";

export const useAutoLogin = () => {
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        const pathname = window.location.pathname || "/";
        const isGuestAuthPage =
            pathname === "/" ||
            pathname === "/login" ||
            pathname === "/forgot" ||
            pathname.startsWith("/register/") ||
            pathname.startsWith("/verify/");

        // Skip refresh probe on guest auth pages to avoid expected 401 noise.
        if (isGuestAuthPage) {
            dispatch(setAuth(null));
            setLoading(false);
            return;
        }

        const checkAuth = async () => {
            try {
                // Attempt to refresh the session once on mount.
                // We use a direct axios call here to avoid circular dependencies 
                // or interceptor conflicts during the initial load.
                const { data } = await axios.get(`${backendUrl}/api/auth/refresh`, {
                    withCredentials: true,
                });

                if (data.success) {
                    dispatch(setAuth(data.user));
                }
            } catch (err) {
                // Clear stale local auth state when refresh fails.
                dispatch(setAuth(null));

                // If this fails (401, 403, Network Error), the user is simply not logged in.
                // We do NOT retry or redirect here. We just finish loading.
                // This prevents infinite loops on the login page.

                // Only log if it's not a 401 (which is expected when not logged in)
                if (err.response?.status !== 401) {
                    console.log("Auto-login attempt failed:", err.message);
                }
                // 401 errors are normal when not logged in - no need to log or throw
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [dispatch]);

    return loading;
};
