import React from "react";
import TopNav from "../components/TopNav";
import LeftBar from "../components/LeftBar";

const Earnings = () => {
  const dummySessions = [
    {
      menteeName: "Ankit Sharma",
      amountPaid: 100,
      duration: "1 hour",
      date: "2025-05-02 10:30 AM",
    },
    {
      menteeName: "Riya Verma",
      amountPaid: 200,
      duration: "2 hours",
      date: "2025-04-30 03:00 PM",
    },
    {
      menteeName: "Kunal Mehta",
      amountPaid: 150,
      duration: "1.5 hours",
      date: "2025-04-28 06:45 PM",
    },
  ];

  const totalEarnings = dummySessions.reduce((sum, s) => sum + s.amountPaid, 0);

  return (
    <>
      <TopNav />
      <div className="flex bg-gray-100 min-h-[100vh]">
        <div className="w-1/5 bg-white shadow-md flex flex-col h-[100vh]">
          <LeftBar />
        </div>

        <main className="w-4/5 p-6 overflow-y-auto">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">
            💰 Earnings Summary
          </h1>

          {/* Total Earnings */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-700">Total Earnings</h2>
              <p className="text-4xl font-bold text-green-600 mt-2">₹{totalEarnings}</p>
            </div>
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="earnings"
              className="w-20 h-20 object-contain"
            />
          </div>

          {/* Session History */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Session History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto text-left">
                <thead>
                  <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6">Mentee</th>
                    <th className="py-3 px-6">Amount</th>
                    <th className="py-3 px-6">Duration</th>
                    <th className="py-3 px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {dummySessions.map((session, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-6">{session.menteeName}</td>
                      <td className="py-3 px-6">₹{session.amountPaid}</td>
                      <td className="py-3 px-6">{session.duration}</td>
                      <td className="py-3 px-6">{session.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Earnings;