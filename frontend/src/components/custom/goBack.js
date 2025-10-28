// src/components/BackButton.tsx
// src/hooks/useGoBack.ts
import { useNavigate, useLocation } from "react-router-dom";
export function useGoBack(fallback = "/") {
    const navigate = useNavigate();
    const location = useLocation();
    return () => {
        if (location.key !== "default") {
            navigate(-1);
        }
        else {
            navigate(fallback);
        }
    };
}
