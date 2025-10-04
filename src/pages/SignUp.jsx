import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth ,db} from "../components/firebase";
import { useLocation } from "react-router-dom";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {setDoc,doc} from "firebase/firestore";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import bg from "../assets/login.png"
const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
const role = location.state?.role || "Mentor"; 


  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 
    setLoading(true); 

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
    
      if(user)
      {
        await setDoc(doc(db, "Users", user.uid), {
          firstName,
          middleName,
          lastName,
          department,
          email,
          role, 
        });
      }
      toast.success("User created successfully!", {
        position: "top-center",
        autoClose: 3000, 
        theme: "colored",
      });
      

      console.log("User created successfully:", auth.currentUser);
      navigate("/signin");
    } catch (err) {
      setError(err.message); 
      toast.error(err.message, {position: "bottom-center"});

    } finally {
      setLoading(false); // Enable button after process
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Section */}
      <div className="w-1/2 flex flex-col justify-center items-center p-50">
      <h1 className="text-4xl font-bold">
  <span className="text-blue-500">{role}</span>
  <span className="text-inherit"> Sign Up</span>
</h1>


        <img src={bg} alt="Sign Up" className="w-80 mt-5" />
      </div>

      {/* Right Section */}
      <div className="w-1/2 bg-gray-800 flex flex-col justify-center items-center text-white p-50">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="flex gap-3 mb-3">
            <input 
              type="text" 
              placeholder="First name" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-32 p-2 bg-white text-black rounded-md border border-gray-300 placeholder-gray-500"
              required
            />
            <input 
              type="text" 
              placeholder="Middle name" 
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              className="w-32 p-2 bg-white text-black rounded-md border border-gray-300 placeholder-gray-500"
            />
            <input 
              type="text" 
              placeholder="Last name" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-32 p-2 bg-white text-black rounded-md border border-gray-300 placeholder-gray-500"
              required
            />
          </div>

          <select 
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full p-2 mb-3 bg-white text-black rounded-md border border-gray-300"
            required
          >
            <option value="">Select Department</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electrical">Electrical</option>
            <option value="Agriculture">Agriculture</option>
            <option value="Pharmacy">Pharmacy</option>
          </select>

          <input 
            type="email" 
            placeholder="Email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-3 bg-white text-black rounded-md border border-gray-300 placeholder-gray-500"
            required
          />
          
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-3 bg-white text-black rounded-md border border-gray-300 placeholder-gray-500"
            required
          />
          
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Confirm Password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 mb-3 bg-white text-black rounded-md border border-gray-300 placeholder-gray-500"
            required
          />

          <div className="flex items-center text-white mb-3">
            <input 
              type="checkbox" 
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="mr-2"
            /> 
            &nbsp;Show password
          </div>

          {/* Show error messages */}
          {error && <p className="text-red-500 mb-3">{error}</p>}

          <button 
            type="submit"
            className={`bg-white text-gray-800 px-6 py-2 mt-4 rounded-md transition w-full ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-2">
          Already have an account? 
          <span className="text-blue-400 cursor-pointer ml-1" onClick={() => navigate("/signin")}>
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
