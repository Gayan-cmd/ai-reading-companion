"use client";

import { useState } from "react";
import {User,LogOut,ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserMenu({ user }) { 
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleProfileClick = () => {
        setIsOpen(false);
        router.push("/profile");

    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2"
            
            >
                <User size={20} />
                <span className="font-medium">{user?.username}</span>
                <ChevronDown size={16} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-10">
                    <button onClick={handleProfileClick} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2">
                        Profile
                    </button>
                    <button onClick={() => {
                        localStorage.removeItem("access_token");
                        router.push("/login");
                    }} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2">
                        <LogOut size={16} />
                         Logout
                    </button>

                </div>


            )}
        </div>
    )
}