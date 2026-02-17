'use client';

import React from 'react';
import { Task } from '@/lib/kanban';
import { CheckCircle, AlertCircle, Clock, Target, PieChart, Users } from 'lucide-react';

interface StatsBarProps {
  tasks: Task[];
}

export default function StatsBar({ tasks }: StatsBarProps) {
  // 計算統計數據
  const totalTasks = tasks.length;
  const activeTasks = tasks.filter(task => 
    ['todo', 'ongoing', 'pending', 'review'].includes(task.status)
  ).length;
  const doneTasks = tasks.filter(task => task.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  
  // 即將到期的任務
  const upcomingDeadlines = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  }).length;

  // 高優先級任務
  const highPriorityTasks = tasks.filter(task => 
    ['high', 'critical'].includes(task.priority) && 
    ['todo', 'ongoing', 'pending', 'review'].includes(task.status)
  ).length;

  // 平均每任務留言數
  const totalComments = tasks.reduce((sum, task) => sum + task.comments.length, 0);
  const avgCommentsPerTask = totalTasks > 0 ? (totalComments / totalTasks).toFixed(1) : '0';

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: <Target size={20} className="text-blue-400" />,
      color: 'bg-blue-900/20',
      textColor: 'text-blue-300',
    },
    {
      title: 'Active',
      value: activeTasks,
      icon: <AlertCircle size={20} className="text-yellow-400" />,
      color: 'bg-yellow-900/20',
      textColor: 'text-yellow-300',
    },
    {
      title: 'Done',
      value: doneTasks,
      icon: <CheckCircle size={20} className="text-green-400" />,
      color: 'bg-green-900/20',
      textColor: 'text-green-300',
    },
    {
      title: 'Completion',
      value: `${completionRate}%`,
      icon: <PieChart size={20} className="text-purple-400" />,
      color: 'bg-purple-900/20',
      textColor: 'text-purple-300',
    },
    {
      title: 'Upcoming',
      value: upcomingDeadlines,
      icon: <Clock size={20} className="text-orange-400" />,
      color: 'bg-orange-900/20',
      textColor: 'text-orange-300',
    },
    {
      title: 'High Priority',
      value: highPriorityTasks,
      icon: <AlertCircle size={20} className="text-red-400" />,
      color: 'bg-red-900/20',
      textColor: 'text-red-300',
    },
    {
      title: 'Comments/Task',
      value: avgCommentsPerTask,
      icon: <Users size={20} className="text-indigo-400" />,
      color: 'bg-indigo-900/20',
      textColor: 'text-indigo-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.color} rounded-lg p-4 border border-gray-800`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`${stat.textColor} font-bold text-2xl`}>
              {stat.value}
            </div>
            {stat.icon}
          </div>
          <div className="text-gray-400 text-sm">
            {stat.title}
          </div>
        </div>
      ))}
    </div>
  );
}