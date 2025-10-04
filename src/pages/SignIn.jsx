import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import SignInGoogle from "../components/signInGoogle"; 
import bg from "../assets/login.png"
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../components/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { getDoc } from "firebase/firestore";

//const db = getFirestore();
import { useLocation } from "react-router-dom";

const SignIn = () => {
  const location = useLocation();
  const role = location.state?.role || "Mentor"; 
  const handleResetPassword = async () => {
    if (!email) {
      toast.error("Please enter your email to reset password.", {
        position: "top-center",
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent!", { position: "top-center" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to send reset email.", { position: "top-center" });
    }
  };
  const navigate = useNavigate();
  const auth = getAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
  
      if (user) {
        // ✅ 1. Fetch user data from Firestore
        const userRef = doc(db, "Users", user.uid);
        const userSnap = await getDoc(userRef);
  
        if (!userSnap.exists()) {
          throw new Error("User profile not found in database.");
        }
  
        const userData = userSnap.data();
        const actualRole = userData.role;
  
        // ✅ 2. Compare role with the one selected on Home page
        if (actualRole !== role) {
          await signOut(auth);
          toast.error(`❌ You are not authorized to sign in as ${role}`, {
            position: "top-center",
          });
          setLoading(false);
          return;
        }
  
        // ✅ 3. Log successful login + update user
        await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
  
        await addDoc(collection(db, "logins"), {
          uid: user.uid,
          email: user.email,
          timestamp: serverTimestamp(),
        });
  
        toast.success("User signed in successfully!", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
  
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message, { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Section */}
      <div className="w-1/2 flex flex-col justify-center items-center p-50">
      <h1 className="text-4xl font-bold">
  <span className="text-blue-500">{role}</span>
  <span className="text-inherit"> Sign In</span>
</h1>

        <img src={bg} alt="Sign In" className="w-80 mt-8" />
      </div>

      {/* Right Section */}
      <div className="w-1/2 bg-gray-800 flex flex-col justify-center items-center text-white p-50">
        <div className="bg-gray-900 p-10 rounded-2xl shadow-lg w-96">
          <h2 className="text-3xl font-semibold text-center text-blue-400 mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center text-white">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="mr-2 cursor-pointer"
              />
              <span className="text-gray-300">&nbsp;Show password</span>
            </div>

            {/* <button
              type="button"
              className="w-full p-3 mt-2 rounded-lg font-semibold bg-yellow-500 hover:bg-yellow-600 transition text-white"
              onClick={handleResetPassword}
              disabled={loading}
            >
              Forgot Password?
            </button> */}

            <button
              type="submit"
              className={`w-full p-3 mt-3 rounded-lg font-semibold bg-blue-500 hover:bg-blue-500 transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Google Sign-In Component */}
          <div className="mt-4">
            <SignInGoogle />
          </div>

          <p className="mt-4 text-center text-gray-300">
            Don't have an account?{" "}
            <span
              className="text-blue-400 cursor-pointer hover:underline"
              onClick={() => navigate("/signup", { state: { role } })}

            >
              Sign Up
            </span>
          </p>

          <p className="mt-2 text-center text-blue-300 cursor-pointer hover:underline" onClick={handleResetPassword}>
             Forgot Password?
          </p>


        </div>
      </div>
    </div>
  );
};

export default SignIn;
