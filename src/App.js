import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ClassesPage from "./pages/ClassesPage";
import StudentsPage from "./pages/StudentsPage";
import AddStudentPage from "./pages/AddStudentPage";
import RequiredDocsPage from "./pages/RequiredDocsPage";
import UploadDocPage from "./pages/UploadDocPage";
import ReviewDocPage from "./pages/ReviewDocPage";
import AdminDashboard from "./pages/AdminDashboard";
import PaymentPage from "./pages/PaymentPage";
import SchoolSetupPage from "./pages/SchoolSetupPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/add-student/:classId" element={<AddStudentPage />} />
        <Route path="/required-docs" element={<RequiredDocsPage />} />
        <Route path="/upload-doc" element={<UploadDocPage />} />
        <Route path="/review-doc" element={<ReviewDocPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/setup-school" element={<SchoolSetupPage />} />
      </Routes>
    </BrowserRouter>
  );
  }
