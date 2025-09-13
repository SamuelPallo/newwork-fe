import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProfileCard } from './components/ProfileCard';
import { ProfileEditor } from './components/ProfileEditor';
import { FeedbackComposer } from './components/FeedbackComposer';
import { FeedbackList } from './components/FeedbackList';
import { AbsenceForm } from './components/AbsenceForm';
import { AbsenceList } from './components/AbsenceList';
import { TeamDirectory } from './components/TeamDirectory';
import { LoginPage } from './pages/LoginPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/me" element={<ProfileCard />} />
      <Route path="/edit" element={<ProfileEditor />} />
      <Route path="/feedback" element={<FeedbackComposer />} />
      <Route path="/feedback-list" element={<FeedbackList />} />
      <Route path="/absence" element={<AbsenceForm />} />
      <Route path="/absences" element={<AbsenceList />} />
      <Route path="/team" element={<TeamDirectory />} />
      {/* Add more routes as needed */}
    </Routes>
  );
};

export default App;
