import { useEffect, useState } from "react";
import StatsCard from "../components/dashboard/StatsCard";


//dashboard page 
//displays overview metrics using reusable StatsCard components 
//data is loaded  dynamically from state

const Dashboard = () => {
  //state to store the dasboard stats

  const [dashboardStats, setDashboardStats] = useState([]); //will be stored in the form of array

  //loading state for simulated data fetch
  const [loading, setLoading] = useState(true);

  //Stimulate API call when dashboard loads 
  //Later this will be replaced with the real backend fetch 

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);

      //stimulate network delay
      setTimeout(() => {
        const statsData = [
           {
            id: 1,
            title: "Total Posts",
            value: "128",
            color: "blue",
          },
          {
            id: 2,
            title: "Engagement",
            value: "84%",
            color: "green",
          },
          {
            id: 3,
            title: "Followers Growth",
            value: "+12.4%",
            color: "purple",
          },
        ];

        setDashboardStats(statsData);
        setLoading(false);
      }, 1000); //1 sec delay
    };

    fetchDashboardStats();
  }, []);


    return (
    <div>
      {/* Dashboard heading */}
      <h1 className="text-3xl font-bold text-gray-800">
        Dashboard Overview
      </h1>

      <p className="mt-3 text-gray-600">
        Welcome to your Social Media Analytics Dashboard.
      </p>

      {/* Show loading before stats appear */}
      {loading ? (
        <div className="mt-6 text-lg font-medium text-gray-600">
          Loading dashboard stats...
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {dashboardStats.map((stat) => (
            <StatsCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              color={stat.color}
            />
          ))}
        </div>
      )}
    </div>
  );

};

export default Dashboard;

