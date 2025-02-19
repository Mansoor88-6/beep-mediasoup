import React from 'react';
import Rooms from './components/rooms/Rooms';
import { ProfileNav } from 'shared';

/**
 * Meeting
 * @returns {React.FC} - return
 */
const Meeting = () => {
  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col">
      {/* Top Navbar */}
      <header className="bg-[#FFFFFF] shadow-sm px-2 py-1 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-green-700 text-lg font-semibold">
            <a href="/user">Beep M33ting</a>
          </h1>
        </div>

        <ProfileNav flex />
      </header>

      <Rooms />

      {/* Bottom Controls */}
      <footer className="bg-[#ffffff] border-t py-2">
        <div className="flex items-center justify-center gap-2 text-green-700">
          averox @ Copyright &copy;<span>{new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
};

export default Meeting;
