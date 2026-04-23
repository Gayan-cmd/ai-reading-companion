"use client";

import { use, useState } from "react";
import { register_user } from '../lib/api';
import Link from "next/link";

export default function Register() {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            const data = await register_user(username, email, password);
            setSuccess(true);
        } catch (error) {
            setError(error.message);
        }
        finally {
            setIsLoading(false);
        }
    }

    const checkPasswordMatch = () => {
        return password === confirmPassword;
    }

    if (success) {
        return (
            <div className="...">
                <h2 className="text-green-600">Registration Successful!</h2>
                <p>Please check your email to verify your account.</p>
                <Link href="/login" className="text-blue-500">Go to Login</Link>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">

            <div className="p-8 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-center text-black">Register</h2>

                {/* Display Error if it exists */}
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                {password && confirmPassword && !checkPasswordMatch() && <p className="text-red-500 text-sm mb-4">Passwords do not match.</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Username"
                        className="p-2 border rounded text-black"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        className="p-2 border rounded text-black"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="p-2 border rounded text-black"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        className="p-2 border rounded text-black"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <button
                        type='submit'
                        disabled={isLoading}
                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {isLoading ? "Signing up..." : "Sign Up"}
                    </button>
                </form>
            </div>
        </div>
    );
}


