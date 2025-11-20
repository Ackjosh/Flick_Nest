import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebase";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, setDoc } from "firebase/firestore";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const auth = getAuth(app);
const db = getFirestore(app);

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState("");
    
    const navigate = useNavigate();

    const createUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");
        setStatus("Starting signup process...");

        try {
            setStatus("Creating authentication account...");
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            setStatus("Authentication successful! User ID: " + user.uid);
            
            try {
                setStatus("Storing user data in Firestore...");
                await setDoc(doc(db, "users", user.uid), {
                    email: email,
                    username: username,
                    createdAt: new Date(),
                    password: password
                });
                
                setStatus("User data stored! Redirecting to homepage...");
                navigate("/");
            } catch (firestoreError) {
                setStatus("Error storing user data.");
                console.error("Firestore error:", firestoreError);
                setErrorMessage("Account created but profile data couldn't be saved: " + firestoreError.message);
                setIsLoading(false);
            }
        } catch (authError) {
            setStatus("Authentication failed.");
            console.error("Auth error:", authError);
            setErrorMessage("Authentication error: " + authError.message);
            setIsLoading(false);
        }
    };

    const proceedToHomepage = () => {
        navigate("/");
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-[rgb(31,31,31)]">
            <Card className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/20 shadow-lg rounded-xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-white">Create an account</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={createUser} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-gray-700 border-gray-600 text-white"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-white">Username</Label>
                            <Input 
                                id="username" 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required
                                className="bg-gray-700 border-gray-600 text-white"
                                disabled={isLoading}
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
                                    disabled={isLoading}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        
                        <Button 
                            type="submit" 
                            className="w-full bg-green-600 text-white mt-5 cursor-pointer"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating Account..." : "Sign Up"}
                        </Button>

                        {isLoading && status.includes("Authentication successful") && (
                            <Button 
                                type="button"
                                onClick={proceedToHomepage}
                                className="w-full bg-blue-600 text-white mt-2"
                            >
                                Continue to Homepage
                            </Button>
                        )}
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-400">
                        Already have an account? <a href="/sign-in" className="font-medium text-blue-600 hover:underline dark:text-blue-400">Sign in</a>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default SignUp;