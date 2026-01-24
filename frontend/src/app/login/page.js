"use client";
import { useState,useEffect } from 'react';
import { login_user } from '../lib/api';
import { useRouter } from 'next/navigation';

export default function Login({}) {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const data = await login_user(username, password);
            localStorage.setItem("access_token", data.access_token);
            router.push('/');
            
        }

        catch (error) {
            seterror("Login Failed: Please Check Your Credentials.");

        } finally {
            setIsLoading(false);

        }

    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-center text-black">Login</h2>

                {/* Display Error if it exists */}
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Username"
                        className="p-2 border rounded text-black"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="p-2 border rounded text-black"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        type='submit'
                        disabled={isLoading}
                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );



}