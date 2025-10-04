import React, { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import LeftBar from "../components/LeftBar";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db } from "../components/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [photoURL, setPhotoURL] = useState("");
  const [role, setRole] = useState("Mentee");
  const authInstance = getAuth();
  const storage = getStorage();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "Users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserData(data);
            setFormData(data);
            setPhotoURL(data.photoURL || "");
            setRole(data.role || "Mentee");
          }
        } catch (err) {
          toast.error("Failed to load profile data");
          console.error(err);
        }
      } else {
        navigate("/signin");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdate = async () => {
    try {
      const user = auth.currentUser;
      const ref = doc(db, "Users", user.uid);
      const dataToSave = { ...formData, photoURL };
      await setDoc(ref, dataToSave, { merge: true });
      toast.success("Profile updated!");
      setEditMode(false);
      const updatedSnap = await getDoc(ref);
      if (updatedSnap.exists()) setUserData(updatedSnap.data());
    } catch {
      toast.error("Update failed");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const user = auth.currentUser;
    const storageRef = ref(storage, `profilePhotos/${user.uid}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    setPhotoURL(downloadURL);
    setFormData((prev) => ({ ...prev, photoURL: downloadURL }));
    toast.success("Photo uploaded!");
  };

  const renderInput = (label, field, type = "text") => (
    <div className="flex flex-col">
      <label className="font-semibold mb-1">{label}</label>
      <input
        type={type}
        className="border p-2 rounded"
        value={formData[field] || ""}
        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
      />
    </div>
  );

  return (
    <>
      <TopNav />
      <div className="flex min-h-screen bg-gray-100">
        <div className="w-1/5 bg-white shadow-md flex flex-col h-[100vh]">
          <LeftBar />
        </div>

        <main className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-6">{role} Profile</h1>

          {!userData ? (
            <p>Loading...</p>
          ) : !editMode ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white shadow rounded-lg p-4 flex flex-col items-center">
                <img
                  src={
                    photoURL ||
                    `https://ui-avatars.com/api/?name=${userData.firstName || "U"}&background=0D8ABC&color=fff`
                  }
                  alt="Profile"
                  className="w-24 h-24 rounded-full mb-4"
                />
                <h2 className="text-xl font-semibold">{`${userData.firstName || ""} ${userData.middleName || ""} ${userData.lastName || ""}`}</h2>
                <p className="text-sm text-gray-500">{userData.email}</p>
              </div>

              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="font-bold mb-2">Academic Information 🎓</h3>
                <p><strong>Department:</strong> {userData.department}</p>
                <p><strong>Programme:</strong> {userData.programme}</p>
                <p><strong>Semester:</strong> {userData.semester}</p>
                <p><strong>Enrollment No:</strong> {userData.enrollmentNumber}</p>
                <p><strong>Enrollment Year:</strong> {userData.enrollmentYear}</p>
                <p><strong>Mentored By:</strong> {userData.mentoredBy}</p>
              </div>

              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="font-bold mb-2">Contact Info 📞</h3>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Phone:</strong> {userData.phone}</p>
                <p><strong>Address:</strong> {userData.address}</p>
              </div>

              <div className="bg-white shadow rounded-lg p-4 col-span-2">
                <h3 className="font-bold mb-2">Personal Details 🧍</h3>
                <p><strong>Gender:</strong> {userData.gender}</p>
                <p><strong>Blood Group:</strong> {userData.bloodGroup}</p>
                <p><strong>Home Place:</strong> {userData.homePlace}</p>
                <p><strong>Hobbies:</strong> {userData.hobbies}</p>
                <p><strong>Guardian:</strong> {userData.guardianName}</p>
                <p><strong>Guardian Phone:</strong> {userData.guardianPhone}</p>
                <p><strong>Guardian Address:</strong> {userData.guardianAddress}</p>
                <p><strong>Family Details:</strong> {userData.familyDetails}</p>
              </div>

              <div className="bg-white shadow rounded-lg p-4 col-span-2">
                <h3 className="font-bold mb-2">Hostel Info 🏨</h3>
                <p><strong>Hostel Boarder:</strong> {userData.hostelBoarder ? "Yes" : "No"}</p>
                {userData.hostelBoarder ? (
                  <>
                    <p><strong>Hostel Name:</strong> {userData.hostelName}</p>
                    <p><strong>Warden:</strong> {userData.wardenName}</p>
                    <p><strong>Warden Phone:</strong> {userData.wardenPhone}</p>
                  </>
                ) : (
                  <>
                    <p><strong>Contact Person:</strong> {userData.residenceContactName}</p>
                    <p><strong>Contact No:</strong> {userData.residenceContactPhone}</p>
                    <p><strong>Address:</strong> {userData.residenceContactAddress}</p>
                  </>
                )}
              </div>

              <div className="text-right col-span-3">
                <button
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  onClick={() => setEditMode(true)}
                >
                  Update Information
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded shadow-md">
              <h2 className="text-xl font-bold mb-4">Edit {role} Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  ["First Name", "firstName"],
                  ["Middle Name", "middleName"],
                  ["Last Name", "lastName"],
                  ["Email", "email"],
                  ["Phone Number", "phone"],
                  ["Address", "address"],
                  ["Department", "department"],
                  ["Programme", "programme"],
                  ["Semester", "semester"],
                  ["Enrollment No", "enrollmentNumber"],
                  ["Enrollment Year", "enrollmentYear"],
                  ["Mentored By", "mentoredBy"],
                  ["Gender", "gender"],
                  ["Blood Group", "bloodGroup"],
                  ["Home Place", "homePlace"],
                  ["Hobbies", "hobbies"],
                  ["Guardian Name", "guardianName"],
                  ["Guardian Phone", "guardianPhone"],
                  ["Guardian Address", "guardianAddress"],
                  ["Family Details", "familyDetails"],
                  ["Hostel Boarder", "hostelBoarder"],
                  ["Hostel Name", "hostelName"],
                  ["Warden Name", "wardenName"],
                  ["Warden Phone", "wardenPhone"],
                  ["Residence Contact Name", "residenceContactName"],
                  ["Residence Contact Phone", "residenceContactPhone"],
                  ["Residence Contact Address", "residenceContactAddress"],
                ].map(([label, field]) => renderInput(label, field))}
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Profile Photo</label>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button onClick={() => setEditMode(false)} className="bg-gray-400 text-white px-4 py-2 rounded">
                  Cancel
                </button>
                <button onClick={handleUpdate} className="bg-green-600 text-white px-4 py-2 rounded">
                  Save
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Profile;
