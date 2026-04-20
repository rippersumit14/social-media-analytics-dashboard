//Reusable stats card component 
//shows one analytic metric like posts, engagement, growth, etc.
//Props: title, value and color

const StatsCard = ({ title, value, color = "blue" }) => {
    //decide text color class based on color prop
    const valueColorClass = 
    color === "blue"
      ? "text-blue-600"
      : color === "green"
      ? "text-green-600"
      : color === "purple"
      ? "text-purple-600"
      : "text-gray-800";


return (
    <div className="rounded-lg bg-white p-5 shadow">
      {/* Metric title */}
      <h2 className="text-lg font-semibold text-gray-700">
        {title}
      </h2>

      {/* Metric value */}
      <p className={`mt-2 text-2xl font-bold ${valueColorClass}`}>
        {value}
      </p>
    </div>
  );
};

export default StatsCard;
