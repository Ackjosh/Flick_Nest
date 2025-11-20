// src/(auth)/sign-in.tsx
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebase";
import { useState } from "react";
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from 'react-router-dom';

const auth = getAuth(app);

function SignIn() {
    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const signInUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); // Clear previous errors

        try {
            const userCredential = await signInWithEmailAndPassword(auth, emailAddress, password);
            console.log("Sign-in successful. User UID:", userCredential.user.uid);
            
            setTimeout(() => {
                navigate("/");
            }, 50);
            
        } catch (err: any) {
            setError(err.message);
            console.error("Sign-in error:", err.message);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-[rgb(31,31,31)]">
            <Card className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/20 shadow-lg rounded-xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-white">Sign In</CardTitle>
                    <CardDescription className="text-white">Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription className="text-red-500">{error}</AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={signInUser} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}
                                required
                                className="bg-gray-700 border-gray-600 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-gray-700 border-gray-600 text-white"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-green-600 text-white mt-5 hover:bg-green-700 cursor-pointer"
                            
                        >
                            Sign In
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-400">
                        Don't have an account? <a href="/sign-up" className="font-medium text-blue-600 hover:underline dark:text-blue-400">Sign up</a>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}

export default SignIn;