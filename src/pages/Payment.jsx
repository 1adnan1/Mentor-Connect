import React, { useState } from "react";
import TopNav from "../components/TopNav";
import LeftBar from "../components/LeftBar";
import { getFirestore, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const db = getFirestore();
const auth = getAuth();
const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

const Payment = () => {
  const [statusMsg, setStatusMsg] = useState(null);
  const [customAmount, setCustomAmount] = useState(100); // default ₹100

  const handlePayment = async () => {
    const amountInPaise = parseInt(customAmount) * 100;
    if (customAmount <= 0) {
      toast.error("❌ Amount must be greater than ₹0", { position: "top-center" });
      return;
    }

    const options = {
      key: razorpayKey,
      amount: amountInPaise,
      currency: "INR",
      name: "MentorConnect Premium",
      description: "Unlock premium mentorship features",
      image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
      handler: async function (response) {
        console.log("✅ Payment success", response);
        setStatusMsg("✅ Thanks for your payment!");
        alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);

        try {
          const user = auth.currentUser;
          if (user) {
            const userRef = doc(db, "Users", user.uid);
            await updateDoc(userRef, {
              premium: true,
              paymentId: response.razorpay_payment_id,
              premiumSince: serverTimestamp(),
            });
            console.log("🔥 Premium access granted in Firestore");
          }
        } catch (error) {
          console.error("❌ Firestore update failed:", error);
        }
      },
      modal: {
        ondismiss: function () {
          setStatusMsg("❌ Payment cancelled or failed. Please try again.");
          toast.error("❌ Payment cancelled or failed. Please try again.", {
            position: "top-center",
          });
          console.log("Payment popup closed by user");
        },
      },
      prefill: {
        name: "Naman Swastik",
        email: "naman@example.com",
      },
      theme: {
        color: "#6366f1",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <>
      <TopNav />
      <div className="flex bg-gray-100 min-h-[100vh]">
        <div className="w-1/5 bg-white shadow-md flex flex-col h-[100vh]">
          <LeftBar />
        </div>

        <main className="w-4/5 p-6 overflow-y-auto">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Unlock Premium Access
            </h1>
            <p className="text-gray-600 mb-6 text-sm">
              Get direct access to top mentors, 1-on-1 doubt sessions, and personalized support.
            </p>
            <DotLottieReact
              src="https://lottie.host/0f649ef9-a6dc-4be3-98bb-7184fd1cd8a0/mrE3iP8v6v.lottie"
              loop
              autoplay
              style={{ width: "220px", height: "220px", margin: "0 auto 1.5rem" }}
            />
            <div className="mb-4">
              <label htmlFor="amount" className="block mb-1 text-gray-700 font-medium">
                Enter Amount (₹) 
              </label> &nbsp;
              <input
                type="number"
                id="amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min={1}
                className="w-40 px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handlePayment}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition"
            >
              Pay ₹{customAmount} to Go Premium
            </button>
            {statusMsg && (
              <p className="text-sm mt-4 font-medium text-center text-gray-700">
                {statusMsg}
              </p>
            )}

            <p className="text-xs text-gray-400 mt-4">
              Powered by Razorpay • Test Mode
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default Payment;