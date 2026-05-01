import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import AdminLoginPage from "./pages/AdminLoginPage";
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
        {/* ── Home ── */}
        <Route path="/" element={<HomePage />} />

        {/* ── Auth ── */}
        <Route path="/login" element={<LoginPage />} />          {/* ?role=school|teacher|student */}
        <Route path="/admin-login" element={<AdminLoginPage />} />

        {/* ── School onboarding ── */}
        <Route path="/setup-school" element={<SchoolSetupPage />} />
        <Route path="/payment" element={<PaymentPage />} />

        {/* ── School/Teacher dashboard ── */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/add-student/:classId" element={<AddStudentPage />} />
        <Route path="/required-docs" element={<RequiredDocsPage />} />
        <Route path="/review-doc" element={<ReviewDocPage />} />

        {/* ── Student ── */}
        <Route path="/upload-doc" element={<UploadDocPage />} />

        {/* ── Admin ── */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
