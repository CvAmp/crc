import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useStore } from './store';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthGuard } from './components/AuthGuard';
import { ImpersonationBar } from './components/ImpersonationBar';
import { Navigation } from './components/Navigation';
import { UserMenu } from './components/UserMenu';
import Calendar from './pages/Calendar';
import CreateAppointment from './pages/CreateAppointment';
import { AppointmentDetails } from './pages/AppointmentDetails';
import { CreateAcceleration } from './pages/CreateAcceleration';
import { Accelerations } from './pages/Accelerations';
import { ModifyAccelerations } from './pages/ModifyAccelerations';
import { ModifyAccess } from './pages/ModifyAccess';
import { ModifyAvailability } from './pages/ModifyAvailability';
import { ModifyWorkflows } from './pages/ModifyWorkflows';
import { ModifyTemplates } from './pages/ModifyTemplates';
import { ThemeProvider } from './components/ThemeProvider';
import { History } from './pages/History';
import { useEffect } from 'react';
import { WorkOrders } from './pages/WorkOrders';
import { TIVStatus } from './pages/TIVStatus';
import { MACDs } from './pages/MACDs';
import { HelpAndFAQ } from './pages/HelpAndFAQ';
import { Reports } from './pages/Reports';

function App() {
  const setUser = useStore((state) => state.setUser);

  useEffect(() => {
    // Set default admin user
    setUser({
      id: 'default-admin',
      email: 'admin@example.com',
      role: 'ADMIN',
      teamId: null
    });
  }, [setUser]);

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="*" element={
            <ErrorBoundary>
                <div className="min-h-screen bg-secondary-bg text-primary-text flex transition-colors duration-200">
                  <Navigation />
                  <main className="flex-1 ml-20 lg:ml-64">
                    <div className="sticky top-0 z-10 bg-primary-bg border-b border-secondary-bg px-6 py-4">
                      <div className="flex items-center justify-between">
                        <ImpersonationBar />
                        <UserMenu />
                      </div>
                    </div>
                    <div className="max-w-7xl mx-auto p-6">
                      <Routes>
                        <Route path="/" element={<Calendar />} />
                        <Route path="/create-appointment" element={<CreateAppointment />} />
                        <Route path="/appointment/:id" element={<AppointmentDetails />} />
                        <Route path="/accelerations" element={<Accelerations />} />
                        <Route path="/modify-accelerations" element={<ModifyAccelerations />} />
                        <Route path="/modify-access" element={<ModifyAccess />} />
                        <Route path="/modify-availability" element={<ModifyAvailability />} />
                        <Route path="/modify-workflows" element={<ModifyWorkflows />} />
                        <Route path="/modify-templates" element={<ModifyTemplates />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/work-orders" element={<WorkOrders />} />
                        <Route path="/tiv-status" element={<TIVStatus />} />
                        <Route path="/macds" element={<MACDs />} />
                        <Route path="/help-and-faq" element={<HelpAndFAQ />} />
                        <Route path="/reports" element={<Reports />} />
                      </Routes>
                    </div>
                  </main>
                </div>
            </ErrorBoundary>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App