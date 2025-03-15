import React from 'react';
import './index.css';

function App() {
  return (
    <div className="navbar bg-secondary-content">
      <div className="flex-1">
        <a className="btn btn-ghost bg-secondary  rounded-full text-xl ">Tinder😍😉</a>
      </div>
      <div className="flex-none flex items-center gap-2">
        {/* <div className="form-control ">
          <input type="text" placeholder="Search" className="input input-bordered w-24 md:w-auto" />
        </div> */}
        <div className="dropdown dropdown-end mx-8 ">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <img
                alt="Tailwind CSS Navbar component"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
            <li>
              <a className="justify-between">
                Profile
                <span className="badge">New</span>
              </a>
            </li>
            <li><a>Settings</a></li>
            <li><a>Logout</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;