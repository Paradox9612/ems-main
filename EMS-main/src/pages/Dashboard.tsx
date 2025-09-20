import React, { useEffect, useState } from "react";
import {
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  Award,
  UserCheck,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
 // for redirect option

export const Dashboard: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    totalSalaryPaid: 0,
    documentsUploaded: 0,
    attendanceRate: 0,
    avgSalary: 0,
    approvedLeaves: 0,
    pendingLeaves: 0,
  });

  useEffect(() => {
    if (isAdmin) {
      // Mock data - in real app, this would come from API
      const mockStats = {
        totalEmployees: 25,
        presentToday: 22,
        totalSalaryPaid: 125000,
        documentsUploaded: 48,
        attendanceRate: 88,
        avgSalary: 5000,
        approvedLeaves: 5,
        pendingLeaves: 3,
      };
      setStats(mockStats);
    }
  }, [isAdmin]);

  // ✅ Restrict dashboard to only admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied 🚫</h1>
          <p className="text-gray-600 mt-2">
            You don’t have permission to view this page.
          </p>
          {/* Or redirect to another page */}
          {/* return <Navigate to="/profile" replace />; */}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees.toString(),
      icon: Users,
      color: "border-blue-500",
      iconBg: "bg-blue-500",
    },
    {
      title: "Present Today",
      value: stats.presentToday.toString(),
      icon: UserCheck,
      color: "border-green-500",
      iconBg: "bg-green-500",
    },
    {
      title: "Total Salary Paid",
      value: `$${stats.totalSalaryPaid.toLocaleString()}`,
      icon: DollarSign,
      color: "border-emerald-500",
      iconBg: "bg-emerald-500",
    },
    {
      title: "Documents",
      value: stats.documentsUploaded.toString(),
      icon: FileText,
      color: "border-purple-500",
      iconBg: "bg-purple-500",
    },
    {
      title: "Attendance Rate",
      value: `${stats.attendanceRate}%`,
      icon: TrendingUp,
      color: "border-indigo-500",
      iconBg: "bg-indigo-500",
    },
    {
      title: "Avg. Salary",
      value: `$${Math.round(stats.avgSalary).toLocaleString()}`,
      icon: Award,
      color: "border-orange-500",
      iconBg: "bg-orange-500",
    },
    {
      title: "Approved Leaves",
      value: stats.approvedLeaves.toString(),
      icon: CheckCircle,
      color: "border-teal-500",
      iconBg: "bg-teal-500",
    },
    {
      title: "Pending Leaves",
      value: stats.pendingLeaves.toString(),
      icon: Clock,
      color: "border-yellow-500",
      iconBg: "bg-yellow-500",
    },
  ];

  const COLORS = [
    "#22c55e",
    "#ef4444",
    "#3b82f6",
    "#f59e0b",
    "#14b8a6",
    "#eab308",
  ];

  const attendanceData = [
    { name: "Present", value: stats.presentToday },
    { name: "Absent", value: stats.totalEmployees - stats.presentToday },
  ];

  const salaryData = [
    { name: "Salary", value: stats.totalSalaryPaid },
    { name: "Avg Salary", value: stats.avgSalary * stats.totalEmployees },
  ];

  const leaveData = [
    { name: "Approved Leaves", value: stats.approvedLeaves },
    { name: "Pending Leaves", value: stats.pendingLeaves },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName} 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's a quick overview of today’s activity.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            className={`p-6 rounded-xl shadow-lg bg-white hover:shadow-2xl transition-all duration-300 border-l-4 ${stat.color}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center">
              <div
                className={`p-3 rounded-xl ${stat.iconBg} bg-opacity-90 shadow-md`}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Pie Chart */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Attendance Overview
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={attendanceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={90}
                dataKey="value"
              >
                {attendanceData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Salary Bar Chart */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Salary Distribution
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salaryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leaves Pie Chart */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Leave Status
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={leaveData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={90}
                dataKey="value"
              >
                {leaveData.map((_, index) => (
                  <Cell key={index} fill={COLORS[(index + 4) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
