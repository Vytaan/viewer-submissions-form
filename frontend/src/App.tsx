import { Route, Routes } from "react-router";
import { Layout } from "./components/Layout/Layout";
import { LoadingOverlay } from "./components/LoadingOverlay/LoadingOverlay";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import { Home } from "./pages/Home/Home";
import { Login } from "./pages/Login/Login";
import { Admin } from "./pages/Admin/Admin";
import { SubmissionSuccess } from "./pages/SubmissionSuccess/SubmissionSuccess";
import { ErrorPage } from "./pages/Error/Error";

export function App() {
    return (
        <>
            <LoadingOverlay />
            <ErrorBoundary>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/processSubmission" element={<SubmissionSuccess />} />
                        <Route path="*" element={<ErrorPage />} />
                    </Routes>
                </Layout>
            </ErrorBoundary>
        </>
    );
}
