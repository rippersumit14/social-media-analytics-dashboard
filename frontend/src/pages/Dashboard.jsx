import { useEffect, useState } from "react";
import StatsCard from "../components/dashboard/StatsCard";
import EngagementChart from "../components/dashboard/EngagementChart";
import PostsChart from "../components/dashboard/PostsChart";

//dashboard page 
//displays overview metrics using reusable StatsCard components 
//data is loaded  dynamically from state

const Dashboard = () => {
  //state to store the dasboard stats
  const [dashboardStats, setDashboardStats] = useState([]); //will be stored in the form of array

  //post chart data stats
  const [postsData, setPostsData] = useState([]);

  //chart stats state 
  const [chartData, setChartData] = useState([]); 

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
          { id: 1, title: "Total Posts", value: "128", color: "blue" },
          { id: 2, title: "Engagement", value: "84%", color: "green" },
          { id: 3, title: "Followers Growth", value: "+12.4%", color: "purple" },
        ];

        const enagementData = [
          { name: "Mon", engagement: 40 },
          { name: "Tue", engagement: 55 },
          { name: "Wed", engagement: 70 },
          { name: "Thu", engagement: 65 },
          { name: "Fri", engagement: 80 },
          { name: "Sat", engagement: 75 },
          { name: "Sun", engagement: 90 },
        ]

        const postsOverviewData = [
          { name: "Mon", posts: 4 },
          { name: "Tue", posts: 6 },
          { name: "Wed", posts: 5 },
          { name: "Thu", posts: 7 },
          { name: "Fri", posts: 8 },
          { name: "Sat", posts: 6 },
          { name: "Sun", posts: 9 },
];



        setDashboardStats(statsData);
        setChartData(enagementData);
        setPostsData(postsOverviewData);


        setLoading(false);
      }, 1000); //1 sec delay
    };

    fetchDashboardStats();
  }, []);



  return (
  <div>
    {/* Heading */}
    <h1 className="text-3xl font-bold text-gray-800">
      Dashboard Overview
    </h1>

    <p className="mt-3 text-gray-600">
      Welcome to your Social Media Analytics Dashboard.
    </p>

    {/* Stats Cards */}
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      {loading
        ? Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-24 rounded-lg bg-gray-200 animate-pulse"
            ></div>
          ))
        : dashboardStats.map((stat) => (
            <StatsCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              color={stat.color}
            />
          ))}
    </div>

    {/*Enagement chart*/}
    {!loading && <EngagementChart data={chartData} />}

    {/* Posts chart */}
    {!loading && <PostsChart data={postsData}/>}
  </div>
);

};

export default Dashboard;

