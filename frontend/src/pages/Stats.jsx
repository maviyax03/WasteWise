import { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard";
import { getStats } from "../utils/api";

function Stats() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        getStats()
            .then(setStats)
            .catch((err) => console.error("Failed to load stats:", err));
    }, []);

    return <Dashboard stats={stats} />;
}

export default Stats;