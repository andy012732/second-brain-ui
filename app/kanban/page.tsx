'use client';

import React from 'react';

export default function Kanban() {
  return (
    <div className="flex h-full p-4 space-x-4">
      <div className="w-1/6 bg-gray-800 rounded p-4">
        <h2 className="font-bold text-lg text-gray-200">Todo</h2>
      </div>
      <div className="w-1/6 bg-gray-800 rounded p-4">
        <h2 className="font-bold text-lg text-gray-200">Ongoing</h2>
      </div>
      <div className="w-1/6 bg-gray-800 rounded p-4">
        <h2 className="font-bold text-lg text-gray-200">Pending</h2>
      </div>
      <div className="w-1/6 bg-gray-800 rounded p-4">
        <h2 className="font-bold text-lg text-gray-200">Review</h2>
      </div>
      <div className="w-1/6 bg-gray-800 rounded p-4">
        <h2 className="font-bold text-lg text-gray-200">Done</h2>
      </div>
      <div className="w-1/6 bg-gray-800 rounded p-4">
        <h2 className="font-bold text-lg text-gray-200">Archive</h2>
      </div>
    </div>
  );
}