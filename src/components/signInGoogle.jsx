import React from "react";
import googleLogo from "../assets/googlesignin.jpeg";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SignInGoogle()
{

function googleLogin()
{
  const provider=new GoogleAuthProvider();
  const auth = getAuth();
  signInWithPopup(auth, provider).then(async (result) => {
    console.log(result);

    if(result.user)
    {
      toast.success("User signed in successfully!", {
             position: "top-center",
             autoClose: 3000,  
             theme: "colored",
           });

      window.location.href='/dashboard';
    }
  });
}



  return (
    <div className="flex flex-col items-center">
      <p className="continue-p text-gray-600 font-medium my-2">
        -- Or continue with --
      </p>
      <div className="cursor-pointer" style={{display:"flex",justifyContent:"center"}} onClick={googleLogin}>
        <img 
          src={googleLogo} 
          alt="Sign in with Google" 
          width="60%"
          className="hover:opacity-80 transition"
        />
      </div>
    </div>
  );
};

export default SignInGoogle;
